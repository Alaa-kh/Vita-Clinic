import cors from 'cors'
import express from 'express'
import { authRouter } from './routes/auth.js'
import { favoritesRouter } from './routes/favorites.js'
import { careRouter } from './routes/care.js'
import { seedDatabase } from './data/db.js'

const PORT = Number(process.env.PORT ?? 4001)

seedDatabase()

const app = express()

app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRouter)
app.use('/api/care', careRouter)
app.use('/api/favorites', favoritesRouter)

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

app.listen(PORT, () => {
  console.log(`Vita API listening on http://localhost:${PORT}`)
})
