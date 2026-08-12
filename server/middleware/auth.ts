import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { findUserById } from '../data/db.js'
import type { UserRole } from '../types.js'

const JWT_SECRET = process.env.JWT_SECRET ?? 'barq-hub-dev-secret-change-in-production'

export interface AuthTokenPayload {
  sub: string
  role: UserRole
  email: string
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    role: UserRole
    email: string
    fullName: string
  }
}

export function signAccessToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' })
}

export function signRefreshToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, JWT_SECRET) as AuthTokenPayload
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authentication required', code: 'UNAUTHORIZED' })
    return
  }

  const token = header.slice('Bearer '.length)

  try {
    const payload = verifyToken(token)
    const user = findUserById(payload.sub)
    if (!user) {
      res.status(401).json({ message: 'Invalid session', code: 'UNAUTHORIZED' })
      return
    }

    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
      fullName: user.fullName,
    }
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired token', code: 'UNAUTHORIZED' })
  }
}

export function requireMerchant(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required', code: 'UNAUTHORIZED' })
    return
  }

  if (req.user.role !== 'merchant' && req.user.role !== 'admin') {
    res.status(403).json({ message: 'Merchant role required', code: 'FORBIDDEN' })
    return
  }

  next()
}

/** @deprecated use requireMerchant */
export const requireProvider = requireMerchant

export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    next()
    return
  }

  try {
    const payload = verifyToken(header.slice('Bearer '.length))
    const user = findUserById(payload.sub)
    if (user) {
      req.user = {
        id: user.id,
        role: user.role,
        email: user.email,
        fullName: user.fullName,
      }
    }
  } catch {
    // Optional auth ignores invalid tokens
  }

  next()
}
