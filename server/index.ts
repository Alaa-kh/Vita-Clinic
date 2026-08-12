import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import path from 'node:path'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import { authRouter } from './routes/auth.js'
import { favoritesRouter } from './routes/favorites.js'
import { careRouter } from './routes/care.js'
import { productsRouter } from './routes/products.js'
import { cartRouter, ordersRouter } from './routes/orders.js'
import { bookingsRouter } from './routes/bookings.js'
import { paymentsRouter } from './routes/payments.js'
import { mapsRouter } from './routes/maps.js'
import { notificationsRouter } from './routes/notifications.js'
import { aiRouter } from './routes/ai.js'
import { analyticsRouter } from './routes/analytics.js'
import { storageRouter } from './routes/storage.js'
import { securityRouter } from './routes/security.js'
import { searchRouter } from './routes/search.js'
import { platformRouter } from './routes/platform.js'
import { seedDatabase } from './data/db.js'
import { attachRealtime } from './realtime.js'

const PORT = Number(process.env.PORT ?? 4001)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

seedDatabase()

const app = express()
const httpServer = createServer(app)

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  }),
)
app.use(cors({ origin: true, credentials: true }))
app.use(
  rateLimit({
    windowMs: 60_000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
)
app.use(express.json({ limit: '2mb' }))
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')))

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'barq-api',
    realtime: true,
    timestamp: new Date().toISOString(),
  })
})

app.use('/api/auth', authRouter)
app.use('/api/products', productsRouter)
app.use('/api/cart', cartRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/care', careRouter)
app.use('/api/favorites', favoritesRouter)
app.use('/api/bookings', bookingsRouter)
app.use('/api/payments', paymentsRouter)
app.use('/api/maps', mapsRouter)
app.use('/api/notifications', notificationsRouter)
app.use('/api/ai', aiRouter)
app.use('/api/analytics', analyticsRouter)
app.use('/api/storage', storageRouter)
app.use('/api/security', securityRouter)
app.use('/api/search', searchRouter)
app.use('/api/platform', platformRouter)

app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    const status = (err as { status?: number }).status ?? 500
    res.status(status).json({
      message,
      code: (err as { code?: string }).code ?? 'INTERNAL_ERROR',
    })
  },
)

attachRealtime(httpServer)

httpServer.listen(PORT, () => {
  console.log(`BARQ API listening on http://localhost:${PORT}`)
  console.log(`WebSocket path: /socket.io`)
})
