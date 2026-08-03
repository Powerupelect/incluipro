// Lógica de pontuação do diagnóstico de maturidade em inclusão.
// Regra transparente: cada dimensão avaliada soma pontos; o total define o nível e as
// recomendações exibidas ao final.

export const NIVEIS = {
  INICIAL: {
    id: 'inicial',
    label: 'Inicial',
    descricao:
      'Sua empresa está no começo da jornada de inclusão. Existem, no máximo, iniciativas pontuais e não estruturadas — o que significa dependência de esforço individual, risco de conformidade com a Lei de Cotas (Lei 8.213/1991) e alta chance de rotatividade de colaboradores PCD por falta de suporte adequado.',
    recomendacoes: [
      'Estruture um processo formal de avaliação social para candidatos e colaboradores PCD, em vez de decisões caso a caso.',
      'Capacite as lideranças diretas antes de qualquer contratação — elas são quem sustenta a inclusão no dia a dia.',
      'Faça um levantamento básico de acessibilidade física do ambiente de trabalho (rampas, banheiros, rotas de circulação).',
      'Defina uma pessoa ou área responsável por conduzir o tema internamente, mesmo que não seja dedicação exclusiva.',
    ],
  },
  EM_DESENVOLVIMENTO: {
    id: 'em_desenvolvimento',
    label: 'Em desenvolvimento',
    descricao:
      'Sua empresa já saiu do zero: existem iniciativas de inclusão em andamento, mas ainda faltam padronização e consistência entre áreas. É comum que a experiência do colaborador PCD varie muito dependendo do time ou da liderança em que ele está — o que limita escala e gera desigualdade interna.',
    recomendacoes: [
      'Padronize o processo de avaliação social entre todas as áreas que contratam, não apenas as mais engajadas.',
      'Torne o treinamento de líderes recorrente (não um evento único) e meça se ele está mudando comportamento.',
      'Comece a acompanhar indicadores de retenção e permanência de colaboradores PCD, não só de contratação.',
      'Revise canais de comunicação interna (comunicados, treinamentos, reuniões) quanto à acessibilidade.',
    ],
  },
  AVANCADO: {
    id: 'avancado',
    label: 'Avançado',
    descricao:
      'Sua empresa já trata inclusão como processo estruturado e monitorado, com times capacitados e acompanhamento de indicadores. O próximo passo deixa de ser "criar processo" e passa a ser ganhar eficiência, profundidade e consistência — é exatamente aí que uma metodologia estruturada, com recursos padronizados de avaliação e treinamento, faz diferença mensurável.',
    recomendacoes: [
      'Padronize e agilize a produção de relatórios de avaliação social com um processo estruturado, mantendo qualidade em escala.',
      'Revise periodicamente os kits de treinamento de líderes para refletir casos reais vividos pela empresa.',
      'Formalize metas e indicadores de inclusão em relatórios de gestão, não apenas em iniciativas de RH.',
      'Avalie a criação de um Kit Personalizado para temas específicos do seu setor ou da sua cultura interna.',
    ],
  },
}

/** Cada critério booleano avaliado no diagnóstico, com peso e rótulo para exibição. */
export const CRITERIOS = [
  {
    key: 'hasAssessmentProcess',
    peso: 2,
    label: 'Processo estruturado de avaliação social para candidatos PCD',
    categoria: 'Processos',
  },
  {
    key: 'trainsLeaders',
    peso: 2,
    label: 'Treinamento de líderes sobre gestão de equipes inclusivas',
    categoria: 'Processos',
  },
  {
    key: 'hasAccessiblePhysicalSpace',
    peso: 1,
    label: 'Espaço físico acessível (rampas, banheiros adaptados, rotas de circulação)',
    categoria: 'Ambiente físico',
  },
  {
    key: 'hasInclusionGoals',
    peso: 1,
    label: 'Metas ou indicadores formais de contratação de PCD',
    categoria: 'Governança',
  },
  {
    key: 'tracksRetention',
    peso: 1,
    label: 'Acompanhamento de indicadores de retenção/permanência de colaboradores PCD',
    categoria: 'Governança',
  },
  {
    key: 'hasAccessibleCommunication',
    peso: 1,
    label: 'Canais de comunicação interna acessíveis (legendas, materiais alternativos, Libras)',
    categoria: 'Cultura e comunicação',
  },
  {
    key: 'hasInclusionContact',
    peso: 1,
    label: 'Pessoa ou comitê responsável por conduzir o tema da inclusão',
    categoria: 'Governança',
  },
]

const PESO_PROPORCAO_PCD = 2

function proporcaoPCD(employees, pcdCount) {
  const total = Number(employees) || 0
  const pcd = Number(pcdCount) || 0
  if (total <= 0) return 0
  return pcd / total
}

/**
 * Calcula o nível de maturidade em inclusão a partir das respostas do formulário.
 * @param {object} answers employees, pcdCount e um booleano para cada item de CRITERIOS
 */
export function calcularMaturidade(answers) {
  const max = PESO_PROPORCAO_PCD + CRITERIOS.reduce((soma, c) => soma + c.peso, 0)
  let score = 0

  const proporcao = proporcaoPCD(answers.employees, answers.pcdCount)
  if (proporcao >= 0.05) score += PESO_PROPORCAO_PCD
  else if (proporcao > 0) score += 1

  const atendidos = []
  const naoAtendidos = []
  for (const criterio of CRITERIOS) {
    if (answers[criterio.key]) {
      score += criterio.peso
      atendidos.push(criterio)
    } else {
      naoAtendidos.push(criterio)
    }
  }

  const percentual = score / max
  let nivel = NIVEIS.INICIAL
  if (percentual >= 0.75) nivel = NIVEIS.AVANCADO
  else if (percentual >= 0.4) nivel = NIVEIS.EM_DESENVOLVIMENTO

  return { score, max, nivel, atendidos, naoAtendidos }
}
