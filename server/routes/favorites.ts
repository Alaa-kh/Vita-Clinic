import { Router } from 'express'
import { findCareById, getDb } from '../data/db.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js'

export const favoritesRouter = Router()

favoritesRouter.get('/', requireAuth, (req: AuthenticatedRequest, res) => {
  const db = getDb()
  const favoriteIds = db.favorites
    .filter((f) => f.userId === req.user!.id)
    .map((f) => f.careId)

  const items = db.care
    .filter((item) => favoriteIds.includes(item.id))
    .map((item) => ({ ...item, isFavorite: true }))

  res.json({ items })
})

favoritesRouter.post('/:careId', requireAuth, (req: AuthenticatedRequest, res) => {
  const item = findCareById(req.params.careId!)
  if (!item) {
    res.status(404).json({ message: 'Care listing not found', code: 'NOT_FOUND' })
    return
  }

  const db = getDb()
  const exists = db.favorites.some((f) => f.userId === req.user!.id && f.careId === item.id)

  if (!exists) {
    db.favorites.push({ userId: req.user!.id, careId: item.id })
  }

  res.status(201).json({ care: { ...item, isFavorite: true } })
})

favoritesRouter.delete('/:careId', requireAuth, (req: AuthenticatedRequest, res) => {
  const db = getDb()
  db.favorites = db.favorites.filter(
    (f) => !(f.userId === req.user!.id && f.careId === req.params.careId),
  )
  res.status(204).send()
})
