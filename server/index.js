import 'dotenv/config'
import express from 'express'
import pool from './config/database.js'
import authRouter from './routes/auth.js'
import deliverablesRouter from './routes/deliverables.js'
import filesRouter from './routes/files.js'
import versionsRouter from './routes/versions.js'

const app = express()
const port = Number(process.env.PORT) || 3001
const allowedOrigin = 'http://localhost:5173'

app.use((request, response, next) => {
  if (request.headers.origin === allowedOrigin) {
    response.setHeader('Access-Control-Allow-Origin', allowedOrigin)
    response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS')
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }

  if (request.method === 'OPTIONS') {
    return response.sendStatus(204)
  }

  next()
})

app.use(express.json())
app.use('/api/auth', authRouter)
app.use('/api/deliverables', deliverablesRouter)
app.use('/api/files', filesRouter)
app.use('/api/versions', versionsRouter)

app.get('/api/health', (request, response) => {
  response.json({ status: 'ok' })
})

app.get('/api/db-health', async (request, response) => {
  try {
    await pool.query('SELECT 1')
    response.json({ status: 'ok' })
  } catch (error) {
    console.error('Database connection failed:', error.message)
    response.status(503).json({ status: 'unavailable' })
  }
})

app.use((request, response) => {
  response.status(404).json({ error: 'Route not found' })
})

app.use((error, request, response, next) => {
  console.error(error)
  response.status(500).json({ error: 'Internal server error' })
})

app.listen(port, () => {
  console.log(`SmartToken server listening on http://localhost:${port}`)
})

export default app
