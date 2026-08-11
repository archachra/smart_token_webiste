import express from 'express'

const app = express()
const port = Number(process.env.PORT) || 3001

app.use(express.json())

app.get('/api/health', (request, response) => {
  response.json({ status: 'ok' })
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
