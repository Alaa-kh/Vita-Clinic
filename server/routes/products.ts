import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { findProductById, getDb, pushAudit } from '../data/db.js'
import { coordsForCity } from '../data/platformSeed.js'
import {
  optionalAuth,
  requireAuth,
  requireMerchant,
  type AuthenticatedRequest,
} from '../middleware/auth.js'
import type { CurrencyCode, Fulfillment, ProductCategory, ProductStatus } from '../types.js'

export const productsRouter = Router()

productsRouter.get('/', optionalAuth, (req: AuthenticatedRequest, res) => {
  const {
    q,
    category,
    fulfillment,
    city,
    status,
    minPrice,
    maxPrice,
    featured,
    page = '1',
    pageSize = '12',
  } = req.query as Record<string, string | undefined>

  let items = [...getDb().products]

  if (q) {
    const term = q.toLowerCase().trim()
    items = items.filter((item) => {
      const haystack = [
        item.title,
        item.titleAr,
        item.description,
        item.descriptionAr,
        item.storeName,
        item.storeNameAr,
        item.city,
        ...item.tags,
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(term)
    })
  }

  if (category) items = items.filter((item) => item.category === category)
  if (fulfillment) items = items.filter((item) => item.fulfillment === fulfillment || item.fulfillment === 'both')
  if (city) items = items.filter((item) => item.city.toLowerCase() === city.toLowerCase())
  if (status) items = items.filter((item) => item.status === status)
  else items = items.filter((item) => item.status !== 'out_of_stock')
  if (minPrice) items = items.filter((item) => item.price >= Number(minPrice))
  if (maxPrice) items = items.filter((item) => item.price <= Number(maxPrice))
  if (featured === 'true') items = items.filter((item) => item.featured)

  items.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))

  const pageNumber = Math.max(1, Number(page) || 1)
  const size = Math.min(50, Math.max(1, Number(pageSize) || 12))
  const start = (pageNumber - 1) * size
  const paged = items.slice(start, start + size)

  const favoriteIds = new Set(
    req.user
      ? getDb()
          .favorites.filter((f) => f.userId === req.user!.id)
          .map((f) => f.careId)
      : [],
  )

  res.json({
    items: paged.map((item) => ({ ...item, isFavorite: favoriteIds.has(item.id) })),
    pagination: {
      page: pageNumber,
      pageSize: size,
      total: items.length,
      totalPages: Math.ceil(items.length / size) || 1,
    },
  })
})

productsRouter.get('/:id', optionalAuth, (req: AuthenticatedRequest, res) => {
  const item = findProductById(req.params.id!)
  if (!item) {
    res.status(404).json({ message: 'Product not found', code: 'NOT_FOUND' })
    return
  }
  const isFavorite = req.user
    ? getDb().favorites.some((f) => f.userId === req.user!.id && f.careId === item.id)
    : false
  res.json({ product: { ...item, isFavorite } })
})

productsRouter.post('/', requireAuth, requireMerchant, (req: AuthenticatedRequest, res) => {
  const body = req.body as Partial<{
    title: string
    titleAr: string
    description: string
    descriptionAr: string
    price: number
    currency: CurrencyCode
    category: ProductCategory
    fulfillment: Fulfillment
    stock: number
    storeName: string
    storeNameAr: string
    city: string
    country: string
    address: string
    images: string[]
    tags: string[]
    featured: boolean
    prepMinutes: number
  }>

  if (!body.title || !body.description || body.price == null || !body.storeName) {
    res.status(400).json({ message: 'Missing required product fields', code: 'VALIDATION_ERROR' })
    return
  }

  const now = new Date().toISOString()
  const city = (body.city ?? 'Riyadh').trim()
  const coords = coordsForCity(city)
  const stock = Number(body.stock ?? 20)
  const product = {
    id: randomUUID(),
    title: body.title.trim(),
    titleAr: (body.titleAr ?? body.title).trim(),
    description: body.description.trim(),
    descriptionAr: (body.descriptionAr ?? body.description).trim(),
    price: Number(body.price),
    currency: body.currency ?? 'SAR',
    category: body.category ?? 'home',
    fulfillment: body.fulfillment ?? 'delivery',
    status: (stock <= 0 ? 'out_of_stock' : stock < 10 ? 'low_stock' : 'in_stock') as ProductStatus,
    stock,
    storeName: body.storeName.trim(),
    storeNameAr: (body.storeNameAr ?? body.storeName).trim(),
    city,
    country: (body.country ?? 'Saudi Arabia').trim(),
    address: (body.address ?? '').trim(),
    images:
      body.images?.filter(Boolean).length
        ? body.images.filter(Boolean)
        : ['https://images.pexels.com/photos/4393021/pexels-photo-4393021.jpeg?auto=compress&cs=tinysrgb&w=1200'],
    tags: body.tags?.map((tag) => tag.trim()).filter(Boolean) ?? [],
    merchantId: req.user!.id,
    featured: Boolean(body.featured),
    rating: 4.5,
    prepMinutes: Number(body.prepMinutes ?? 30),
    lat: coords.lat,
    lng: coords.lng,
    createdAt: now,
    updatedAt: now,
  }

  getDb().products.unshift(product)
  getDb().care = getDb().products
  pushAudit(req.user!.id, 'product.create', `product:${product.id}`, {})
  res.status(201).json({ product: { ...product, isFavorite: false } })
})
