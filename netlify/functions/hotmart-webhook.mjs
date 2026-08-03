// Endpoint que recebe as notificações (webhook) da Hotmart.
//
// Segurança: exige que o header X-HOTMART-HOTTOK (ou o campo "hottok" no
// corpo, usado pelo formato mais antigo) bata exatamente com a variável de
// ambiente HOTMART_HOTTOK — o mesmo valor configurado na Hotmart ao criar o
// webhook. Sem isso, qualquer requisição é rejeitada com 401 antes de tocar
// nos dados de acesso.
//
// PURCHASE_APPROVED / PURCHASE_COMPLETE  → libera o acesso do e-mail do comprador.
// PURCHASE_CANCELED / PURCHASE_REFUNDED / PURCHASE_CHARGEBACK / PURCHASE_PROTEST
// / PURCHASE_EXPIRED / SUBSCRIPTION_CANCELLATION → bloqueia o acesso.

import { upsertAccessRecord } from './_lib/store.mjs'
import { enviarEmailConfirmacao } from './_lib/email.mjs'

export const config = { path: '/api/hotmart-webhook' }

const EVENTOS_LIBERA = new Set(['PURCHASE_APPROVED', 'PURCHASE_COMPLETE'])
const EVENTOS_BLOQUEIA = new Set([
  'PURCHASE_CANCELED',
  'PURCHASE_REFUNDED',
  'PURCHASE_CHARGEBACK',
  'PURCHASE_PROTEST',
  'PURCHASE_EXPIRED',
  'SUBSCRIPTION_CANCELLATION',
])

function tokensIguais(a, b) {
  const bufA = Buffer.from(String(a || ''))
  const bufB = Buffer.from(String(b || ''))
  if (bufA.length !== bufB.length) return false
  let diff = 0
  for (let i = 0; i < bufA.length; i++) diff |= bufA[i] ^ bufB[i]
  return diff === 0
}

// Heurística para mapear o pagamento recebido a um dos dois planos do site.
// A Hotmart não garante um campo único e estável para "qual oferta" — por
// isso combina nome do produto, presença de assinatura recorrente e valor.
function identificarPlano(data) {
  const nomeProduto = (data?.product?.name || '').toLowerCase()
  const valor = data?.purchase?.price?.value
  if (nomeProduto.includes('vitalíc') || nomeProduto.includes('vitalic')) return 'vitalicio'
  if (nomeProduto.includes('mensal')) return 'mensal'
  if (data?.subscription) return 'mensal'
  if (typeof valor === 'number' && valor >= 150) return 'vitalicio'
  return 'mensal'
}

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const hottokEsperado = process.env.HOTMART_HOTTOK
  if (!hottokEsperado) {
    console.error('HOTMART_HOTTOK não configurado — recusando webhook por segurança')
    return new Response('Webhook não configurado', { status: 500 })
  }

  let body
  try {
    body = await req.json()
  } catch {
    return new Response('JSON inválido', { status: 400 })
  }

  const hottokRecebido = req.headers.get('x-hotmart-hottok') || body?.hottok
  if (!tokensIguais(hottokRecebido, hottokEsperado)) {
    return new Response('Assinatura inválida', { status: 401 })
  }

  const evento = body?.event
  const data = body?.data
  const email = data?.buyer?.email
  const nome = data?.buyer?.name
  const transacao = data?.purchase?.transaction

  if (!email) {
    return new Response('E-mail do comprador ausente no payload', { status: 400 })
  }

  if (EVENTOS_LIBERA.has(evento)) {
    const plano = identificarPlano(data)
    const record = await upsertAccessRecord({
      email,
      nome,
      plano,
      status: 'ativo',
      origem: 'hotmart',
      hotmartTransactionId: transacao,
    })
    const linkAcesso = `${process.env.URL || 'https://seusite.netlify.app'}/assinatura`
    const email_ = await enviarEmailConfirmacao({ nome, email, plano, linkAcesso })
    return Response.json({ ok: true, evento, record, email: email_ })
  }

  if (EVENTOS_BLOQUEIA.has(evento)) {
    const record = await upsertAccessRecord({
      email,
      status: 'bloqueado',
      origem: 'hotmart',
      hotmartTransactionId: transacao,
    })
    return Response.json({ ok: true, evento, record })
  }

  return Response.json({ ok: true, ignorado: evento })
}
