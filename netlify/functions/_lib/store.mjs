// Armazenamento dos registros de acesso (entitlement) em Netlify Blobs —
// compartilhado entre todos os visitantes do site, ao contrário do
// localStorage usado no restante do protótipo (que é isolado por navegador).

import { getStore } from '@netlify/blobs'

const STORE_NAME = 'incluipro-access'
export const DIAS_TESTE = 14

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function accessStore() {
  return getStore(STORE_NAME, { consistency: 'strong' })
}

export async function getAccessRecord(email) {
  const key = normalizeEmail(email)
  if (!key) return null
  return (await accessStore().get(key, { type: 'json' })) || null
}

export async function listAccessRecords() {
  const store = accessStore()
  const { blobs } = await store.list()
  const records = await Promise.all(blobs.map((b) => store.get(b.key, { type: 'json' })))
  return records
    .filter(Boolean)
    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
}

export async function upsertAccessRecord({
  email,
  nome,
  plano,
  status,
  origem,
  hotmartTransactionId,
  expiraEm,
}) {
  const store = accessStore()
  const key = normalizeEmail(email)
  if (!key) throw new Error('E-mail inválido')
  const existing = await store.get(key, { type: 'json' })
  const now = new Date().toISOString()
  const planoFinal = plano ?? existing?.plano ?? 'mensal'
  const record = {
    email: key,
    nome: nome ?? existing?.nome ?? '',
    plano: planoFinal,
    status: status ?? existing?.status ?? 'ativo',
    origem: origem ?? existing?.origem ?? 'manual',
    hotmartTransactionId: hotmartTransactionId ?? existing?.hotmartTransactionId ?? null,
    // Só o teste grátis expira; ao virar plano pago, a data de expiração é descartada.
    expiraEm: planoFinal === 'teste' ? (expiraEm ?? existing?.expiraEm ?? null) : null,
    // Marca permanente: um e-mail só tem direito a um teste, mesmo depois de assinar.
    testeUsado: existing?.testeUsado || planoFinal === 'teste',
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
  await store.setJSON(key, record)
  return record
}

export async function removeAccessRecord(email) {
  const key = normalizeEmail(email)
  if (!key) return
  await accessStore().delete(key)
}

/** Teste expirado conta como sem acesso, mesmo com status "ativo". */
export function acessoValido(record, agora = new Date()) {
  if (!record || record.status !== 'ativo') return false
  if (record.plano === 'teste') return Boolean(record.expiraEm) && new Date(record.expiraEm) > agora
  return true
}

export function diasRestantes(record, agora = new Date()) {
  if (record?.plano !== 'teste' || !record.expiraEm) return null
  return Math.max(0, Math.ceil((new Date(record.expiraEm) - agora) / (24 * 60 * 60 * 1000)))
}
