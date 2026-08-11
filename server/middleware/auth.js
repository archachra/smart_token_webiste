import { verifyToken } from '../utils/token.js'

export function authenticateToken(request, response, next) {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '')
  if (!token) return response.status(401).json({ error: 'authentication token required' })

  try {
    request.user = verifyToken(token)
    next()
  } catch {
    response.status(401).json({ error: 'invalid or expired token' })
  }
}
