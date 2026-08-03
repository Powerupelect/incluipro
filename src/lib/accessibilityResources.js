// Base de recursos e ajustes de acessibilidade sugeridos por tipo de deficiência,
// usada na Consulta Rápida do IncluiPro Avalia. Conteúdo de referência geral —
// sempre validar com a pessoa candidata quais adaptações se aplicam ao caso real.

export const TIPOS_DEFICIENCIA = [
  {
    id: 'visual',
    label: 'Visual',
    aliases: ['visual', 'cego', 'cegueira', 'baixa visão', 'baixa visao'],
    recursos: [
      'Leitores de tela compatíveis (NVDA, JAWS, VoiceOver) em todos os sistemas usados no dia a dia',
      'Materiais em fonte ampliada e alto contraste',
      'Documentos em formato acessível (texto pesquisável, não imagem escaneada)',
      'Sinalização tátil e em Braille em áreas comuns e elevadores',
      'Descrição em áudio de conteúdos visuais em treinamentos e apresentações',
      'Rotas de circulação livres de obstáculos, sem mudanças de nível sem sinalização',
    ],
  },
  {
    id: 'fisica',
    label: 'Física',
    aliases: ['física', 'fisica', 'motora', 'cadeirante', 'mobilidade'],
    recursos: [
      'Rampas de acesso e elevadores em todos os ambientes de circulação',
      'Banheiros adaptados próximos ao posto de trabalho',
      'Mobiliário em altura ajustável (mesas, bancadas, apoios)',
      'Rotas de circulação largas e desobstruídas até o posto de trabalho',
      'Vaga de estacionamento reservada próxima à entrada',
      'Portas com abertura automática ou de fácil acionamento',
    ],
  },
  {
    id: 'auditiva',
    label: 'Auditiva',
    aliases: ['auditiva', 'surdo', 'surdez', 'deficiência auditiva'],
    recursos: [
      'Intérprete de Libras em reuniões, treinamentos e processos seletivos',
      'Legendas automáticas em vídeos e videochamadas',
      'Comunicação com apoio visual/escrito nas instruções do dia a dia',
      'Sinalização visual (luminosa) para alarmes e avisos sonoros',
      'Ambiente de trabalho com nível de ruído controlado',
      'Materiais de treinamento com transcrição escrita disponível',
    ],
  },
  {
    id: 'intelectual',
    label: 'Intelectual',
    aliases: ['intelectual', 'cognitiva leve'],
    recursos: [
      'Instruções em linguagem simples, direta e objetiva',
      'Divisão de tarefas complexas em etapas menores e sequenciais',
      'Apoio de tutoria ou mentoria no período de adaptação',
      'Rotinas de trabalho visuais e previsíveis',
      'Tempo adicional para aprendizagem de novos processos',
      'Feedback frequente, claro e específico sobre o desempenho',
    ],
  },
  {
    id: 'neurodivergente',
    label: 'Cognitiva / Neurodivergente',
    aliases: ['neurodivergente', 'tdah', 'autismo', 'tea', 'cognitiva'],
    recursos: [
      'Ambiente com estímulos sensoriais controlados (ruído, luminosidade)',
      'Comunicação direta e objetiva, evitando ambiguidades e figuras de linguagem',
      'Flexibilidade de horário sempre que a função permitir',
      'Pausas programadas ao longo da jornada de trabalho',
      'Instruções por escrito como complemento às orientações verbais',
      'Espaço de trabalho com menos distrações (fones, divisórias, isolamento acústico)',
    ],
  },
  {
    id: 'multipla',
    label: 'Múltipla',
    aliases: ['múltipla', 'multipla', 'multideficiência'],
    recursos: [
      'Avaliação combinada das necessidades específicas de cada condição envolvida',
      'Plano de adaptação individualizado, revisado periodicamente',
      'Envolvimento da pessoa candidata na definição das prioridades de ajuste',
      'Acompanhamento próximo nas primeiras semanas de trabalho',
      'Reavaliação periódica das adaptações conforme a rotina evolui',
    ],
  },
]

/** Tenta identificar a categoria a partir de um texto livre (ex: campo "Tipo de deficiência"). */
export function identificarCategoria(texto) {
  if (!texto) return null
  const normalizado = texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
  for (const tipo of TIPOS_DEFICIENCIA) {
    const match = tipo.aliases.some((alias) => {
      const aliasNormalizado = alias.normalize('NFD').replace(/[̀-ͯ]/g, '')
      return normalizado.includes(aliasNormalizado)
    })
    if (match) return tipo.id
  }
  return null
}

export function getTipoById(id) {
  return TIPOS_DEFICIENCIA.find((t) => t.id === id) || null
}
