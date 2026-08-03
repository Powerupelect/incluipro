// Autenticação simples do painel administrativo: token assinado com HMAC,
// sem dependências externas. Exige ADMIN_SECRET configurado no ambiente.

import { createHmac, timingSafeEqual } from 'node:crypto'

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000 // 12 horas

function sign(payload) {
  const secret = process.env.ADMIN_SECRET
  if (!secret) throw new Error('ADMIN_SECRET não configurado no ambiente')
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

export function issueAdminToken(email) {
  const payload = Buffer.from(
    JSON.stringify({ email, exp: Date.now() + TOKEN_TTL_MS }),
  ).toString('base64url')
  return `${payload}.${sign(payload)}`
}

export function verifyAdminToken(token) {
  if (!token) return null
  const [payload, sig] = String(token).split('.')
  if (!payload || !sig) return null

  let expected
  try {
    expected = sign(payload)
  } catch {
    return null
  }

  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (!data.exp || Date.now() > data.exp) return null
    return data
  } catch {
    return null
  }
}

export function isAdminEmail(email) {
  const adminEmail = (process.env.ADMIN_EMAIL || 'esterpop.59@gmail.com').toLowerCase()
  return String(email || '').trim().toLowerCase() === adminEmail
}

export function extractBearerToken(req) {
  const header = req.headers.get('authorization') || ''
  const match = header.match(/^Bearer\s+(.+)$/i)
  return match ? match[1] : null
}
