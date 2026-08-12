import { Router } from 'express'
import { getDb } from '../data/db.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js'

export const platformRouter = Router()

platformRouter.get('/flags', (_req, res) => {
  res.json({ flags: getDb().featureFlags })
})

platformRouter.patch('/flags/:key', requireAuth, (req: AuthenticatedRequest, res) => {
  if (req.user!.role !== 'admin') {
    res.status(403).json({ message: 'Admin only', code: 'FORBIDDEN' })
    return
  }
  const db = getDb()
  const key = req.params.key
  if (!(key in db.featureFlags)) {
    res.status(404).json({ message: 'Flag not found', code: 'NOT_FOUND' })
    return
  }
  db.featureFlags[key] = Boolean(req.body?.enabled)
  res.json({ flags: db.featureFlags })
})

platformRouter.get('/cms/home', (_req, res) => {
  res.json({
    heroHeadline: 'BARQ',
    heroBody: 'Enterprise clinic platform with maps, payments, realtime care, and AI.',
    sections: [
      { id: 'maps', title: 'Maps & Location', path: '/platform/maps' },
      { id: 'booking', title: 'Booking', path: '/platform/booking' },
      { id: 'payments', title: 'Payments', path: '/platform/payments' },
      { id: 'realtime', title: 'Realtime', path: '/platform/chat' },
      { id: 'ai', title: 'AI', path: '/platform/ai' },
      { id: 'analytics', title: 'Analytics', path: '/platform/analytics' },
    ],
  })
})

platformRouter.get('/forms/booking', (_req, res) => {
  res.json({
    id: 'booking',
    fields: [
      { name: 'careId', type: 'select', required: true, labelKey: 'booking.care' },
      { name: 'date', type: 'date', required: true, labelKey: 'booking.date' },
      { name: 'slot', type: 'select', required: true, labelKey: 'booking.slot' },
      { name: 'notes', type: 'textarea', required: false, labelKey: 'booking.notes' },
    ],
  })
})

platformRouter.get('/tenancy', (_req, res) => {
  res.json({
    tenantId: process.env.TENANT_ID ?? 'barq-sa',
    name: 'BARQ Saudi',
    locales: ['en', 'ar'],
    currencies: ['SAR', 'AED', 'USD', 'EUR'],
    theme: 'barq-bolt',
  })
})

platformRouter.get('/monitoring/logs', requireAuth, (req: AuthenticatedRequest, res) => {
  if (req.user!.role !== 'admin' && req.user!.role !== 'provider') {
    res.status(403).json({ message: 'Forbidden', code: 'FORBIDDEN' })
    return
  }
  res.json({
    items: getDb()
      .auditLogs.slice(0, 50)
      .map((l) => ({
        id: l.id,
        level: 'info',
        message: `${l.action} on ${l.resource}`,
        at: l.createdAt,
      })),
  })
})
