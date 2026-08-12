import { Router } from 'express'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { findUserByEmail, getDb, pushAudit } from '../data/db.js'
import {
  requireAuth,
  signAccessToken,
  signRefreshToken,
  type AuthenticatedRequest,
} from '../middleware/auth.js'

export const securityRouter = Router()

securityRouter.post('/otp/request', (req, res) => {
  const schema = z.object({ email: z.string().email() })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Valid email required', code: 'VALIDATION' })
    return
  }

  const code = String(Math.floor(100000 + Math.random() * 900000))
  const db = getDb()
  db.otps = db.otps.filter((o) => o.email !== parsed.data.email.toLowerCase())
  db.otps.push({
    email: parsed.data.email.toLowerCase(),
    code,
    expiresAt: Date.now() + 10 * 60_000,
  })
  pushAudit(null, 'otp.request', parsed.data.email, {})
  res.json({
    sent: true,
    channel: 'sms+email',
    demoCode: process.env.NODE_ENV === 'production' ? undefined : code,
  })
})

securityRouter.post('/otp/verify', (req, res) => {
  const schema = z.object({ email: z.string().email(), code: z.string().length(6) })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid payload', code: 'VALIDATION' })
    return
  }

  const db = getDb()
  const entry = db.otps.find((o) => o.email === parsed.data.email.toLowerCase())
  if (!entry || entry.expiresAt < Date.now() || entry.code !== parsed.data.code) {
    res.status(401).json({ message: 'Invalid OTP', code: 'INVALID_OTP' })
    return
  }

  db.otps = db.otps.filter((o) => o.email !== entry.email)
  res.json({ verified: true })
})

securityRouter.post('/2fa/enable', requireAuth, (req: AuthenticatedRequest, res) => {
  const db = getDb()
  const user = db.users.find((u) => u.id === req.user!.id)
  if (!user) {
    res.status(404).json({ message: 'User not found', code: 'NOT_FOUND' })
    return
  }
  user.totpSecret = randomUUID().replace(/-/g, '').slice(0, 16)
  user.totpEnabled = true
  pushAudit(user.id, '2fa.enable', `user:${user.id}`, {})
  res.json({ enabled: true, secret: user.totpSecret, qrPayload: `otpauth://totp/BARQ:${user.email}?secret=${user.totpSecret}&issuer=BARQ` })
})

securityRouter.post('/2fa/disable', requireAuth, (req: AuthenticatedRequest, res) => {
  const db = getDb()
  const user = db.users.find((u) => u.id === req.user!.id)
  if (!user) {
    res.status(404).json({ message: 'User not found', code: 'NOT_FOUND' })
    return
  }
  user.totpEnabled = false
  user.totpSecret = null
  pushAudit(user.id, '2fa.disable', `user:${user.id}`, {})
  res.json({ enabled: false })
})

securityRouter.get('/sessions', requireAuth, (req: AuthenticatedRequest, res) => {
  const items = getDb().sessions.filter((s) => s.userId === req.user!.id && !s.revokedAt)
  res.json({ items })
})

securityRouter.post('/sessions/register', requireAuth, (req: AuthenticatedRequest, res) => {
  const schema = z.object({
    deviceLabel: z.string().min(1).max(80).default('Web'),
  })
  const parsed = schema.safeParse(req.body ?? {})
  const session = {
    id: randomUUID(),
    userId: req.user!.id,
    deviceLabel: parsed.success ? parsed.data.deviceLabel : 'Web',
    ip: req.ip ?? '127.0.0.1',
    userAgent: String(req.headers['user-agent'] ?? 'unknown'),
    lastActiveAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    revokedAt: null,
  }
  getDb().sessions.unshift(session)
  res.status(201).json(session)
})

securityRouter.post('/sessions/:id/revoke', requireAuth, (req: AuthenticatedRequest, res) => {
  const session = getDb().sessions.find((s) => s.id === req.params.id && s.userId === req.user!.id)
  if (!session) {
    res.status(404).json({ message: 'Session not found', code: 'NOT_FOUND' })
    return
  }
  session.revokedAt = new Date().toISOString()
  pushAudit(req.user!.id, 'session.revoke', `session:${session.id}`, {})
  res.json(session)
})

securityRouter.get('/audit', requireAuth, (req: AuthenticatedRequest, res) => {
  const role = req.user!.role
  const logs = getDb().auditLogs.filter((l) => role === 'admin' || l.userId === req.user!.id)
  res.json({ items: logs.slice(0, 100) })
})

securityRouter.get('/permissions', requireAuth, (req: AuthenticatedRequest, res) => {
  const role = req.user!.role
  const matrix: Record<string, string[]> = {
    customer: ['product.read', 'cart.write', 'order.write', 'payment.write', 'chat.write', 'maps.read'],
    merchant: [
      'product.read',
      'product.write',
      'order.read',
      'analytics.read',
      'chat.write',
      'maps.read',
    ],
    courier: ['order.read', 'order.track', 'maps.read', 'chat.write'],
    admin: ['*'],
  }
  res.json({ role, permissions: matrix[role] ?? [] })
})

securityRouter.post('/oauth/:provider', async (req, res) => {
  const provider = req.params.provider
  if (provider !== 'google' && provider !== 'apple') {
    res.status(400).json({ message: 'Unsupported provider', code: 'VALIDATION' })
    return
  }

  const schema = z.object({
    email: z.string().email(),
    fullName: z.string().min(2),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation failed', code: 'VALIDATION' })
    return
  }

  const db = getDb()
  let user = findUserByEmail(parsed.data.email)
  if (!user) {
    user = {
      id: randomUUID(),
      email: parsed.data.email.toLowerCase(),
      passwordHash: bcrypt.hashSync(randomUUID(), 10),
      fullName: parsed.data.fullName,
      role: 'patient',
      phone: null,
      totpSecret: null,
      totpEnabled: false,
      oauthProvider: provider,
      createdAt: new Date().toISOString(),
    }
    db.users.push(user)
  } else {
    user.oauthProvider = provider
  }

  const payload = { sub: user.id, role: user.role, email: user.email }
  pushAudit(user.id, 'oauth.login', `user:${user.id}`, { provider })
  res.json({
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      phone: user.phone,
      createdAt: user.createdAt,
    },
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  })
})

securityRouter.get('/captcha/challenge', (_req, res) => {
  const a = Math.floor(Math.random() * 8) + 1
  const b = Math.floor(Math.random() * 8) + 1
  const token = Buffer.from(`${a}+${b}=${a + b}`).toString('base64url')
  res.json({ question: `${a} + ${b}`, token })
})

securityRouter.post('/captcha/verify', (req, res) => {
  const schema = z.object({ token: z.string(), answer: z.number().int() })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid captcha', code: 'VALIDATION' })
    return
  }
  try {
    const decoded = Buffer.from(parsed.data.token, 'base64url').toString('utf8')
    const expected = Number(decoded.split('=')[1])
    res.json({ ok: expected === parsed.data.answer })
  } catch {
    res.status(400).json({ message: 'Invalid captcha token', code: 'VALIDATION' })
  }
})
