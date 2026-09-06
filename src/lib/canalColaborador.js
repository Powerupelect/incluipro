// Canal de solicitações do colaborador — módulo público (sem login). O colaborador acessa
// um link próprio da empresa e registra um pedido; o RH acompanha pelo painel autenticado.
// Ver netlify/functions/canal-solicitar.mjs para o envio público (honeypot + limite por IP).

import { supabase } from './supabase.js'

export const TIPOS_CANAL = [
  { id: 'recurso_assistivo', label: 'Recurso ou equipamento assistivo' },
  { id: 'adaptacao_posto', label: 'Adaptação do posto de trabalho' },
  { id: 'interprete_libras', label: 'Intérprete de Libras' },
  { id: 'material_acessivel', label: 'Material em formato acessível' },
  { id: 'flexibilizacao_horario', label: 'Flexibilização de horário ou jornada' },
  { id: 'acessibilidade_ambiente', label: 'Acessibilidade do ambiente físico' },
  { id: 'outro', label: 'Outro' },
]

export const STATUS_CANAL_FLUXO = ['recebida', 'em_analise', 'aprovada', 'concluida']

export const STATUS_CANAL_LABEL = {
  recebida: 'Recebida',
  em_analise: 'Em análise',
  aprovada: 'Aprovada',
  concluida: 'Concluída',
  recusada: 'Recusada',
  descartada: 'Descartada',
}

export const STATUS_CANAL_PONTO_COR = {
  recebida: 'neutro',
  em_analise: 'amber',
  aprovada: 'signal',
  concluida: 'signal',
  recusada: 'red',
  descartada: 'neutro',
}

const ABREVIACAO_MAX = 6
const ALFABETO_SUFIXO = 'abcdefghijklmnopqrstuvwxyz0123456789'

function gerarSufixo(tamanho) {
  let s = ''
  for (let i = 0; i < tamanho; i++) {
    s += ALFABETO_SUFIXO[Math.floor(Math.random() * ALFABETO_SUFIXO.length)]
  }
  return s
}

/** Gera o identificador público (slug do link) de uma empresa — não sequencial,
 * pensado para ser imutável após criado (ver criarEmpresa em lib/empresa.js). */
export function gerarIdentificadorPublico(nomeEmpresa) {
  const abreviacao =
    (nomeEmpresa || '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((palavra) => palavra[0])
      .join('')
      .slice(0, ABREVIACAO_MAX) || 'ip'
  return `${abreviacao}-${gerarSufixo(4)}`
}

/** Gera e grava o identificador público de uma empresa que ainda não tem um —
 * cobre empresas criadas antes deste módulo existir (criarEmpresa já gera na criação). */
export async function gerarESalvarIdentificadorPublico(empresaId, nomeEmpresa) {
  let data = null
  let erro = null
  for (let tentativa = 0; tentativa < 5 && !data; tentativa++) {
    const resultado = await supabase
      .from('empresas')
      .update({ identificador_publico: gerarIdentificadorPublico(nomeEmpresa) })
      .eq('id', empresaId)
      .select()
      .single()
    if (!resultado.error) {
      data = resultado.data
    } else if (resultado.error.code === '23505') {
      erro = resultado.error
    } else {
      throw resultado.error
    }
  }
  if (!data) throw erro || new Error('Não foi possível gerar o link agora.')
  return data
}

/** Resolve a empresa a partir do slug da URL pública — só os dados necessários para
 * identificar a empresa no topo do formulário (nunca colaboradores, dados internos etc). */
export async function getEmpresaPorSlug(slug) {
  if (!slug) return null
  const { data, error } = await supabase
    .from('empresas_publico')
    .select('id, nome, identificador_publico')
    .eq('identificador_publico', slug)
    .maybeSingle()
  if (error) throw error
  return data
}

/** Consulta pública de andamento por protocolo — só status e data, nunca conteúdo. */
export async function consultarProtocolo(protocolo) {
  const { data, error } = await supabase
    .from('solicitacoes_canal_status')
    .select('protocolo, status, atualizada_em')
    .eq('protocolo', protocolo.trim().toUpperCase())
    .maybeSingle()
  if (error) throw error
  return data
}

/** Pedidos recebidos pelo canal, para o painel do RH. */
export async function getSolicitacoesCanal(empresaId) {
  if (!empresaId) return []
  const { data, error } = await supabase
    .from('solicitacoes_canal')
    .select('*')
    .eq('empresa_id', empresaId)
    .order('criada_em', { ascending: false })
  if (error) throw error
  return data || []
}

export async function atualizarStatusCanal(id, { status, motivoRecusa, observacaoInterna }) {
  const patch = {}
  if (status !== undefined) patch.status = status
  if (motivoRecusa !== undefined) patch.motivo_recusa = motivoRecusa || null
  if (observacaoInterna !== undefined) patch.observacao_interna = observacaoInterna || null
  const { data, error } = await supabase
    .from('solicitacoes_canal')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

/** Promove um pedido aprovado do canal para um registro rastreado em Solicitações
 * (solicitacoes_acessibilidade), mantendo o vínculo com o protocolo de origem. */
export async function promoverParaSolicitacao(canalId, { empresaId, colaboradorId, tipo, descricao, protocolo }) {
  const { data: nova, error: erroNova } = await supabase
    .from('solicitacoes_acessibilidade')
    .insert({
      empresa_id: empresaId,
      colaborador_id: colaboradorId,
      tipo,
      descricao,
      canal_protocolo: protocolo || null,
    })
    .select('*, colaboradores(nome)')
    .single()
  if (erroNova) throw erroNova

  const { error: erroCanal } = await supabase
    .from('solicitacoes_canal')
    .update({ solicitacao_acessibilidade_id: nova.id })
    .eq('id', canalId)
  if (erroCanal) throw erroCanal

  return nova
}
