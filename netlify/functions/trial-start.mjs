// Teste grátis: libera 14 dias de acesso para um e-mail que nunca testou nem
// assinou. Não renova — quem já usou o teste (ou já é cliente) recebe o estado atual.

import { getAccessRecord, upsertAccessRecord, acessoValido, diasRestantes, DIAS_TESTE } from './_lib/store.mjs'

export const config = { path: '/api/trial-start' }

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
  if (!email || !email.includes('@')) {
    return Response.json({ ok: false, motivo: 'E-mail obrigatório' }, { status: 400 })
  }

  const existing = await getAccessRecord(email)
  if (existing) {
    if (acessoValido(existing)) {
      return Response.json({ ok: true, liberado: true, plano: existing.plano, diasRestantes: diasRestantes(existing) })
    }
    return Response.json(
      { ok: false, motivo: 'O teste grátis já foi utilizado com este e-mail. Assine para continuar usando.' },
      { status: 409 },
    )
  }

  const record = await upsertAccessRecord({
    email,
    nome: String(body?.nome || '').slice(0, 120),
    plano: 'teste',
    status: 'ativo',
    origem: 'teste',
    expiraEm: new Date(Date.now() + DIAS_TESTE * 24 * 60 * 60 * 1000).toISOString(),
  })
  return Response.json({ ok: true, liberado: true, plano: 'teste', diasRestantes: diasRestantes(record) })
}
