import { Router } from 'express'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { getDb, pushAudit } from '../data/db.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js'
import type { CurrencyCode, PaymentMethod } from '../types.js'

export const paymentsRouter = Router()

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const R = 6371
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

paymentsRouter.get('/mine', requireAuth, (req: AuthenticatedRequest, res) => {
  const db = getDb()
  const items = db.payments
    .filter((p) => p.userId === req.user!.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  res.json({ items })
})

paymentsRouter.get('/cards', requireAuth, (req: AuthenticatedRequest, res) => {
  const db = getDb()
  res.json({ items: db.savedCards.filter((c) => c.userId === req.user!.id) })
})

paymentsRouter.get('/invoices/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const db = getDb()
  const payment = db.payments.find((p) => p.id === req.params.id && p.userId === req.user!.id)
  if (!payment) {
    res.status(404).json({ message: 'Invoice not found', code: 'NOT_FOUND' })
    return
  }
  res.json({
    invoiceNumber: payment.invoiceNumber,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    method: payment.method,
    issuedAt: payment.createdAt,
    lineItems: [{ description: 'BARQ order', amount: payment.amount }],
  })
})

const checkoutSchema = z.object({
  amount: z.number().positive(),
  currency: z.enum(['USD', 'AED', 'SAR', 'EUR']).default('SAR'),
  method: z.enum(['card', 'apple_pay', 'google_pay', 'paypal', 'stripe']).default('stripe'),
  bookingId: z.string().uuid().nullable().optional(),
  subscription: z.boolean().optional(),
})

paymentsRouter.post('/checkout', requireAuth, async (req: AuthenticatedRequest, res) => {
  const parsed = checkoutSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation failed', code: 'VALIDATION' })
    return
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY
  const db = getDb()
  const invoiceNumber = `BARQ-${Date.now().toString(36).toUpperCase()}`

  let stripePaymentIntentId: string | null = null
  let clientSecret: string | null = null

  if (stripeKey) {
    try {
      const Stripe = (await import('stripe')).default
      const stripe = new Stripe(stripeKey)
      const intent = await stripe.paymentIntents.create({
        amount: Math.round(parsed.data.amount * 100),
        currency: parsed.data.currency.toLowerCase(),
        automatic_payment_methods: { enabled: true },
        metadata: {
          userId: req.user!.id,
          bookingId: parsed.data.bookingId ?? '',
          subscription: String(Boolean(parsed.data.subscription)),
        },
      })
      stripePaymentIntentId = intent.id
      clientSecret = intent.client_secret
    } catch (error) {
      console.error('Stripe error, falling back to mock checkout', error)
    }
  }

  const payment = {
    id: randomUUID(),
    userId: req.user!.id,
    bookingId: parsed.data.bookingId ?? null,
    orderId: null,
    amount: parsed.data.amount,
    currency: parsed.data.currency as CurrencyCode,
    status: 'succeeded' as const,
    method: parsed.data.method as PaymentMethod,
    stripePaymentIntentId,
    invoiceNumber,
    createdAt: new Date().toISOString(),
    refundedAt: null,
  }

  db.payments.push(payment)
  db.notifications.unshift({
    id: randomUUID(),
    userId: req.user!.id,
    title: 'Payment received',
    body: `Invoice ${invoiceNumber} · ${payment.amount} ${payment.currency}`,
    channel: 'email',
    read: false,
    scheduledFor: null,
    createdAt: new Date().toISOString(),
  })
  pushAudit(req.user!.id, 'payment.checkout', `payment:${payment.id}`, {
    amount: payment.amount,
    method: payment.method,
  })

  res.status(201).json({
    payment,
    clientSecret,
    mode: stripeKey && clientSecret ? 'stripe' : 'mock',
    wallets: ['apple_pay', 'google_pay', 'paypal'],
  })
})

paymentsRouter.post('/:id/refund', requireAuth, (req: AuthenticatedRequest, res) => {
  const db = getDb()
  const payment = db.payments.find((p) => p.id === req.params.id && p.userId === req.user!.id)
  if (!payment) {
    res.status(404).json({ message: 'Payment not found', code: 'NOT_FOUND' })
    return
  }
  if (payment.status === 'refunded') {
    res.status(409).json({ message: 'Already refunded', code: 'ALREADY_REFUNDED' })
    return
  }
  payment.status = 'refunded'
  payment.refundedAt = new Date().toISOString()
  pushAudit(req.user!.id, 'payment.refund', `payment:${payment.id}`, {})
  res.json(payment)
})

paymentsRouter.post('/webhooks/stripe', (req, res) => {
  pushAudit(null, 'payment.webhook', 'stripe', { type: req.body?.type ?? 'unknown' })
  res.json({ received: true })
})

export { haversineKm }
