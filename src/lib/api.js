// Cliente para as Netlify Functions que cuidam de liberação de acesso
// (pagamento Hotmart + painel administrativo). Ver netlify/functions/.

async function postJSON(path, body, token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(path, { method: 'POST', headers, body: JSON.stringify(body) })
  let data = null
  try {
    data = await res.json()
  } catch {
    // resposta sem corpo JSON
  }
  if (!res.ok) {
    throw new Error(data?.motivo || `Erro ${res.status} ao falar com o servidor`)
  }
  return data
}

export function checkAccess(email) {
  return postJSON('/api/access-check', { email })
}

export function adminLogin(email, senha) {
  return postJSON('/api/admin-login', { email, senha })
}

export async function adminList(token) {
  const res = await fetch('/api/admin-list', { headers: { Authorization: `Bearer ${token}` } })
  let data = null
  try {
    data = await res.json()
  } catch {
    // ignore
  }
  if (!res.ok) throw new Error(data?.motivo || 'Não autorizado')
  return data
}

export function adminUpsert(token, payload) {
  return postJSON('/api/admin-upsert', payload, token)
}

export function adminRemove(token, email) {
  return postJSON('/api/admin-remove', { email }, token)
}
