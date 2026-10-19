import { supabase } from './supabase.js'

/** Lista todos os colaboradores da empresa (ativos e desligados), para o módulo Colaboradores. */
export async function getColaboradores(empresaId) {
  if (!empresaId) return []
  const { data, error } = await supabase
    .from('colaboradores')
    .select('*')
    .eq('empresa_id', empresaId)
    .order('nome', { ascending: true })
  if (error) throw error
  return data || []
}

export async function getColaborador(id) {
  const { data, error } = await supabase.from('colaboradores').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function criarColaborador({
  empresaId,
  nome,
  cargo,
  tipoDeficiencia,
  observacoesCondicao,
  dataAdmissao,
  contaCota,
}) {
  const { data, error } = await supabase
    .from('colaboradores')
    .insert({
      empresa_id: empresaId,
      nome,
      cargo: cargo || null,
      tipo_deficiencia: tipoDeficiencia || null,
      observacoes_condicao: observacoesCondicao || null,
      data_admissao: dataAdmissao || null,
      conta_cota: contaCota ?? true,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function atualizarColaborador(id, {
  nome,
  cargo,
  tipoDeficiencia,
  observacoesCondicao,
  dataAdmissao,
  dataDesligamento,
  contaCota,
}) {
  const { data, error } = await supabase
    .from('colaboradores')
    .update({
      nome,
      cargo: cargo || null,
      tipo_deficiencia: tipoDeficiencia || null,
      observacoes_condicao: observacoesCondicao || null,
      data_admissao: dataAdmissao || null,
      data_desligamento: dataDesligamento || null,
      conta_cota: contaCota ?? true,
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const TIPOS_DESLIGAMENTO = [
  { id: 'pedido_demissao', label: 'Pedido de demissão' },
  { id: 'sem_justa_causa', label: 'Dispensa sem justa causa', exigeSubstituto: true },
  { id: 'justa_causa', label: 'Dispensa por justa causa' },
  { id: 'termino_contrato', label: 'Término de contrato', exigeSubstituto: true },
  { id: 'acordo', label: 'Acordo entre as partes' },
  { id: 'aposentadoria', label: 'Aposentadoria' },
  { id: 'falecimento', label: 'Falecimento' },
  { id: 'outro', label: 'Outro' },
]

export function rotuloDesligamento(id) {
  return TIPOS_DESLIGAMENTO.find((t) => t.id === id)?.label || null
}

/** Registra a saída sem apagar o histórico — a pessoa deixa de contar na cota
 * (data_desligamento preenchida), mas avaliações, documentos e solicitações ficam. */
export async function registrarDesligamento(id, { data, tipo, motivo }) {
  const { data: atualizado, error } = await supabase
    .from('colaboradores')
    .update({ data_desligamento: data, tipo_desligamento: tipo, motivo_desligamento: motivo?.trim() || null })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return atualizado
}

/** Desfaz uma saída registrada por engano — a pessoa volta a contar na cota. */
export async function reverterDesligamento(id) {
  const { data, error } = await supabase
    .from('colaboradores')
    .update({ data_desligamento: null, tipo_desligamento: null, motivo_desligamento: null })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

/** Exclusão real do banco (não é soft-delete) — é direito do titular pela LGPD.
 * Avaliações, documentos e solicitações ligados a este colaborador são removidos em
 * cascata pelas FKs do banco (on delete cascade); os arquivos correspondentes nos
 * buckets de storage são removidos aqui antes, para não deixar cópias órfãs. */
export async function excluirColaborador(id, empresaId) {
  if (empresaId) {
    await Promise.all(
      ['documentos', 'solicitacoes'].map(async (bucket) => {
        const prefixo = `${empresaId}/${id}`
        const { data } = await supabase.storage.from(bucket).list(prefixo).catch(() => ({ data: null }))
        if (data?.length) {
          await supabase.storage.from(bucket).remove(data.map((f) => `${prefixo}/${f.name}`))
        }
      }),
    )
  }
  const { error } = await supabase.from('colaboradores').delete().eq('id', id)
  if (error) throw error
}

/** Quantidade de avaliações, documentos e solicitações ligados a um colaborador —
 * usado para avisar o que será perdido antes de confirmar a exclusão. */
export async function contarVinculosColaborador(id) {
  const [avaliacoes, documentos, solicitacoes] = await Promise.all([
    supabase.from('avaliacoes').select('id', { count: 'exact', head: true }).eq('colaborador_id', id),
    supabase.from('documentos').select('id', { count: 'exact', head: true }).eq('colaborador_id', id),
    supabase.from('solicitacoes_acessibilidade').select('id', { count: 'exact', head: true }).eq('colaborador_id', id),
  ])
  return {
    avaliacoes: avaliacoes.count || 0,
    documentos: documentos.count || 0,
    solicitacoes: solicitacoes.count || 0,
  }
}
