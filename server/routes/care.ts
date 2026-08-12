import { Router } from 'express'
import { findProductById, getDb } from '../data/db.js'
import { optionalAuth, requireAuth, requireMerchant, type AuthenticatedRequest } from '../middleware/auth.js'

/**
 * Legacy `/api/care` adapter — maps products into the older care DTO shape
 * so remaining platform modules keep working during the VitaGo migration.
 */
export const careRouter = Router()

function toCareDto(product: ReturnType<typeof findProductById>, isFavorite: boolean) {
  if (!product) return null
  return {
    id: product.id,
    title: product.title,
    description: product.description,
    price: product.price,
    currency: product.currency,
    careMode:
      product.fulfillment === 'pickup'
        ? 'in_person'
        : product.fulfillment === 'both'
          ? 'home_visit'
          : 'telehealth',
    specialty: product.category === 'food' || product.category === 'grocery' ? 'general' : 'dermatology',
    status:
      product.status === 'out_of_stock'
        ? 'unavailable'
        : product.status === 'low_stock'
          ? 'busy'
          : 'available',
    experienceYears: product.prepMinutes,
    languages: ['Arabic', 'English'],
    city: product.city,
    country: product.country,
    clinicName: product.storeName,
    address: product.address,
    images: product.images,
    tags: product.tags,
    providerId: product.merchantId,
    featured: product.featured,
    lat: product.lat,
    lng: product.lng,
    isFavorite,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }
}

careRouter.get('/', optionalAuth, (req: AuthenticatedRequest, res) => {
  const { q, city, featured, page = '1', pageSize = '12', specialty, careMode, minPrice, maxPrice } =
    req.query as Record<string, string | undefined>

  let items = [...getDb().products]
  if (q) {
    const term = q.toLowerCase()
    items = items.filter(
      (item) =>
        item.title.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.tags.some((t) => t.toLowerCase().includes(term)),
    )
  }
  if (city) items = items.filter((i) => i.city.toLowerCase() === city.toLowerCase())
  if (featured === 'true') items = items.filter((i) => i.featured)
  if (minPrice) items = items.filter((i) => i.price >= Number(minPrice))
  if (maxPrice) items = items.filter((i) => i.price <= Number(maxPrice))
  if (specialty === 'dentistry' || specialty === 'general') {
    items = items.filter((i) => i.category === 'food' || i.category === 'grocery' || i.category === 'pharmacy')
  }
  if (careMode === 'telehealth') items = items.filter((i) => i.fulfillment === 'delivery')
  if (careMode === 'in_person') items = items.filter((i) => i.fulfillment !== 'delivery')

  const pageNumber = Math.max(1, Number(page) || 1)
  const size = Math.min(50, Math.max(1, Number(pageSize) || 12))
  const start = (pageNumber - 1) * size
  const favoriteIds = new Set(
    req.user ? getDb().favorites.filter((f) => f.userId === req.user!.id).map((f) => f.careId) : [],
  )

  const paged = items.slice(start, start + size)
  res.json({
    items: paged.map((p) => toCareDto(p, favoriteIds.has(p.id))),
    pagination: {
      page: pageNumber,
      pageSize: size,
      total: items.length,
      totalPages: Math.ceil(items.length / size) || 1,
    },
  })
})

careRouter.get('/:id', optionalAuth, (req: AuthenticatedRequest, res) => {
  const item = findProductById(req.params.id!)
  if (!item) {
    res.status(404).json({ message: 'Care listing not found', code: 'NOT_FOUND' })
    return
  }
  const isFavorite = req.user
    ? getDb().favorites.some((f) => f.userId === req.user!.id && f.careId === item.id)
    : false
  res.json({ care: toCareDto(item, isFavorite) })
})

careRouter.post('/', requireAuth, requireMerchant, (_req, res) => {
  res.status(410).json({
    message: 'Use POST /api/products to create store listings',
    code: 'GONE',
  })
})
