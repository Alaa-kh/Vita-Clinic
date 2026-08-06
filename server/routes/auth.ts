import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'node:crypto'
import { findUserByEmail, findUserById, getDb } from '../data/db.js'
import {
  requireAuth,
  signAccessToken,
  signRefreshToken,
  verifyToken,
  type AuthenticatedRequest,
} from '../middleware/auth.js'
import type { UserRole } from '../types.js'

export const authRouter = Router()

function toPublicUser(user: {
  id: string
  email: string
  fullName: string
  role: UserRole
  phone: string | null
  createdAt: string
}) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    phone: user.phone,
    createdAt: user.createdAt,
  }
}

authRouter.post('/register', (req, res) => {
  const { email, password, fullName, role, phone } = req.body as {
    email?: string
    password?: string
    fullName?: string
    role?: UserRole
    phone?: string
  }

  if (!email || !password || !fullName) {
    res.status(400).json({ message: 'Email, password, and full name are required', code: 'VALIDATION_ERROR' })
    return
  }

  if (password.length < 8) {
    res.status(400).json({ message: 'Password must be at least 8 characters', code: 'VALIDATION_ERROR' })
    return
  }

  if (findUserByEmail(email)) {
    res.status(409).json({ message: 'Email already registered', code: 'EMAIL_TAKEN' })
    return
  }

  const userRole: UserRole = role === 'provider' ? 'provider' : 'patient'
  const user = {
    id: randomUUID(),
    email: email.toLowerCase().trim(),
    passwordHash: bcrypt.hashSync(password, 10),
    fullName: fullName.trim(),
    role: userRole,
    phone: phone?.trim() || null,
    createdAt: new Date().toISOString(),
  }

  getDb().users.push(user)

  const tokenPayload = { sub: user.id, role: user.role, email: user.email }
  res.status(201).json({
    user: toPublicUser(user),
    accessToken: signAccessToken(tokenPayload),
    refreshToken: signRefreshToken(tokenPayload),
  })
})

authRouter.post('/login', (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string }

  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required', code: 'VALIDATION_ERROR' })
    return
  }

  const user = findUserByEmail(email)
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    res.status(401).json({ message: 'Invalid email or password', code: 'INVALID_CREDENTIALS' })
    return
  }

  const tokenPayload = { sub: user.id, role: user.role, email: user.email }
  res.json({
    user: toPublicUser(user),
    accessToken: signAccessToken(tokenPayload),
    refreshToken: signRefreshToken(tokenPayload),
  })
})

authRouter.get('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = findUserById(req.user!.id)
  if (!user) {
    res.status(404).json({ message: 'User not found', code: 'NOT_FOUND' })
    return
  }

  res.json({ user: toPublicUser(user) })
})

authRouter.post('/refresh', (req, res) => {
  const { refreshToken } = req.body as { refreshToken?: string }
  if (!refreshToken) {
    res.status(400).json({ message: 'Refresh token is required', code: 'VALIDATION_ERROR' })
    return
  }

  try {
    const payload = verifyToken(refreshToken)
    const user = findUserById(payload.sub)
    if (!user) {
      res.status(401).json({ message: 'Invalid refresh token', code: 'UNAUTHORIZED' })
      return
    }

    const tokenPayload = { sub: user.id, role: user.role, email: user.email }
    res.json({
      accessToken: signAccessToken(tokenPayload),
      refreshToken: signRefreshToken(tokenPayload),
      user: toPublicUser(user),
    })
  } catch {
    res.status(401).json({ message: 'Invalid or expired refresh token', code: 'UNAUTHORIZED' })
  }
})
