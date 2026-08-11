import bcrypt from 'bcrypt'
import { Router } from 'express'
import pool from '../config/database.js'
import { createToken } from '../utils/token.js'

const router = Router()
const roles = ['faculty', 'ta', 'student', 'administrator']

router.post('/register', async (request, response) => {
  const { name, email, password, role } = request.body
  if (!name?.trim() || !email?.trim() || !password || !role) {
    return response.status(400).json({ error: 'name, email, password, and role are required' })
  }
  if (password.length < 8) return response.status(400).json({ error: 'password must be at least 8 characters' })
  if (!roles.includes(role)) return response.status(400).json({ error: 'invalid role' })

  const passwordHash = await bcrypt.hash(password, 12)
  try {
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at`,
      [name.trim(), email.trim().toLowerCase(), passwordHash, role],
    )
    response.status(201).json(result.rows[0])
  } catch (error) {
    if (error.code === '23505') return response.status(409).json({ error: 'email already registered' })
    throw error
  }
})

router.post('/login', async (request, response) => {
  const { email, password } = request.body
  if (!email?.trim() || !password) return response.status(400).json({ error: 'email and password are required' })

  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()])
  const user = result.rows[0]
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return response.status(401).json({ error: 'invalid email or password' })
  }

  response.json({ token: createToken(user) })
})

export default router
