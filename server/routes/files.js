import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import multer from 'multer'
import { Router } from 'express'
import pool from '../config/database.js'
import { authenticateToken } from '../middleware/auth.js'

const router = Router()
const uploadsDir = path.resolve('uploads')

fs.mkdirSync(uploadsDir, { recursive: true })

const storage = multer.diskStorage({
  destination(request, file, callback) {
    callback(null, uploadsDir)
  },
  filename(request, file, callback) {
    const extension = path.extname(file.originalname)
    callback(null, `${Date.now()}-${randomUUID()}${extension}`)
  },
})

const upload = multer({ storage })

router.post('/upload', authenticateToken, upload.single('file'), async (request, response) => {
  const { version_id } = request.body
  const file = request.file

  if (!version_id) return response.status(400).json({ error: 'version_id is required' })
  if (!file) return response.status(400).json({ error: 'file is required' })

  const versionCheck = await pool.query('SELECT id FROM versions WHERE id = $1', [version_id])
  if (versionCheck.rowCount === 0) {
    return response.status(404).json({ error: 'Version not found' })
  }

  const storageKey = path.posix.join('uploads', file.filename)
  const result = await pool.query(
    `INSERT INTO files (version_id, original_name, storage_key, mime_type, size)
     VALUES ($1, $2, $3, $4, $5) RETURNING id, version_id, original_name, storage_key, mime_type, size, uploaded_at`,
    [version_id, file.originalname, storageKey, file.mimetype, file.size],
  )

  response.status(201).json(result.rows[0])
})

export default router
