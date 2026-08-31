import { supabase } from './supabase.js'

export async function getCargos(empresaId) {
  if (!empresaId) return []
  const { data, error } = await supabase
    .from('cargos')
    .select('*')
    .eq('empresa_id', empresaId)
    .order('nome', { ascending: true })
  if (error) throw error
  return data || []
}

export async function criarCargo(dados, empresaId) {
  const { data, error } = await supabase
    .from('cargos')
    .insert({
      empresa_id: empresaId,
      nome: dados.nome,
      exigencia_visao: dados.exigenciaVisao || 0,
      exigencia_audicao: dados.exigenciaAudicao || 0,
      exigencia_mobilidade: dados.exigenciaMobilidade || 0,
      exigencia_comunicacao: dados.exigenciaComunicacao || 0,
      exigencia_cognicao: dados.exigenciaCognicao || 0,
      exigencia_esforco_fisico: dados.exigenciaEsforcoFisico || 0,
      exigencia_deslocamento: dados.exigenciaDeslocamento || 0,
      vagas_abertas: dados.vagasAbertas || 0,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function removerCargo(id) {
  const { error } = await supabase.from('cargos').delete().eq('id', id)
  if (error) throw error
}
