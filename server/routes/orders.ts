import { Router } from 'express'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { findProductById, getDb, getOrCreateCart, pushAudit } from '../data/db.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js'
import type { OrderStatus, ProductRecord } from '../types.js'
import { haversineKm } from './payments.js'

export const cartRouter = Router()
export const ordersRouter = Router()

function prefersArabic(req: AuthenticatedRequest): boolean {
  const header = String(req.headers['accept-language'] ?? '')
  return header.toLowerCase().startsWith('ar')
}

function localizedProductTitle(product: ProductRecord, arabic: boolean): string {
  return arabic ? product.titleAr || product.title : product.title
}

function localizedStoreName(product: ProductRecord, arabic: boolean): string {
  return arabic ? product.storeNameAr || product.storeName : product.storeName
}

cartRouter.get('/', requireAuth, (req: AuthenticatedRequest, res) => {
  const arabic = prefersArabic(req)
  const cart = getOrCreateCart(req.user!.id)
  const items = cart.items
    .map((line) => {
      const product = findProductById(line.productId)
      if (!product) return null
      return {
        productId: product.id,
        title: localizedProductTitle(product, arabic),
        price: product.price,
        currency: product.currency,
        image: product.images[0] ?? null,
        quantity: line.quantity,
        lineTotal: product.price * line.quantity,
        prepMinutes: product.prepMinutes,
        storeName: localizedStoreName(product, arabic),
        merchantId: product.merchantId,
        lat: product.lat,
        lng: product.lng,
      }
    })
    .filter(Boolean)

  const subtotal = items.reduce((sum, i) => sum + (i?.lineTotal ?? 0), 0)
  res.json({
    items,
    subtotal,
    currency: items[0]?.currency ?? 'SAR',
    itemCount: items.reduce((sum, i) => sum + (i?.quantity ?? 0), 0),
  })
})

cartRouter.post('/items', requireAuth, (req: AuthenticatedRequest, res) => {
  const schema = z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1).max(99).default(1),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation failed', code: 'VALIDATION' })
    return
  }

  const product = findProductById(parsed.data.productId)
  if (!product || product.status === 'out_of_stock') {
    res.status(404).json({ message: 'Product unavailable', code: 'NOT_FOUND' })
    return
  }

  const cart = getOrCreateCart(req.user!.id)
  const existing = cart.items.find((i) => i.productId === product.id)
  if (existing) existing.quantity = Math.min(99, existing.quantity + parsed.data.quantity)
  else cart.items.push({ productId: product.id, quantity: parsed.data.quantity })
  cart.updatedAt = new Date().toISOString()
  pushAudit(req.user!.id, 'cart.add', `product:${product.id}`, { qty: parsed.data.quantity })
  res.status(201).json({ ok: true })
})

cartRouter.patch('/items/:productId', requireAuth, (req: AuthenticatedRequest, res) => {
  const quantity = Number(req.body?.quantity)
  if (!Number.isFinite(quantity) || quantity < 0 || quantity > 99) {
    res.status(400).json({ message: 'Invalid quantity', code: 'VALIDATION' })
    return
  }
  const cart = getOrCreateCart(req.user!.id)
  if (quantity === 0) {
    cart.items = cart.items.filter((i) => i.productId !== req.params.productId)
  } else {
    const line = cart.items.find((i) => i.productId === req.params.productId)
    if (!line) {
      res.status(404).json({ message: 'Cart item not found', code: 'NOT_FOUND' })
      return
    }
    line.quantity = quantity
  }
  cart.updatedAt = new Date().toISOString()
  res.json({ ok: true })
})

cartRouter.delete('/', requireAuth, (req: AuthenticatedRequest, res) => {
  const cart = getOrCreateCart(req.user!.id)
  cart.items = []
  cart.updatedAt = new Date().toISOString()
  res.json({ ok: true })
})

ordersRouter.get('/mine', requireAuth, (req: AuthenticatedRequest, res) => {
  const db = getDb()
  const items = db.orders
    .filter(
      (o) =>
        o.userId === req.user!.id ||
        o.merchantId === req.user!.id ||
        o.courierId === req.user!.id ||
        req.user!.role === 'admin',
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  res.json({ items })
})

ordersRouter.get('/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const order = getDb().orders.find((o) => o.id === req.params.id)
  if (!order) {
    res.status(404).json({ message: 'Order not found', code: 'NOT_FOUND' })
    return
  }
  const allowed =
    order.userId === req.user!.id ||
    order.merchantId === req.user!.id ||
    order.courierId === req.user!.id ||
    req.user!.role === 'admin'
  if (!allowed) {
    res.status(403).json({ message: 'Forbidden', code: 'FORBIDDEN' })
    return
  }
  res.json({ order })
})

ordersRouter.post('/checkout', requireAuth, (req: AuthenticatedRequest, res) => {
  const schema = z.object({
    deliveryAddress: z.string().min(5).max(240),
    city: z.string().min(2).max(80).default('Riyadh'),
    lat: z.number().optional(),
    lng: z.number().optional(),
    notes: z.string().max(400).nullable().optional(),
    paymentMethod: z.enum(['card', 'apple_pay', 'google_pay', 'paypal', 'stripe']).default('stripe'),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation failed', code: 'VALIDATION' })
    return
  }

  const db = getDb()
  const cart = getOrCreateCart(req.user!.id)
  if (!cart.items.length) {
    res.status(400).json({ message: 'Cart is empty', code: 'EMPTY_CART' })
    return
  }

  const lines = cart.items
    .map((line) => {
      const product = findProductById(line.productId)
      if (!product) return null
      return { product, quantity: line.quantity }
    })
    .filter(Boolean) as Array<{ product: NonNullable<ReturnType<typeof findProductById>>; quantity: number }>

  if (!lines.length) {
    res.status(400).json({ message: 'Cart products unavailable', code: 'EMPTY_CART' })
    return
  }

  const primary = lines[0]!.product
  const dropLat = parsed.data.lat ?? primary.lat + 0.02
  const dropLng = parsed.data.lng ?? primary.lng + 0.015
  const distanceKm = haversineKm({ lat: primary.lat, lng: primary.lng }, { lat: dropLat, lng: dropLng })
  const deliveryFee = distanceKm < 3 ? 8 : distanceKm < 8 ? 14 : 22
  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0)
  const maxPrep = Math.max(...lines.map((l) => l.product.prepMinutes))
  const etaMinutes = maxPrep + Math.round((distanceKm / 32) * 60)
  const courier = db.users.find((u) => u.role === 'courier')
  const now = new Date()
  const etaAt = new Date(now.getTime() + etaMinutes * 60_000).toISOString()

  const order = {
    id: randomUUID(),
    userId: req.user!.id,
    merchantId: primary.merchantId,
    courierId: courier?.id ?? null,
    items: lines.map((l) => ({
      productId: l.product.id,
      title: l.product.title,
      quantity: l.quantity,
      unitPrice: l.product.price,
      currency: l.product.currency,
    })),
    status: 'confirmed' as OrderStatus,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    currency: primary.currency,
    deliveryAddress: parsed.data.deliveryAddress,
    city: parsed.data.city,
    lat: dropLat,
    lng: dropLng,
    notes: parsed.data.notes ?? null,
    etaMinutes,
    etaAt,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  }

  db.orders.unshift(order)
  cart.items = []
  cart.updatedAt = now.toISOString()

  const invoiceNumber = `VG-${Date.now().toString(36).toUpperCase()}`
  db.payments.push({
    id: randomUUID(),
    userId: req.user!.id,
    bookingId: null,
    orderId: order.id,
    amount: order.total,
    currency: order.currency,
    status: 'succeeded',
    method: parsed.data.paymentMethod,
    stripePaymentIntentId: null,
    invoiceNumber,
    createdAt: now.toISOString(),
    refundedAt: null,
  })

  db.notifications.unshift({
    id: randomUUID(),
    userId: req.user!.id,
    title: 'Order confirmed',
    body: `Order ${order.id.slice(0, 8)} · ETA ${etaMinutes} min`,
    channel: 'push',
    read: false,
    scheduledFor: null,
    createdAt: now.toISOString(),
  })

  if (courier) {
    db.liveTracks = db.liveTracks.filter((t) => t.userId !== courier.id)
    db.liveTracks.push({
      id: randomUUID(),
      userId: courier.id,
      orderId: order.id,
      lat: primary.lat,
      lng: primary.lng,
      heading: 45,
      speed: 28,
      updatedAt: now.toISOString(),
    })
  }

  pushAudit(req.user!.id, 'order.checkout', `order:${order.id}`, { total: order.total })
  res.status(201).json({ order, invoiceNumber })
})

ordersRouter.patch('/:id/status', requireAuth, (req: AuthenticatedRequest, res) => {
  const status = z
    .enum(['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'])
    .safeParse(req.body?.status)
  if (!status.success) {
    res.status(400).json({ message: 'Invalid status', code: 'VALIDATION' })
    return
  }

  const order = getDb().orders.find((o) => o.id === req.params.id)
  if (!order) {
    res.status(404).json({ message: 'Order not found', code: 'NOT_FOUND' })
    return
  }

  const role = req.user!.role
  const allowed =
    role === 'admin' ||
    role === 'merchant' ||
    role === 'courier' ||
    (role === 'customer' && status.data === 'cancelled' && order.userId === req.user!.id)
  if (!allowed) {
    res.status(403).json({ message: 'Forbidden', code: 'FORBIDDEN' })
    return
  }

  order.status = status.data
  order.updatedAt = new Date().toISOString()
  pushAudit(req.user!.id, 'order.status', `order:${order.id}`, { status: status.data })
  res.json({ order })
})

ordersRouter.get('/:id/track', requireAuth, (req: AuthenticatedRequest, res) => {
  const order = getDb().orders.find((o) => o.id === req.params.id)
  if (!order) {
    res.status(404).json({ message: 'Order not found', code: 'NOT_FOUND' })
    return
  }
  const track = getDb().liveTracks.find((t) => t.orderId === order.id)
  const store = order.items[0] ? findProductById(order.items[0].productId) : null
  res.json({
    order,
    courier: track ?? null,
    store: store
      ? { lat: store.lat, lng: store.lng, name: store.storeName }
      : { lat: order.lat, lng: order.lng, name: 'Store' },
    dropoff: { lat: order.lat, lng: order.lng, address: order.deliveryAddress },
  })
})
