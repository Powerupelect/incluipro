// Cadastro/edição manual de acesso pelo painel administrativo — usado tanto
// para liberar um cliente que pagou fora do fluxo automático quanto para
// reativar um acesso bloqueado.

import { upsertAccessRecord, DIAS_TESTE } from './_lib/store.mjs'
import { verifyAdminToken, extractBearerToken } from './_lib/adminAuth.mjs'

export const config = { path: '/api/admin-upsert' }

const PLANOS_VALIDOS = new Set(['mensal', 'vitalicio', 'teste'])
const STATUS_VALIDOS = new Set(['ativo', 'bloqueado'])

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

  const { email, nome, plano, status } = body || {}
  if (!email) {
    return Response.json({ ok: false, motivo: 'E-mail obrigatório' }, { status: 400 })
  }
  if (plano && !PLANOS_VALIDOS.has(plano)) {
    return Response.json({ ok: false, motivo: 'Plano inválido' }, { status: 400 })
  }
  if (status && !STATUS_VALIDOS.has(status)) {
    return Response.json({ ok: false, motivo: 'Status inválido' }, { status: 400 })
  }

  // Bloquear/reativar manda só e-mail + status: preserva o plano (e a validade do teste).
  const record = await upsertAccessRecord({
    email,
    nome,
    plano,
    status: status || 'ativo',
    origem: 'manual',
    expiraEm: plano === 'teste' ? new Date(Date.now() + DIAS_TESTE * 24 * 60 * 60 * 1000).toISOString() : undefined,
  })
  return Response.json({ ok: true, record })
}
