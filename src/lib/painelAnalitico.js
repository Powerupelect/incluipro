// Métricas do Painel — tudo derivado de dados que o sistema realmente guarda.
// Função pura (sem Supabase) para poder ser testada com dados de exemplo.

import { calcularCota } from './cota.js'
import { TIPOS_DEFICIENCIA, identificarCategoria } from './accessibilityResources.js'

const DIA = 24 * 60 * 60 * 1000
const MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

function iso(d) {
  return d.toISOString().slice(0, 10)
}

function dataEntrada(c) {
  return c.data_admissao || (c.criado_em ? c.criado_em.slice(0, 10) : null)
}

export function montarPainel({
  empresa,
  colaboradores = [],
  documentos = [],
  solicitacoesInternas = [],
  solicitacoesCanal = [],
  avaliacoes = [],
  unidades = [],
  hoje = new Date(),
}) {
  const hojeIso = iso(hoje)
  const em90 = iso(new Date(hoje.getTime() + 90 * DIA))

  const naCota = colaboradores.filter((c) => c.conta_cota !== false)
  const ativos = naCota.filter((c) => !c.data_desligamento)
  const idsAtivos = new Set(ativos.map((c) => c.id))

  // ---------- Cota ----------
  const cota = empresa?.total_funcionarios
    ? calcularCota({
        totalFuncionarios: empresa.total_funcionarios || 0,
        aprendizes: empresa.aprendizes || 0,
        aposentadosInvalidez: empresa.aposentados_invalidez || 0,
        pcdAtuais: ativos.length,
      })
    : null

  // ---------- Evolução 12 meses ----------
  const serie = []
  for (let i = 11; i >= 0; i--) {
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
    const fim = new Date(hoje.getFullYear(), hoje.getMonth() - i + 1, 0)
    const ini = iso(inicio)
    const fimIso = iso(fim)
    const ativosNoMes = naCota.filter((c) => {
      const entrada = dataEntrada(c)
      return (!entrada || entrada <= fimIso) && (!c.data_desligamento || c.data_desligamento > fimIso)
    }).length
    serie.push({
      label: MESES_CURTOS[inicio.getMonth()],
      ano: inicio.getFullYear(),
      ativos: ativosNoMes,
      admissoes: naCota.filter((c) => c.data_admissao && c.data_admissao >= ini && c.data_admissao <= fimIso).length,
      desligamentos: naCota.filter((c) => c.data_desligamento && c.data_desligamento >= ini && c.data_desligamento <= fimIso).length,
    })
  }
  const semDataAdmissao = ativos.filter((c) => !c.data_admissao).length

  // ---------- Documentação ----------
  const laudoValidoPor = new Set(
    documentos
      .filter((d) => d.tipo === 'laudo' && (!d.data_validade || d.data_validade >= hojeIso))
      .map((d) => d.colaborador_id),
  )
  const comLaudoValido = ativos.filter((c) => laudoValidoPor.has(c.id)).length
  const laudosVencendo = documentos
    .filter((d) => idsAtivos.has(d.colaborador_id) && d.data_validade && d.data_validade >= hojeIso && d.data_validade <= em90)
    .sort((a, b) => a.data_validade.localeCompare(b.data_validade))
  const documentosVencidos = documentos.filter((d) => idsAtivos.has(d.colaborador_id) && d.data_validade && d.data_validade < hojeIso)
  const laudosSemBarreira = documentos.filter((d) => idsAtivos.has(d.colaborador_id) && d.tipo === 'laudo' && !d.descreve_barreira_funcional)

  // ---------- Planos de integração ----------
  const comPlano = new Set(avaliacoes.map((a) => a.colaboradorId))
  const semPlano = ativos.filter((c) => !comPlano.has(c.id))

  // ---------- Solicitações ----------
  const canalSoltas = solicitacoesCanal.filter((s) => !s.solicitacao_acessibilidade_id)
  const etapas = [
    {
      id: 'recebidas',
      label: 'Recebidas',
      valor:
        solicitacoesInternas.filter((s) => s.status === 'solicitado').length +
        canalSoltas.filter((s) => s.status === 'recebida').length,
    },
    {
      id: 'analise',
      label: 'Em análise',
      valor:
        solicitacoesInternas.filter((s) => s.status === 'em_analise').length +
        canalSoltas.filter((s) => s.status === 'em_analise').length,
    },
    {
      id: 'execucao',
      label: 'Em execução',
      valor:
        solicitacoesInternas.filter((s) => ['aprovado', 'executado'].includes(s.status)).length +
        canalSoltas.filter((s) => s.status === 'aprovada').length,
    },
    {
      id: 'concluidas',
      label: 'Concluídas',
      valor:
        solicitacoesInternas.filter((s) => s.status === 'concluido').length +
        canalSoltas.filter((s) => s.status === 'concluida').length,
    },
  ]
  const recusadas =
    solicitacoesInternas.filter((s) => s.status === 'recusado').length +
    canalSoltas.filter((s) => ['recusada', 'descartada'].includes(s.status)).length
  const abertas = etapas[0].valor + etapas[1].valor + etapas[2].valor

  const concluidasComTempo = solicitacoesInternas
    .filter((s) => s.status === 'concluido' && s.atualizado_em && (s.data_pedido || s.criado_em))
    .map((s) => (new Date(s.atualizado_em) - new Date(s.data_pedido || s.criado_em)) / DIA)
    .filter((d) => d >= 0)
  const tempoMedioDias = concluidasComTempo.length
    ? Math.round(concluidasComTempo.reduce((a, b) => a + b, 0) / concluidasComTempo.length)
    : null

  const investimento = solicitacoesInternas
    .filter((s) => s.status !== 'recusado' && s.valor_recurso)
    .reduce((soma, s) => soma + Number(s.valor_recurso || 0), 0)

  const prazosVencidos = solicitacoesInternas.filter(
    (s) => s.prazo && s.prazo < hojeIso && !['concluido', 'recusado'].includes(s.status),
  )

  // ---------- Perfil por deficiência ----------
  const contagem = Object.fromEntries(TIPOS_DEFICIENCIA.map((t) => [t.id, 0]))
  let naoClassificado = 0
  for (const c of ativos) {
    const id = identificarCategoria(c.tipo_deficiencia)
    if (id) contagem[id] += 1
    else naoClassificado += 1
  }
  const ordenado = TIPOS_DEFICIENCIA.map((t) => ({ id: t.id, label: t.label, valor: contagem[t.id] }))
    .filter((t) => t.valor > 0)
    .sort((a, b) => b.valor - a.valor)
  // Até 4 tipos com cor própria; o restante vira "Outros" em cinza (paleta validada para 4 cores).
  const perfil = ordenado.slice(0, 4)
  const outros = ordenado.slice(4).reduce((s, t) => s + t.valor, 0) + naoClassificado
  if (outros > 0) perfil.push({ id: 'outros', label: naoClassificado && ordenado.length <= 4 ? 'Não classificado' : 'Outros', valor: outros, neutro: true })

  // ---------- Unidades ----------
  const porUnidade = unidades
    .map((u) => ({ id: u.id, label: u.nome, valor: ativos.filter((c) => c.unidade_id === u.id).length }))
    .sort((a, b) => b.valor - a.valor)
  const semUnidade = ativos.filter((c) => !c.unidade_id).length
  if (unidades.length > 0 && semUnidade > 0) porUnidade.push({ id: 'sem', label: 'Sem unidade', valor: semUnidade, neutro: true })

  // ---------- Retenção ----------
  const ha12m = iso(new Date(hoje.getFullYear() - 1, hoje.getMonth(), hoje.getDate()))
  const desligados12m = naCota.filter((c) => c.data_desligamento && c.data_desligamento >= ha12m).length
  const baseRetencao = ativos.length + desligados12m
  const retencao = baseRetencao > 0 ? Math.round((ativos.length / baseRetencao) * 100) : null

  // ---------- Alertas ----------
  const nomeDe = Object.fromEntries(colaboradores.map((c) => [c.id, c.nome]))
  const alertas = []
  if (prazosVencidos.length)
    alertas.push({ nivel: 'critico', titulo: `${prazosVencidos.length} ${prazosVencidos.length > 1 ? 'adaptações' : 'adaptação'} com prazo vencido`, detalhe: prazosVencidos.slice(0, 2).map((s) => s.colaboradores?.nome || s.colaborador_nome).filter(Boolean).join(', '), link: '/app/solicitacoes' })
  if (documentosVencidos.length)
    alertas.push({ nivel: 'critico', titulo: `${documentosVencidos.length} documento${documentosVencidos.length > 1 ? 's' : ''} vencido${documentosVencidos.length > 1 ? 's' : ''}`, detalhe: documentosVencidos.slice(0, 2).map((d) => nomeDe[d.colaborador_id]).filter(Boolean).join(', '), link: '/app/documentos' })
  if (laudosVencendo.length)
    alertas.push({ nivel: 'atencao', titulo: `${laudosVencendo.length} laudo${laudosVencendo.length > 1 ? 's' : ''} vence${laudosVencendo.length > 1 ? 'm' : ''} em até 90 dias`, detalhe: laudosVencendo.slice(0, 2).map((d) => `${nomeDe[d.colaborador_id] || 'Colaborador'} · ${new Date(d.data_validade + 'T12:00').toLocaleDateString('pt-BR')}`).join(' — '), link: '/app/documentos' })
  if (semPlano.length)
    alertas.push({ nivel: 'atencao', titulo: `${semPlano.length} colaborador${semPlano.length > 1 ? 'es' : ''} sem plano de integração`, detalhe: semPlano.slice(0, 2).map((c) => c.nome).join(', '), link: '/app/avalia' })
  if (laudosSemBarreira.length)
    alertas.push({ nivel: 'info', titulo: `${laudosSemBarreira.length} laudo${laudosSemBarreira.length > 1 ? 's' : ''} sem descrição de barreira funcional`, detalhe: 'Exigido para caracterizar a deficiência', link: '/app/documentos' })
  if (abertas && etapas[0].valor)
    alertas.push({ nivel: 'info', titulo: `${etapas[0].valor} ${etapas[0].valor > 1 ? 'solicitações' : 'solicitação'} aguardando primeira análise`, detalhe: 'Recebidas e ainda não analisadas', link: '/app/solicitacoes' })

  return {
    cota,
    ativos: ativos.length,
    serie,
    semDataAdmissao,
    documentacao: { comLaudoValido, total: ativos.length, pct: ativos.length ? Math.round((comLaudoValido / ativos.length) * 100) : null },
    laudosVencendo: laudosVencendo.length,
    planos: { com: ativos.length - semPlano.length, total: ativos.length, pct: ativos.length ? Math.round(((ativos.length - semPlano.length) / ativos.length) * 100) : null },
    solicitacoes: { etapas, recusadas, abertas, tempoMedioDias, investimento, prazosVencidos: prazosVencidos.length },
    perfil,
    porUnidade,
    retencao: { pct: retencao, desligados12m, admitidos12m: naCota.filter((c) => c.data_admissao && c.data_admissao >= ha12m).length },
    alertas,
  }
}
