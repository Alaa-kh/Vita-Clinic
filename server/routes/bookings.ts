import { Router } from 'express'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { getDb, pushAudit } from '../data/db.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js'
import type { BookingRecurrence, BookingStatus } from '../types.js'

export const bookingsRouter = Router()

const SLOTS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']

const createSchema = z.object({
  careId: z.string().uuid(),
  branchId: z.string().uuid().nullable().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slot: z.string(),
  recurrence: z.enum(['none', 'weekly', 'biweekly', 'monthly']).default('none'),
  notes: z.string().max(500).nullable().optional(),
})

bookingsRouter.get('/slots', (_req, res) => {
  res.json({ slots: SLOTS })
})

bookingsRouter.get('/availability', (req, res) => {
  const date = String(req.query.date ?? '')
  const careId = String(req.query.careId ?? '')
  const db = getDb()
  const taken = new Set(
    db.bookings
      .filter(
        (b) =>
          b.date === date &&
          b.careId === careId &&
          b.status !== 'cancelled',
      )
      .map((b) => b.slot),
  )
  res.json({
    date,
    careId,
    slots: SLOTS.map((slot) => ({ slot, available: !taken.has(slot) })),
  })
})

bookingsRouter.get('/mine', requireAuth, (req: AuthenticatedRequest, res) => {
  const db = getDb()
  const items = db.bookings
    .filter((b) => b.userId === req.user!.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  res.json({ items })
})

bookingsRouter.post('/', requireAuth, (req: AuthenticatedRequest, res) => {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation failed', code: 'VALIDATION', details: parsed.error.flatten() })
    return
  }

  const db = getDb()
  const care = db.products.find((c) => c.id === parsed.data.careId)
  if (!care) {
    res.status(404).json({ message: 'Care not found', code: 'NOT_FOUND' })
    return
  }

  const conflict = db.bookings.some(
    (b) =>
      b.careId === parsed.data.careId &&
      b.date === parsed.data.date &&
      b.slot === parsed.data.slot &&
      b.status !== 'cancelled',
  )
  if (conflict) {
    res.status(409).json({ message: 'Slot unavailable', code: 'SLOT_TAKEN' })
    return
  }

  const reminderAt = new Date(`${parsed.data.date}T${parsed.data.slot}:00`)
  reminderAt.setHours(reminderAt.getHours() - 2)

  const booking = {
    id: randomUUID(),
    userId: req.user!.id,
    careId: parsed.data.careId,
    branchId: parsed.data.branchId ?? null,
    date: parsed.data.date,
    slot: parsed.data.slot,
    status: 'confirmed' as BookingStatus,
    recurrence: parsed.data.recurrence as BookingRecurrence,
    notes: parsed.data.notes ?? null,
    reminderAt: reminderAt.toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  db.bookings.push(booking)
  db.notifications.unshift({
    id: randomUUID(),
    userId: req.user!.id,
    title: 'Booking confirmed',
    body: `${care.title} on ${booking.date} at ${booking.slot}`,
    channel: 'in_app',
    read: false,
    scheduledFor: booking.reminderAt,
    createdAt: new Date().toISOString(),
  })
  pushAudit(req.user!.id, 'booking.create', `booking:${booking.id}`, { careId: care.id })

  res.status(201).json(booking)
})

bookingsRouter.patch('/:id/status', requireAuth, (req: AuthenticatedRequest, res) => {
  const status = z.enum(['pending', 'confirmed', 'cancelled', 'completed']).safeParse(req.body.status)
  if (!status.success) {
    res.status(400).json({ message: 'Invalid status', code: 'VALIDATION' })
    return
  }

  const db = getDb()
  const booking = db.bookings.find((b) => b.id === req.params.id && b.userId === req.user!.id)
  if (!booking) {
    res.status(404).json({ message: 'Booking not found', code: 'NOT_FOUND' })
    return
  }

  booking.status = status.data
  booking.updatedAt = new Date().toISOString()
  pushAudit(req.user!.id, 'booking.status', `booking:${booking.id}`, { status: status.data })
  res.json(booking)
})
