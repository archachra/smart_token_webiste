import { Router } from 'express'
import pool from '../config/database.js'

const router = Router()

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

export default router
