// Login do painel administrativo. Exige que o e-mail seja exatamente o
// ADMIN_EMAIL configurado (padrão: esterpop.59@gmail.com) e a senha bata com
// ADMIN_PASSWORD. Retorna um token assinado (ver _lib/adminAuth.mjs).

import { timingSafeEqual } from 'node:crypto'
import { issueAdminToken, isAdminEmail } from './_lib/adminAuth.mjs'

export const config = { path: '/api/admin-login' }

function senhasIguais(a, b) {
  const bufA = Buffer.from(String(a || ''))
  const bufB = Buffer.from(String(b || ''))
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    return Response.json(
      { ok: false, motivo: 'ADMIN_PASSWORD não configurada no ambiente' },
      { status: 500 },
    )
  }

  let body
  try {
    body = await req.json()
  } catch {
    return new Response('JSON inválido', { status: 400 })
  }

  const { email, senha } = body || {}
  if (!isAdminEmail(email) || !senhasIguais(senha, adminPassword)) {
    return Response.json({ ok: false, motivo: 'Credenciais inválidas' }, { status: 401 })
  }

  const token = issueAdminToken(String(email).trim().toLowerCase())
  return Response.json({ ok: true, token })
}
