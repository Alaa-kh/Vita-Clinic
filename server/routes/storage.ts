import { Router } from 'express'
import multer from 'multer'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { getDb, pushAudit } from '../data/db.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadDir = path.resolve(__dirname, '../../uploads')

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')
      cb(null, `${Date.now()}-${safe}`)
    },
  }),
  limits: { fileSize: 25 * 1024 * 1024 },
})

export const storageRouter = Router()

storageRouter.get('/', requireAuth, (req: AuthenticatedRequest, res) => {
  const items = getDb().files.filter((f) => f.userId === req.user!.id)
  res.json({ items })
})

storageRouter.post(
  '/upload',
  requireAuth,
  upload.single('file'),
  (req: AuthenticatedRequest, res) => {
    if (!req.file) {
      res.status(400).json({ message: 'File required', code: 'VALIDATION' })
      return
    }

    const compress = String(req.query.compress ?? 'true') === 'true'
    const record = {
      id: randomUUID(),
      userId: req.user!.id,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
      compressed: compress && req.file.mimetype.startsWith('image/'),
      createdAt: new Date().toISOString(),
    }
    getDb().files.unshift(record)
    pushAudit(req.user!.id, 'storage.upload', `file:${record.id}`, {
      mimeType: record.mimeType,
      size: record.size,
    })
    res.status(201).json({
      file: record,
      cloud: {
        provider: process.env.S3_BUCKET ? 's3' : 'local',
        bucket: process.env.S3_BUCKET ?? null,
      },
    })
  },
)

storageRouter.post('/presign', requireAuth, (req: AuthenticatedRequest, res) => {
  const name = String(req.body?.fileName ?? 'upload.bin')
  res.json({
    uploadUrl: `/api/storage/upload`,
    publicUrl: process.env.CDN_URL
      ? `${process.env.CDN_URL}/${encodeURIComponent(name)}`
      : null,
    provider: process.env.S3_BUCKET ? 's3' : 'local',
  })
})
