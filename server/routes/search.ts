import { Router } from 'express'
import { z } from 'zod'
import { getDb } from '../data/db.js'

export const searchRouter = Router()

searchRouter.get('/', (req, res) => {
  const schema = z.object({
    q: z.string().optional().default(''),
    specialty: z.string().optional(),
    city: z.string().optional(),
    sort: z.enum(['relevance', 'price_asc', 'price_desc', 'newest']).optional().default('relevance'),
    page: z.coerce.number().int().min(1).optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(50).optional().default(12),
  })

  const parsed = schema.safeParse(req.query)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid search query', code: 'VALIDATION' })
    return
  }

  const { q, specialty, city, sort, page, pageSize } = parsed.data
  const tokens = q.toLowerCase().split(/\s+/).filter(Boolean)

  let items = getDb().products.filter((c) => {
    if (specialty && c.category !== specialty) return false
    if (city && c.city.toLowerCase() !== city.toLowerCase()) return false
    if (!tokens.length) return true
    const hay = `${c.title} ${c.description} ${c.tags.join(' ')} ${c.storeName}`.toLowerCase()
    return tokens.every((t) => hay.includes(t))
  })

  items = [...items].sort((a, b) => {
    if (sort === 'price_asc') return a.price - b.price
    if (sort === 'price_desc') return b.price - a.price
    if (sort === 'newest') return b.createdAt.localeCompare(a.createdAt)
    const score = (c: typeof a) =>
      tokens.reduce(
        (acc, t) => acc + (`${c.title} ${c.tags.join(' ')}`.toLowerCase().includes(t) ? 2 : 0),
        0,
      )
    return score(b) - score(a)
  })

  const total = items.length
  const start = (page - 1) * pageSize
  const pageItems = items.slice(start, start + pageSize)

  res.json({
    items: pageItems,
    page,
    pageSize,
    total,
    hasMore: start + pageSize < total,
    engine: process.env.ELASTICSEARCH_URL ? 'elasticsearch' : 'fulltext-local',
  })
})
