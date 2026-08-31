// Motor de triagem documental do IncluiPro Avalia — Etapa 8.
// Importante: o resultado é um indicativo de risco documental (dados ausentes,
// vencidos ou incompletos), nunca um parecer jurídico ou médico sobre o
// enquadramento da pessoa na cota.

export function analisarColaborador(colaborador, documentos) {
  const docsDoColaborador = documentos.filter((d) => d.colaborador_id === colaborador.id)
  const motivos = []

  const laudo = docsDoColaborador.find((d) => d.tipo === 'laudo')
  if (!laudo) {
    motivos.push('Laudo caracterizador ausente.')
  } else if (!laudo.descreve_barreira_funcional) {
    motivos.push('Laudo cadastrado, mas sem descrição da barreira funcional.')
  }

  const hoje = new Date().toISOString().slice(0, 10)
  const vencidos = docsDoColaborador.filter((d) => d.data_validade && d.data_validade < hoje)
  if (vencidos.length > 0) {
    motivos.push(
      vencidos.length === 1
        ? '1 documento vencido.'
        : `${vencidos.length} documentos vencidos.`,
    )
  }

  if (colaborador.conta_cota === false) {
    motivos.push('Colaborador marcado como não contabilizado no cumprimento da cota (ex.: contrato intermitente).')
  }

  return { emRisco: motivos.length > 0, motivos }
}

export function resumoTriagem(colaboradores, documentos) {
  const analisados = colaboradores.map((colaborador) => ({
    colaborador,
    ...analisarColaborador(colaborador, documentos),
  }))
  const emRisco = analisados.filter((a) => a.emRisco).length
  const consistentes = analisados.length - emRisco
  return { total: analisados.length, consistentes, emRisco, analisados }
}
