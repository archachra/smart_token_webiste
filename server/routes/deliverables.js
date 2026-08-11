import { Router } from 'express'
import pool from '../config/database.js'

const router = Router()

function validId(value) {
  return Number.isInteger(Number(value)) && Number(value) > 0
}

router.get('/', async (request, response) => {
  const result = await pool.query('SELECT * FROM deliverables ORDER BY created_at DESC')
  response.json(result.rows)
})

router.get('/:id', async (request, response) => {
  if (!validId(request.params.id)) return response.status(400).json({ error: 'Invalid deliverable id' })

  const result = await pool.query('SELECT * FROM deliverables WHERE id = $1', [request.params.id])
  if (result.rowCount === 0) return response.status(404).json({ error: 'Deliverable not found' })

  response.json(result.rows[0])
})

router.get('/:id/versions', async (request, response) => {
  if (!validId(request.params.id)) return response.status(400).json({ error: 'Invalid deliverable id' })

  const deliverable = await pool.query('SELECT id FROM deliverables WHERE id = $1', [request.params.id])
  if (deliverable.rowCount === 0) return response.status(404).json({ error: 'Deliverable not found' })

  const versions = await pool.query(
    'SELECT * FROM versions WHERE deliverable_id = $1 ORDER BY date DESC, created_at DESC',
    [request.params.id],
  )
  response.json(versions.rows)
})

router.post('/', async (request, response) => {
  const { title, slug } = request.body
  if (!title?.trim() || !slug?.trim()) {
    return response.status(400).json({ error: 'title and slug are required' })
  }

  const result = await pool.query(
    'INSERT INTO deliverables (title, slug) VALUES ($1, $2) RETURNING *',
    [title.trim(), slug.trim()],
  )
  response.status(201).json(result.rows[0])
})

export default router
