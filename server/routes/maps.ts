import { Router } from 'express'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { getDb } from '../data/db.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js'
import { haversineKm } from './payments.js'

export const mapsRouter = Router()

function toRad(d: number): number {
  return (d * Math.PI) / 180
}

function bearing(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const y = Math.sin(toRad(b.lng - a.lng)) * Math.cos(toRad(b.lat))
  const x =
    Math.cos(toRad(a.lat)) * Math.sin(toRad(b.lat)) -
    Math.sin(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.cos(toRad(b.lng - a.lng))
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
}

mapsRouter.get('/branches', (_req, res) => {
  res.json({ items: getDb().branches })
})

mapsRouter.get('/providers', (_req, res) => {
  const items = getDb().products.map((c) => ({
    id: c.id,
    title: c.title,
    city: c.city,
    lat: c.lat,
    lng: c.lng,
    specialty: c.category,
    price: c.price,
    currency: c.currency,
  }))
  res.json({ items })
})

mapsRouter.get('/clusters', (req, res) => {
  const zoom = Number(req.query.zoom ?? 10)
  const providers = getDb().products
  if (zoom >= 12) {
    res.json({
      type: 'points',
      items: providers.map((p) => ({ id: p.id, lat: p.lat, lng: p.lng, title: p.title })),
    })
    return
  }

  const buckets = new Map<string, { lat: number; lng: number; count: number; city: string }>()
  for (const p of providers) {
    const key = p.city
    const existing = buckets.get(key)
    if (existing) {
      existing.count += 1
      existing.lat = (existing.lat * (existing.count - 1) + p.lat) / existing.count
      existing.lng = (existing.lng * (existing.count - 1) + p.lng) / existing.count
    } else {
      buckets.set(key, { lat: p.lat, lng: p.lng, count: 1, city: p.city })
    }
  }
  res.json({ type: 'clusters', items: [...buckets.values()] })
})

mapsRouter.get('/heatmap', (_req, res) => {
  const points = getDb().products.map((c) => ({
    lat: c.lat,
    lng: c.lng,
    weight: Math.max(1, Math.round(c.price / 500)),
  }))
  res.json({ points })
})

mapsRouter.post('/geocode/reverse', async (req, res) => {
  const schema = z.object({ lat: z.number(), lng: z.number() })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid coordinates', code: 'VALIDATION' })
    return
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${parsed.data.lat}&lon=${parsed.data.lng}`
    const response = await fetch(url, {
      headers: { 'User-Agent': 'VitaClinic/1.0 (platform@vita.care)' },
    })
    if (!response.ok) throw new Error('Nominatim failed')
    const data = (await response.json()) as {
      display_name?: string
      address?: Record<string, string>
    }
    res.json({
      displayName: data.display_name ?? 'Unknown location',
      address: data.address ?? {},
      provider: 'nominatim',
    })
  } catch {
    const nearest = getDb().branches
      .map((b) => ({ ...b, distanceKm: haversineKm(parsed.data, b) }))
      .sort((a, b) => a.distanceKm - b.distanceKm)[0]
    res.json({
      displayName: nearest
        ? `Near ${nearest.name}, ${nearest.city}`
        : `${parsed.data.lat.toFixed(4)}, ${parsed.data.lng.toFixed(4)}`,
      address: nearest ? { city: nearest.city, road: nearest.address } : {},
      provider: 'fallback',
    })
  }
})

mapsRouter.post('/distance-matrix', (req, res) => {
  const schema = z.object({
    origins: z.array(z.object({ lat: z.number(), lng: z.number() })).min(1),
    destinations: z.array(z.object({ lat: z.number(), lng: z.number() })).min(1),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid matrix payload', code: 'VALIDATION' })
    return
  }

  const rows = parsed.data.origins.map((origin) => ({
    elements: parsed.data.destinations.map((dest) => {
      const distanceKm = haversineKm(origin, dest)
      const durationMin = Math.round((distanceKm / 35) * 60)
      return {
        distanceKm: Number(distanceKm.toFixed(2)),
        durationMin,
        status: 'OK',
      }
    }),
  }))
  res.json({ rows })
})

mapsRouter.post('/route', (req, res) => {
  const schema = z.object({
    from: z.object({ lat: z.number(), lng: z.number() }),
    to: z.object({ lat: z.number(), lng: z.number() }),
    optimize: z.boolean().optional(),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid route', code: 'VALIDATION' })
    return
  }

  const { from, to } = parsed.data
  const distanceKm = haversineKm(from, to)
  const durationMin = Math.round((distanceKm / 38) * 60)
  const mid = {
    lat: (from.lat + to.lat) / 2 + (parsed.data.optimize ? 0.01 : 0),
    lng: (from.lng + to.lng) / 2,
  }

  res.json({
    distanceKm: Number(distanceKm.toFixed(2)),
    durationMin,
    eta: new Date(Date.now() + durationMin * 60_000).toISOString(),
    bearing: bearing(from, to),
    geometry: [from, mid, to],
    optimized: Boolean(parsed.data.optimize),
  })
})

mapsRouter.post('/geofence/check', (req, res) => {
  const schema = z.object({
    lat: z.number(),
    lng: z.number(),
    branchId: z.string().uuid().optional(),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid geofence check', code: 'VALIDATION' })
    return
  }

  const db = getDb()
  const branches = parsed.data.branchId
    ? db.branches.filter((b) => b.id === parsed.data.branchId)
    : db.branches

  const results = branches.map((branch) => {
    const distanceM = haversineKm(parsed.data, branch) * 1000
    return {
      branchId: branch.id,
      name: branch.name,
      inside: distanceM <= branch.geofenceRadiusM,
      distanceM: Math.round(distanceM),
      radiusM: branch.geofenceRadiusM,
    }
  })
  res.json({ results })
})

mapsRouter.post('/tracking', requireAuth, (req: AuthenticatedRequest, res) => {
  const schema = z.object({
    lat: z.number(),
    lng: z.number(),
    heading: z.number().optional(),
    speed: z.number().optional(),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid track', code: 'VALIDATION' })
    return
  }

  const db = getDb()
  const existing = db.liveTracks.find((t) => t.userId === req.user!.id)
  const track = {
    id: existing?.id ?? randomUUID(),
    userId: req.user!.id,
    lat: parsed.data.lat,
    lng: parsed.data.lng,
    heading: parsed.data.heading ?? 0,
    speed: parsed.data.speed ?? 0,
    updatedAt: new Date().toISOString(),
  }
  if (existing) Object.assign(existing, track)
  else db.liveTracks.push(track)

  res.json(track)
})

mapsRouter.get('/tracking', requireAuth, (_req, res) => {
  res.json({ items: getDb().liveTracks })
})

mapsRouter.post('/eta', (req, res) => {
  const schema = z.object({
    from: z.object({ lat: z.number(), lng: z.number() }),
    to: z.object({ lat: z.number(), lng: z.number() }),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid ETA request', code: 'VALIDATION' })
    return
  }
  const distanceKm = haversineKm(parsed.data.from, parsed.data.to)
  const durationMin = Math.round((distanceKm / 40) * 60)
  res.json({
    distanceKm: Number(distanceKm.toFixed(2)),
    durationMin,
    eta: new Date(Date.now() + durationMin * 60_000).toISOString(),
  })
})
