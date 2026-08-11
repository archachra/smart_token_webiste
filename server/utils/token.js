import jwt from 'jsonwebtoken'

const secret = process.env.JWT_SECRET || 'smarttoken-local-development-secret'
const expiresIn = process.env.JWT_EXPIRES_IN || '1d'

export function createToken(user) {
  return jwt.sign({ userId: user.id, role: user.role }, secret, { expiresIn })
}

export function verifyToken(token) {
  return jwt.verify(token, secret)
}
