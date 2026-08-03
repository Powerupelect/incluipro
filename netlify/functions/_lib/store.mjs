// Armazenamento dos registros de acesso (entitlement) em Netlify Blobs —
// compartilhado entre todos os visitantes do site, ao contrário do
// localStorage usado no restante do protótipo (que é isolado por navegador).

import { getStore } from '@netlify/blobs'

const STORE_NAME = 'incluipro-access'

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function accessStore() {
  return getStore(STORE_NAME)
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
}) {
  const store = accessStore()
  const key = normalizeEmail(email)
  if (!key) throw new Error('E-mail inválido')
  const existing = await store.get(key, { type: 'json' })
  const now = new Date().toISOString()
  const record = {
    email: key,
    nome: nome ?? existing?.nome ?? '',
    plano: plano ?? existing?.plano ?? 'mensal',
    status: status ?? existing?.status ?? 'ativo',
    origem: origem ?? existing?.origem ?? 'manual',
    hotmartTransactionId: hotmartTransactionId ?? existing?.hotmartTransactionId ?? null,
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
