// Sugestões de redação por tipo de deficiência, para ajudar o RH a começar a escrever os
// campos de "Necessidades específicas" e "Observações ergonômicas" do IncluiPro Avalia.
// São pontos de partida — o avaliador sempre edita e valida com a pessoa candidata.

export const SUGESTOES_REDACAO = {
  visual: {
    necessidades: 'O candidato pode necessitar de leitor de tela compatível com os sistemas utilizados, materiais em formato acessível (texto pesquisável) e documentos em fonte ampliada ou alto contraste, conforme o grau da condição.',
    observacoesErgonomicas: 'Recomenda-se avaliar rotas de circulação livres de obstáculos, sinalização tátil em áreas comuns e iluminação adequada ao posto de trabalho.',
  },
  fisica: {
    necessidades: 'O candidato pode necessitar de mobiliário em altura ajustável, rotas de circulação largas e desobstruídas até o posto de trabalho, e banheiro adaptado próximo.',
    observacoesErgonomicas: 'Recomenda-se verificar acesso por rampas ou elevadores, portas de fácil acionamento e vaga de estacionamento reservada, se aplicável.',
  },
  auditiva: {
    necessidades: 'O candidato pode necessitar de intérprete de Libras em reuniões e treinamentos, legendas em vídeos e videochamadas, e comunicação com apoio visual/escrito no dia a dia.',
    observacoesErgonomicas: 'Recomenda-se ambiente com nível de ruído controlado e sinalização visual (luminosa) para alarmes e avisos sonoros.',
  },
  intelectual: {
    necessidades: 'O candidato pode se beneficiar de instruções em linguagem simples e objetiva, divisão de tarefas complexas em etapas menores, e apoio de tutoria no período de adaptação.',
    observacoesErgonomicas: 'Recomenda-se rotina de trabalho visual e previsível, com feedback frequente e específico sobre o desempenho.',
  },
  neurodivergente: {
    necessidades: 'O candidato pode se beneficiar de comunicação direta e objetiva, instruções por escrito como complemento às orientações verbais, e flexibilidade de horário sempre que a função permitir.',
    observacoesErgonomicas: 'Recomenda-se ambiente com estímulos sensoriais controlados (ruído, luminosidade) e espaço de trabalho com menos distrações.',
  },
  multipla: {
    necessidades: 'Recomenda-se avaliação combinada das necessidades específicas de cada condição envolvida, com plano de adaptação individualizado e revisado periodicamente.',
    observacoesErgonomicas: 'Recomenda-se acompanhamento próximo nas primeiras semanas de trabalho e reavaliação periódica das adaptações conforme a rotina evolui.',
  },
}

export function getSugestaoRedacao(categoriaId, campo) {
  return SUGESTOES_REDACAO[categoriaId]?.[campo] || null
}
