import { getEmpresa, getUnidades } from './empresa.js'
import { getReports } from './reports.js'
import { getDocumentos, TIPOS_DOCUMENTO } from './documentos.js'
import { getSolicitacoes, TIPOS_SOLICITACAO } from './solicitacoesAcessibilidade.js'
import { getSolicitacoesCanal } from './canalColaborador.js'
import { getColaboradores, rotuloDesligamento } from './colaboradores.js'
import { montarPainel } from './painelAnalitico.js'

export { gerarNumeroProtocolo, gerarHashIntegridade } from './integridade.js'

const noPeriodo = (data, inicio, fim) => Boolean(data) && data.slice(0, 10) >= inicio && data.slice(0, 10) <= fim

/** Reúne tudo o que o dossiê precisa. `inicio`/`fim` (AAAA-MM-DD) delimitam as
 * movimentações do período; a situação da cota e os indicadores são a foto do dia da emissão. */
export async function montarDadosDossie(empresaId, { inicio, fim } = {}) {
  const hoje = new Date().toLocaleDateString('sv')
  const ini = inicio || `${hoje.slice(0, 4)}-01-01`
  const fimP = fim || hoje

  const [empresa, avaliacoes, colaboradores, documentos, solicitacoes, canal, unidades] = await Promise.all([
    getEmpresa(empresaId),
    getReports(empresaId),
    getColaboradores(empresaId),
    getDocumentos(empresaId),
    getSolicitacoes(empresaId),
    getSolicitacoesCanal(empresaId).catch(() => []),
    getUnidades(empresaId).catch(() => []),
  ])

  const painel = montarPainel({
    empresa,
    colaboradores,
    documentos,
    solicitacoesInternas: solicitacoes,
    solicitacoesCanal: canal,
    avaliacoes,
    unidades,
  })

  const naCota = colaboradores.filter((c) => c.conta_cota !== false)
  const ativos = naCota.filter((c) => !c.data_desligamento)

  const quadro = ativos.map((c) => ({
    nome: c.nome,
    cargo: c.cargo || '—',
    tipoDeficiencia: c.tipo_deficiencia || '—',
    admissao: c.data_admissao || null,
  }))

  const documentacaoPorPessoa = ativos.map((colaborador) => {
    const docs = documentos.filter((d) => d.colaborador_id === colaborador.id)
    return {
      nome: colaborador.nome,
      documentos: TIPOS_DOCUMENTO.map((t) => {
        const doc = docs.find((d) => d.tipo === t.id)
        return { tipo: t.label, presente: Boolean(doc), validade: doc?.data_validade || null }
      }),
    }
  })

  const adaptacoes = solicitacoes
    .filter((s) => ['executado', 'concluido'].includes(s.status) && noPeriodo(s.atualizado_em, ini, fimP))
    .map((s) => ({
      colaborador: s.colaboradores?.nome || s.colaborador_nome || '—',
      tipo: TIPOS_SOLICITACAO.find((t) => t.id === s.tipo)?.label || s.tipo,
      data: s.atualizado_em?.slice(0, 10) || null,
      valor: Number(s.valor_recurso) || 0,
      temComprovante: Boolean(s.anexo_path),
    }))

  const movimentacao = {
    admissoes: naCota.filter((c) => noPeriodo(c.data_admissao, ini, fimP)).map((c) => ({ nome: c.nome, data: c.data_admissao })),
    desligamentos: naCota
      .filter((c) => noPeriodo(c.data_desligamento, ini, fimP))
      .map((c) => ({ nome: c.nome, data: c.data_desligamento, tipo: rotuloDesligamento(c.tipo_desligamento) || 'Não informado' })),
  }

  // Plano de Integração mais recente de cada colaborador ativo — vai como anexo no dossiê completo.
  const idsAtivos = new Set(ativos.map((c) => c.id))
  const planos = []
  const vistos = new Set()
  for (const a of avaliacoes) {
    if (!idsAtivos.has(a.colaboradorId) || vistos.has(a.colaboradorId) || !a.conteudo) continue
    vistos.add(a.colaboradorId)
    planos.push({ nome: a.candidato, cargo: a.cargo, data: (a.updatedAt || a.createdAt)?.slice(0, 10), conteudo: a.conteudo })
  }
  planos.sort((a, b) => a.nome.localeCompare(b.nome))

  return {
    empresa,
    periodo: { inicio: ini, fim: fimP },
    painel,
    quadro,
    documentacaoPorPessoa,
    adaptacoes,
    investimentoPeriodo: adaptacoes.reduce((s, a) => s + a.valor, 0),
    avaliacoesNoPeriodo: avaliacoes.filter((a) => noPeriodo(a.createdAt, ini, fimP)).length,
    movimentacao,
    planos,
  }
}
