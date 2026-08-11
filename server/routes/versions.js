import { Router } from 'express'
import pool from '../config/database.js'
import { authenticateToken } from '../middleware/auth.js'

const router = Router()

function validId(value) {
  return Number.isInteger(Number(value)) && Number(value) > 0
}

export async function publishVersion(versionId) {
  const result = await pool.query(
    `UPDATE versions
     SET status = 'published'
     WHERE id = $1
     RETURNING *`,
    [versionId],
  )

  if (result.rowCount === 0) {
    return null
  }

  return result.rows[0]
}

export async function getVersionWithFiles(versionId) {
  const version = await pool.query('SELECT * FROM versions WHERE id = $1', [versionId])
  if (version.rowCount === 0) {
    return null
  }

  const files = await pool.query(
    'SELECT id, version_id, original_name, storage_key, mime_type, size, uploaded_at FROM files WHERE version_id = $1 ORDER BY uploaded_at DESC',
    [versionId],
  )

  return { ...version.rows[0], files: files.rows }
}

router.post('/', async (request, response) => {
  const { deliverable_id, version_number, date, change_summary, author_id, status = 'draft' } = request.body
  if (!deliverable_id || !version_number?.trim() || !date || !change_summary?.trim() || !author_id) {
    return response.status(400).json({ error: 'deliverable_id, version_number, date, change_summary, and author_id are required' })
  }

  const result = await pool.query(
    `INSERT INTO versions (deliverable_id, version_number, date, change_summary, author_id, status)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [deliverable_id, version_number.trim(), date, change_summary.trim(), author_id, status],
  )
  response.status(201).json(result.rows[0])
})

router.patch('/:id/publish', authenticateToken, async (request, response) => {
  if (!validId(request.params.id)) return response.status(400).json({ error: 'Invalid version id' })

  const version = await publishVersion(request.params.id)
  if (!version) return response.status(404).json({ error: 'Version not found' })

  response.json(version)
})

router.get('/:id', async (request, response) => {
  if (!validId(request.params.id)) return response.status(400).json({ error: 'Invalid version id' })

  const version = await getVersionWithFiles(request.params.id)
  if (!version) return response.status(404).json({ error: 'Version not found' })

  response.json(version)
})

export default router
