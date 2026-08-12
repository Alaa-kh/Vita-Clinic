import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { findCareById, getDb } from '../data/db.js'
import {
  optionalAuth,
  requireProvider,
  requireAuth,
  type AuthenticatedRequest,
} from '../middleware/auth.js'
import type { CareMode, CareStatus, CurrencyCode, Specialty } from '../types.js'

export const careRouter = Router()

careRouter.get('/', optionalAuth, (req: AuthenticatedRequest, res) => {
  const {
    q,
    specialty,
    careMode,
    city,
    status,
    minPrice,
    maxPrice,
    featured,
    page = '1',
    pageSize = '12',
  } = req.query as Record<string, string | undefined>

  let items = [...getDb().care]

  if (q) {
    const term = q.toLowerCase()
    items = items.filter(
      (item) =>
        item.title.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.clinicName.toLowerCase().includes(term) ||
        item.city.toLowerCase().includes(term) ||
        item.tags.some((tag) => tag.toLowerCase().includes(term)),
    )
  }

  if (specialty) {
    items = items.filter((item) => item.specialty === specialty)
  }

  if (careMode) {
    items = items.filter((item) => item.careMode === careMode)
  }

  if (city) {
    items = items.filter((item) => item.city.toLowerCase() === city.toLowerCase())
  }

  if (status) {
    items = items.filter((item) => item.status === status)
  } else {
    items = items.filter((item) => item.status !== 'unavailable')
  }

  if (minPrice) {
    items = items.filter((item) => item.price >= Number(minPrice))
  }

  if (maxPrice) {
    items = items.filter((item) => item.price <= Number(maxPrice))
  }

  if (featured === 'true') {
    items = items.filter((item) => item.featured)
  }

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
    items: paged.map((item) => ({
      ...item,
      isFavorite: favoriteIds.has(item.id),
    })),
    pagination: {
      page: pageNumber,
      pageSize: size,
      total: items.length,
      totalPages: Math.ceil(items.length / size) || 1,
    },
  })
})

careRouter.get('/:id', optionalAuth, (req: AuthenticatedRequest, res) => {
  const item = findCareById(req.params.id!)
  if (!item) {
    res.status(404).json({ message: 'Care listing not found', code: 'NOT_FOUND' })
    return
  }

  const isFavorite = req.user
    ? getDb().favorites.some((f) => f.userId === req.user!.id && f.careId === item.id)
    : false

  res.json({ care: { ...item, isFavorite } })
})

careRouter.post('/', requireAuth, requireProvider, (req: AuthenticatedRequest, res) => {
  const body = req.body as Partial<{
    title: string
    description: string
    price: number
    currency: CurrencyCode
    careMode: CareMode
    specialty: Specialty
    experienceYears: number
    languages: string[]
    city: string
    country: string
    clinicName: string
    address: string
    images: string[]
    tags: string[]
    featured: boolean
  }>

  if (!body.title || !body.description || body.price == null || !body.clinicName) {
    res.status(400).json({ message: 'Missing required care fields', code: 'VALIDATION_ERROR' })
    return
  }

  const now = new Date().toISOString()
  const care = {
    id: randomUUID(),
    title: body.title.trim(),
    description: body.description.trim(),
    price: Number(body.price),
    currency: body.currency ?? 'USD',
    careMode: body.careMode ?? 'in_person',
    specialty: body.specialty ?? 'general',
    status: 'available' as CareStatus,
    experienceYears: Number(body.experienceYears ?? 1),
    languages: body.languages?.map((l) => l.trim()).filter(Boolean) ?? ['English'],
    city: (body.city ?? '').trim(),
    country: (body.country ?? '').trim(),
    clinicName: body.clinicName.trim(),
    address: (body.address ?? '').trim(),
    images:
      body.images?.filter(Boolean).length
        ? body.images.filter(Boolean)
        : ['https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200&q=80'],
    tags: body.tags?.map((tag) => tag.trim()).filter(Boolean) ?? [],
    providerId: req.user!.id,
    featured: Boolean(body.featured),
    createdAt: now,
    updatedAt: now,
  }

  getDb().care.unshift(care)
  res.status(201).json({ care: { ...care, isFavorite: false } })
})

careRouter.patch('/:id', requireAuth, requireProvider, (req: AuthenticatedRequest, res) => {
  const item = findCareById(req.params.id!)
  if (!item) {
    res.status(404).json({ message: 'Care listing not found', code: 'NOT_FOUND' })
    return
  }

  if (item.providerId !== req.user!.id) {
    res.status(403).json({ message: 'You can only edit your own listings', code: 'FORBIDDEN' })
    return
  }

  const body = req.body as Partial<typeof item>
  Object.assign(item, {
    ...body,
    id: item.id,
    providerId: item.providerId,
    createdAt: item.createdAt,
    updatedAt: new Date().toISOString(),
  })

  const isFavorite = getDb().favorites.some(
    (f) => f.userId === req.user!.id && f.careId === item.id,
  )

  res.json({ care: { ...item, isFavorite } })
})

careRouter.delete('/:id', requireAuth, requireProvider, (req: AuthenticatedRequest, res) => {
  const db = getDb()
  const index = db.care.findIndex((item) => item.id === req.params.id)
  if (index < 0) {
    res.status(404).json({ message: 'Care listing not found', code: 'NOT_FOUND' })
    return
  }

  const item = db.care[index]!
  if (item.providerId !== req.user!.id) {
    res.status(403).json({ message: 'You can only delete your own listings', code: 'FORBIDDEN' })
    return
  }

  db.care.splice(index, 1)
  db.favorites = db.favorites.filter((f) => f.careId !== item.id)
  res.status(204).send()
})
