// Matriz de compatibilidade cargo × tipo de deficiência.
//
// A classificação é uma REFERÊNCIA calculada a partir do grau de exigência informado para o
// cargo — não substitui avaliação técnica real feita com a pessoa candidata (a mesma ressalva
// de sempre: isso apoia a organização, não decide por ninguém).

export const DIMENSOES = [
  { key: 'visao', label: 'Visão' },
  { key: 'audicao', label: 'Audição' },
  { key: 'mobilidade', label: 'Mobilidade' },
  { key: 'comunicacao', label: 'Comunicação verbal' },
  { key: 'cognicao', label: 'Cognição' },
  { key: 'esforco_fisico', label: 'Esforço físico' },
  { key: 'deslocamento', label: 'Deslocamento' },
]

export const NIVEIS_EXIGENCIA = [
  { valor: 0, label: 'Nenhuma' },
  { valor: 1, label: 'Baixa' },
  { valor: 2, label: 'Média' },
  { valor: 3, label: 'Alta' },
]

// Quais dimensões do cargo cada tipo de deficiência tende a impactar.
const AREAS_AFETADAS = {
  visual: ['visao'],
  fisica: ['mobilidade', 'deslocamento', 'esforco_fisico'],
  auditiva: ['audicao', 'comunicacao'],
  intelectual: ['cognicao'],
  neurodivergente: ['cognicao', 'comunicacao'],
  multipla: ['visao', 'audicao', 'mobilidade', 'comunicacao', 'cognicao', 'esforco_fisico', 'deslocamento'],
}

// Faixa de custo estimado de adaptação por dimensão — referência ampla, não orçamento.
const FAIXA_CUSTO_POR_DIMENSAO = {
  visao: { min: 300, max: 5000 },
  audicao: { min: 200, max: 8000 }, // inclui intérprete de Libras recorrente
  mobilidade: { min: 500, max: 6000 },
  comunicacao: { min: 0, max: 1500 },
  cognicao: { min: 0, max: 1000 },
  esforco_fisico: { min: 500, max: 4000 },
  deslocamento: { min: 300, max: 3000 },
}

/**
 * Classifica um cargo para um tipo de deficiência.
 * Retorna { status: 'compativel' | 'requer_adaptacao' | 'incompativel', dimensoesCriticas, custoEstimado }
 */
export function classificarCompatibilidade(cargo, tipoDeficienciaId) {
  const areas = AREAS_AFETADAS[tipoDeficienciaId] || []
  if (areas.length === 0) {
    return { status: 'compativel', dimensoesCriticas: [], custoEstimado: null }
  }

  const niveis = areas.map((dim) => ({ dim, nivel: cargo[`exigencia_${dim}`] || 0 }))
  const maxNivel = Math.max(...niveis.map((n) => n.nivel))

  if (maxNivel <= 1) {
    return { status: 'compativel', dimensoesCriticas: [], custoEstimado: null }
  }

  const dimensoesCriticas = niveis.filter((n) => n.nivel >= 2).map((n) => n.dim)
  const todasNoMaximo = niveis.every((n) => n.nivel === 3)

  if (todasNoMaximo && areas.length > 1) {
    // Todas as dimensões que essa deficiência afeta estão no nível máximo de exigência —
    // situação extrema, sem margem aparente de adaptação.
    return { status: 'incompativel', dimensoesCriticas, custoEstimado: null }
  }

  const custoEstimado = dimensoesCriticas.reduce(
    (acc, dim) => {
      const faixa = FAIXA_CUSTO_POR_DIMENSAO[dim] || { min: 0, max: 0 }
      return { min: acc.min + faixa.min, max: acc.max + faixa.max }
    },
    { min: 0, max: 0 },
  )

  return { status: 'requer_adaptacao', dimensoesCriticas, custoEstimado }
}

export const STATUS_LABEL = {
  compativel: 'Compatível',
  requer_adaptacao: 'Requer adaptação',
  incompativel: 'Incompatível',
}

export const STATUS_COR = {
  compativel: 'bg-signal-100 text-signal-800',
  requer_adaptacao: 'bg-amber-100 text-amber-800',
  incompativel: 'bg-red-100 text-red-800',
}
