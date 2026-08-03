import { removeAccessRecord } from './_lib/store.mjs'
import { verifyAdminToken, extractBearerToken } from './_lib/adminAuth.mjs'

export const config = { path: '/api/admin-remove' }

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }
  if (!verifyAdminToken(extractBearerToken(req))) {
    return new Response('Não autorizado', { status: 401 })
  }

  let body
  try {
    body = await req.json()
  } catch {
    return new Response('JSON inválido', { status: 400 })
  }

  const { email } = body || {}
  if (!email) {
    return Response.json({ ok: false, motivo: 'E-mail obrigatório' }, { status: 400 })
  }
  await removeAccessRecord(email)
  return Response.json({ ok: true })
}
