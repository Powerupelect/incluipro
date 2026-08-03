import { listAccessRecords } from './_lib/store.mjs'
import { verifyAdminToken, extractBearerToken } from './_lib/adminAuth.mjs'

export const config = { path: '/api/admin-list' }

export default async (req) => {
  if (!verifyAdminToken(extractBearerToken(req))) {
    return new Response('Não autorizado', { status: 401 })
  }
  const records = await listAccessRecords()
  return Response.json({ ok: true, records })
}
