// Pendências reais do painel e do resumo executivo — só o que dá pra calcular a partir de
// dados que o sistema efetivamente rastreia (nada de métrica fictícia).

export function calcularPendencias(documentos, solicitacoes) {
  const hoje = new Date().toISOString().slice(0, 10)
  const pendencias = []

  const laudosSemBarreira = documentos.filter((d) => d.tipo === 'laudo' && !d.descreve_barreira_funcional)
  if (laudosSemBarreira.length > 0) {
    pendencias.push({
      cor: 'amber',
      texto: `${laudosSemBarreira.length} laudo${laudosSemBarreira.length !== 1 ? 's' : ''} sem descrição de barreira funcional`,
      link: '/app/documentos',
    })
  }

  const adaptacoesVencidas = solicitacoes.filter(
    (s) => s.prazo && s.prazo < hoje && s.status !== 'concluido' && s.status !== 'recusado',
  )
  if (adaptacoesVencidas.length > 0) {
    pendencias.push({
      cor: 'red',
      texto: `${adaptacoesVencidas.length} solicitação${adaptacoesVencidas.length !== 1 ? 'ões' : ''} de adaptação com prazo vencido`,
      link: '/app/solicitacoes',
    })
  }

  const documentosVencidos = documentos.filter((d) => d.data_validade && d.data_validade < hoje)
  if (documentosVencidos.length > 0) {
    pendencias.push({
      cor: 'amber',
      texto: `${documentosVencidos.length} documento${documentosVencidos.length !== 1 ? 's' : ''} vencido${documentosVencidos.length !== 1 ? 's' : ''}`,
      link: '/app/documentos',
    })
  }

  return pendencias
}
