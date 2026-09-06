// Métricas do Painel — só o que dá pra calcular a partir de datas reais que o sistema
// registra. Nunca mostra uma tendência quando não há mês anterior pra comparar (mostrar uma
// variação inventada seria pior do que não mostrar nenhuma).

const NOMES_MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

function inicioMes(data) {
  return new Date(data.getFullYear(), data.getMonth(), 1)
}

function mesmoMes(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

function contarNoMes(datas, offsetMeses) {
  const alvo = inicioMes(new Date())
  alvo.setMonth(alvo.getMonth() - offsetMeses)
  return datas.filter((d) => d && mesmoMes(new Date(d), alvo)).length
}

/** Quantidade este mês e variação percentual vs. o mês anterior — `variacao` vem null quando
 * o mês anterior está zerado (nada real pra comparar). */
export function tendenciaMensal(datas) {
  const esteMes = contarNoMes(datas, 0)
  const mesAnterior = contarNoMes(datas, 1)
  if (mesAnterior === 0) return { esteMes, variacao: null }
  return { esteMes, variacao: Math.round(((esteMes - mesAnterior) / mesAnterior) * 100) }
}

/** Contagem por mês nos últimos `meses` meses (mais antigo primeiro) — usado no gráfico de evolução. */
export function contagemPorMes(datas, meses = 6) {
  const hoje = new Date()
  const buckets = []
  for (let i = meses - 1; i >= 0; i--) {
    const ref = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
    buckets.push({ ano: ref.getFullYear(), mes: ref.getMonth(), label: NOMES_MES[ref.getMonth()], quantidade: 0 })
  }
  for (const d of datas) {
    if (!d) continue
    const data = new Date(d)
    const bucket = buckets.find((b) => b.ano === data.getFullYear() && b.mes === data.getMonth())
    if (bucket) bucket.quantidade += 1
  }
  return buckets
}
