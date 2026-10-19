// Protocolo e hash de integridade dos documentos de saída (sem dependência do banco).

export function gerarNumeroProtocolo(empresaId) {
  const data = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const sufixo = (empresaId || '').replace(/-/g, '').slice(0, 8).toUpperCase()
  return `IP-${data}-${sufixo}`
}

export async function gerarHashIntegridade(texto) {
  const dados = new TextEncoder().encode(texto)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dados)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 24)
    .toUpperCase()
}
