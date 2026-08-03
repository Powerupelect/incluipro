// Montagem do relatório de avaliação social — sem IA. O conteúdo vem diretamente
// das anotações do avaliador e dos recursos de acessibilidade selecionados na
// Consulta Rápida, organizados no mesmo formato oficial do IncluiPro Avalia.

function bloco(label, texto) {
  if (!texto || !texto.trim()) return ''
  return `**${label}:** ${texto.trim()}\n\n`
}

export function montarRelatorio(dados) {
  const rotinaAutonomia =
    bloco('Rotina e autonomia', dados.rotina) +
    bloco('Histórico profissional', dados.historico) +
    bloco('Necessidades específicas no trabalho', dados.necessidades) +
    bloco('Expectativas do candidato', dados.expectativas)

  const observacoesAmbientais = dados.observacoesErgonomicas?.trim()
    ? `${dados.observacoesErgonomicas.trim()}\n`
    : '(Nenhuma observação ergonômica/ambiental registrada.)\n'

  let parecer = ''
  if (dados.notasLivres?.trim()) {
    parecer += `${dados.notasLivres.trim()}\n\n`
  }
  if (dados.recursosSugeridos?.length) {
    parecer += `**Recursos e adaptações sugeridas:**\n`
    parecer += dados.recursosSugeridos.map((r) => `- ${r}`).join('\n')
    parecer += '\n'
  }
  if (!parecer.trim()) {
    parecer = '(Nenhum parecer ou recomendação registrada pelo avaliador.)\n'
  }

  return `## Rotina e Autonomia
${rotinaAutonomia.trim()}

## Observações Ergonômicas e Ambientais
${observacoesAmbientais}

## Parecer e Recomendações
${parecer}`
}
