export const kitsTematicos = [
  {
    tema: 'Fundamentos de Inclusão',
    descricao: 'O básico que toda liderança precisa saber sobre inclusão de PCD no trabalho.',
    slides: 19,
    accent: 'signal',
    arquivo: '/kits/fundamentos-de-inclusao.pdf',
  },
  {
    tema: 'Comunicação e Postura',
    descricao: 'Como se comunicar de forma respeitosa e eficaz com colaboradores PCD.',
    slides: 14,
    accent: 'volt',
    arquivo: '/kits/comunicacao-e-postura.pdf',
  },
  {
    tema: 'Gestão do Dia a Dia',
    descricao: 'Rotinas, adaptações e acompanhamento de desempenho de equipes inclusivas.',
    slides: 22,
    accent: 'amber',
    arquivo: '/kits/gestao-do-dia-a-dia.pdf',
  },
  {
    tema: 'Casos Práticos',
    descricao: 'Situações reais e como líderes devem agir diante de cada uma delas.',
    slides: 16,
    accent: 'signal',
    arquivo: '/kits/casos-praticos.pdf',
  },
]

export const kitsPorDeficiencia = [
  {
    tema: 'Deficiência Intelectual',
    descricao: 'O que fazer, o que dizer e o que evitar quando uma pessoa com deficiência intelectual entra na sua equipe.',
    slides: 12,
    accent: 'signal',
    arquivo: '/kits/deficiencia-intelectual.pdf',
    novo: true,
  },
  {
    tema: 'Autismo (TEA)',
    descricao: 'O que fazer, o que dizer e o que evitar quando uma pessoa no espectro autista entra na sua equipe.',
    slides: 12,
    accent: 'volt',
    arquivo: '/kits/autismo-tea.pdf',
    novo: true,
  },
  {
    tema: 'Deficiência Física e Mobilidade',
    descricao: 'O que fazer, o que dizer e o que evitar quando uma pessoa com deficiência física ou mobilidade reduzida entra na sua equipe.',
    slides: 12,
    accent: 'amber',
    arquivo: '/kits/deficiencia-fisica.pdf',
    novo: true,
  },
  {
    tema: 'Deficiência Visual',
    descricao: 'O que fazer, o que dizer e o que evitar quando uma pessoa com deficiência visual entra na sua equipe.',
    slides: 12,
    accent: 'signal',
    arquivo: '/kits/deficiencia-visual.pdf',
    novo: true,
  },
  {
    tema: 'Surdez e Deficiência Auditiva',
    descricao: 'O que fazer, o que dizer e o que evitar quando uma pessoa surda ou com deficiência auditiva entra na sua equipe.',
    slides: 12,
    accent: 'volt',
    arquivo: '/kits/surdez.pdf',
    novo: true,
  },
  {
    tema: 'Deficiências Invisíveis',
    descricao: 'O que fazer, o que dizer e o que evitar com colaboradores que têm condições crônicas, psicossociais ou limitações que ninguém vê.',
    slides: 12,
    accent: 'amber',
    arquivo: '/kits/deficiencia-invisivel.pdf',
    novo: true,
  },
  {
    tema: 'TDAH',
    descricao: 'O que fazer, o que dizer e o que evitar quando uma pessoa com déficit de atenção e hiperatividade entra na sua equipe.',
    slides: 12,
    accent: 'signal',
    arquivo: '/kits/tdah.pdf',
    novo: true,
  },
]

/** Todos os kits juntos — usado onde a origem (temático ou por deficiência) não importa,
 * como a contagem de "kits novos" no Painel. */
export const kits = [...kitsTematicos, ...kitsPorDeficiencia]

export const accentStyles = {
  signal: 'bg-signal-50 text-signal-700',
  volt: 'bg-volt-50 text-volt-700',
  amber: 'bg-amber-50 text-amber-700',
}
