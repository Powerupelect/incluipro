// Lógica de pontuação do diagnóstico de maturidade em inclusão.
// Regra simples e transparente: cada resposta soma pontos; o total define o nível.

export const NIVEIS = {
  INICIAL: {
    id: 'inicial',
    label: 'Inicial',
    descricao:
      'Sua empresa está no começo da jornada de inclusão. Os processos ainda não são estruturados, o que representa risco de conformidade e pouca retenção de talentos PCD.',
  },
  EM_DESENVOLVIMENTO: {
    id: 'em_desenvolvimento',
    label: 'Em desenvolvimento',
    descricao:
      'Já existem iniciativas de inclusão, mas faltam processos padronizados de avaliação e capacitação de lideranças — o que limita escala e consistência.',
  },
  AVANCADO: {
    id: 'avancado',
    label: 'Avançado',
    descricao:
      'Sua empresa já trata inclusão como processo estruturado. O próximo passo é usar tecnologia para ganhar eficiência e profundidade nas avaliações e treinamentos.',
  },
}

function proporcaoPCD(employees, pcdCount) {
  const total = Number(employees) || 0
  const pcd = Number(pcdCount) || 0
  if (total <= 0) return 0
  return pcd / total
}

/**
 * Calcula o nível de maturidade em inclusão a partir das respostas do formulário.
 * @param {{employees: string, pcdCount: string, hasAssessmentProcess: boolean, trainsLeaders: boolean}} answers
 */
export function calcularMaturidade(answers) {
  let score = 0
  const max = 6

  const proporcao = proporcaoPCD(answers.employees, answers.pcdCount)
  if (proporcao >= 0.05) score += 2
  else if (proporcao > 0) score += 1

  if (answers.hasAssessmentProcess) score += 2
  if (answers.trainsLeaders) score += 2

  let nivel = NIVEIS.INICIAL
  if (score >= 5) nivel = NIVEIS.AVANCADO
  else if (score >= 3) nivel = NIVEIS.EM_DESENVOLVIMENTO

  return { score, max, nivel }
}
