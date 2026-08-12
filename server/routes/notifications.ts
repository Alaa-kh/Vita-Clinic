import { Router } from 'express'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { getDb, pushAudit } from '../data/db.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js'

export const notificationsRouter = Router()

notificationsRouter.get('/', requireAuth, (req: AuthenticatedRequest, res) => {
  const items = getDb()
    .notifications.filter((n) => n.userId === req.user!.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  res.json({
    items,
    unread: items.filter((n) => !n.read).length,
  })
})

notificationsRouter.post('/:id/read', requireAuth, (req: AuthenticatedRequest, res) => {
  const db = getDb()
  const item = db.notifications.find((n) => n.id === req.params.id && n.userId === req.user!.id)
  if (!item) {
    res.status(404).json({ message: 'Notification not found', code: 'NOT_FOUND' })
    return
  }
  item.read = true
  res.json(item)
})

notificationsRouter.post('/read-all', requireAuth, (req: AuthenticatedRequest, res) => {
  const db = getDb()
  for (const n of db.notifications) {
    if (n.userId === req.user!.id) n.read = true
  }
  res.json({ ok: true })
})

const scheduleSchema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(500),
  channel: z.enum(['in_app', 'email', 'sms', 'push']).default('in_app'),
  scheduledFor: z.string().datetime().nullable().optional(),
})

notificationsRouter.post('/schedule', requireAuth, (req: AuthenticatedRequest, res) => {
  const parsed = scheduleSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation failed', code: 'VALIDATION' })
    return
  }

  const item = {
    id: randomUUID(),
    userId: req.user!.id,
    title: parsed.data.title,
    body: parsed.data.body,
    channel: parsed.data.channel,
    read: false,
    scheduledFor: parsed.data.scheduledFor ?? null,
    createdAt: new Date().toISOString(),
  }
  getDb().notifications.unshift(item)
  pushAudit(req.user!.id, 'notification.schedule', `notification:${item.id}`, {
    channel: item.channel,
  })
  res.status(201).json(item)
})
