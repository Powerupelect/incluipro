// Cálculo da cota de PCD — Lei de Cotas (Lei 8.213/1991, art. 93).
// Base = total de empregados CLT (matriz + filiais, CNPJ raiz) − aprendizes − aposentados por invalidez.
// A cota é global por empresa, não por estabelecimento (IN nº 20/01 do MTE).

export const VALOR_MINIMO_MULTA_POR_VAGA = 3499.8

function percentualCota(base) {
  if (base < 100) return 0
  if (base <= 200) return 0.02
  if (base <= 500) return 0.03
  if (base <= 1000) return 0.04
  return 0.05
}

export function calcularCota({
  totalFuncionarios = 0,
  aprendizes = 0,
  aposentadosInvalidez = 0,
  pcdAtuais = 0,
}) {
  const base = Math.max(0, totalFuncionarios - aprendizes - aposentadosInvalidez)
  const percentual = percentualCota(base)
  const cotaDevida = Math.ceil(base * percentual)
  const vagasEmAberto = Math.max(0, cotaDevida - pcdAtuais)
  const exposicaoEstimada = vagasEmAberto * VALOR_MINIMO_MULTA_POR_VAGA
  const percentualCumprimento = cotaDevida > 0 ? Math.min(100, (pcdAtuais / cotaDevida) * 100) : 100

  return { base, percentual, cotaDevida, vagasEmAberto, exposicaoEstimada, percentualCumprimento }
}
