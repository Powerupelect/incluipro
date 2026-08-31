import { supabase } from './supabase.js'

export const TIPOS_SOLICITACAO = [
  { id: 'recurso_assistivo', label: 'Recurso assistivo' },
  { id: 'interprete_libras', label: 'Intérprete de Libras' },
  { id: 'ajuste_ergonomico', label: 'Ajuste ergonômico' },
  { id: 'flexibilizacao_horario', label: 'Flexibilização de horário' },
  { id: 'adaptacao_posto', label: 'Adaptação de posto' },
]

export const STATUS_FLUXO = ['solicitado', 'em_analise', 'aprovado', 'executado', 'concluido']

export const STATUS_LABEL = {
  solicitado: 'Solicitado',
  em_analise: 'Em análise',
  aprovado: 'Aprovado',
  executado: 'Executado',
  concluido: 'Concluído',
  recusado: 'Recusado',
}

export const STATUS_COR = {
  solicitado: 'bg-mist-200 text-graphite-700',
  em_analise: 'bg-amber-100 text-amber-800',
  aprovado: 'bg-signal-100 text-signal-700',
  executado: 'bg-signal-100 text-signal-700',
  concluido: 'bg-emerald-100 text-emerald-800',
  recusado: 'bg-red-100 text-red-700',
}

export async function getColaboradoresAtivos(empresaId) {
  if (!empresaId) return []
  const { data, error } = await supabase
    .from('colaboradores')
    .select('*')
    .eq('empresa_id', empresaId)
    .is('data_desligamento', null)
    .order('nome', { ascending: true })
  if (error) throw error
  return data || []
}

export async function getSolicitacoes(empresaId) {
  if (!empresaId) return []
  const { data, error } = await supabase
    .from('solicitacoes_acessibilidade')
    .select('*, colaboradores(nome)')
    .eq('empresa_id', empresaId)
    .order('criado_em', { ascending: false })
  if (error) throw error
  return data || []
}

export async function criarSolicitacao({ empresaId, colaboradorId, tipo, descricao, dataPedido, solicitadoPor }) {
  const { data, error } = await supabase
    .from('solicitacoes_acessibilidade')
    .insert({
      empresa_id: empresaId,
      colaborador_id: colaboradorId,
      tipo,
      descricao,
      data_pedido: dataPedido || new Date().toISOString().slice(0, 10),
      solicitado_por: solicitadoPor || null,
    })
    .select('*, colaboradores(nome)')
    .single()
  if (error) throw error
  return data
}

export async function avancarStatus(id, novoStatus, { responsavel, prazo, motivoRecusa } = {}) {
  const patch = { status: novoStatus }
  if (responsavel !== undefined) patch.responsavel = responsavel
  if (prazo !== undefined) patch.prazo = prazo || null
  if (motivoRecusa !== undefined) patch.motivo_recusa = motivoRecusa || null
  const { data, error } = await supabase
    .from('solicitacoes_acessibilidade')
    .update(patch)
    .eq('id', id)
    .select('*, colaboradores(nome)')
    .single()
  if (error) throw error
  return data
}

export async function anexarComprovacao(id, empresaId, colaboradorId, arquivo) {
  const caminho = `${empresaId}/${colaboradorId}/${Date.now()}-${arquivo.name}`
  const { error: erroUpload } = await supabase.storage.from('solicitacoes').upload(caminho, arquivo)
  if (erroUpload) throw erroUpload
  const { data, error } = await supabase
    .from('solicitacoes_acessibilidade')
    .update({ anexo_path: caminho })
    .eq('id', id)
    .select('*, colaboradores(nome)')
    .single()
  if (error) throw error
  return data
}

export async function urlAssinadaAnexo(anexoPath) {
  const { data, error } = await supabase.storage.from('solicitacoes').createSignedUrl(anexoPath, 60 * 5)
  if (error) throw error
  return data.signedUrl
}

export function calcularMetricas(solicitacoes) {
  const total = solicitacoes.length
  const atendidas = solicitacoes.filter((s) => s.status === 'concluido')
  const naoRecusadas = solicitacoes.filter((s) => s.status !== 'recusado')

  const temposDias = atendidas
    .filter((s) => s.data_pedido && s.atualizado_em)
    .map((s) => {
      const inicio = new Date(s.data_pedido)
      const fim = new Date(s.atualizado_em)
      return Math.max(0, Math.round((fim - inicio) / 86400000))
    })
  const tempoMedioDias =
    temposDias.length > 0 ? Math.round(temposDias.reduce((a, b) => a + b, 0) / temposDias.length) : null

  const taxaAtendida = naoRecusadas.length > 0 ? Math.round((atendidas.length / naoRecusadas.length) * 100) : null

  const contagemPorTipo = {}
  for (const s of solicitacoes) {
    contagemPorTipo[s.tipo] = (contagemPorTipo[s.tipo] || 0) + 1
  }
  const tiposMaisPedidos = Object.entries(contagemPorTipo)
    .sort((a, b) => b[1] - a[1])
    .map(([tipo, quantidade]) => ({ tipo, quantidade }))

  return { total, tempoMedioDias, taxaAtendida, tiposMaisPedidos }
}
