// Endpoint público: o cliente digita o e-mail e o sistema verifica se ele
// está liberado. Não retorna nenhum dado sensível — apenas se está liberado
// e qual plano.

import { getAccessRecord } from './_lib/store.mjs'
import { isAdminEmail } from './_lib/adminAuth.mjs'

export const config = { path: '/api/access-check' }

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  let body
  try {
    body = await req.json()
  } catch {
    return new Response('JSON inválido', { status: 400 })
  }

  const email = String(body?.email || '').trim().toLowerCase()
  if (!email) {
    return Response.json({ liberado: false, motivo: 'E-mail obrigatório' }, { status: 400 })
  }

  if (isAdminEmail(email)) {
    return Response.json({ liberado: true, plano: 'vitalicio', admin: true })
  }

  const record = await getAccessRecord(email)
  if (!record || record.status !== 'ativo') {
    return Response.json({ liberado: false })
  }
  return Response.json({ liberado: true, plano: record.plano })
}
