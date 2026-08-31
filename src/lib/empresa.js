// Helpers de empresa. Nesta etapa cada conta tem uma empresa "atual" (a primeira criada);
// o seletor de múltiplas empresas (consultorias) fica para uma etapa futura.

import { supabase } from './supabase.js'

export async function getPrimeiraEmpresa(contaId) {
  const { data, error } = await supabase
    .from('empresas')
    .select('*')
    .eq('conta_id', contaId)
    .order('criado_em', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function criarEmpresa({ contaId, nome }) {
  const { data, error } = await supabase
    .from('empresas')
    .insert({ conta_id: contaId, nome: nome || 'Minha empresa' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getEmpresa(empresaId) {
  if (!empresaId) return null
  const { data, error } = await supabase.from('empresas').select('*').eq('id', empresaId).maybeSingle()
  if (error) throw error
  return data
}

export async function atualizarDadosCota(empresaId, { totalFuncionarios, aprendizes, aposentadosInvalidez }) {
  const { data, error } = await supabase
    .from('empresas')
    .update({
      total_funcionarios: totalFuncionarios,
      aprendizes,
      aposentados_invalidez: aposentadosInvalidez,
    })
    .eq('id', empresaId)
    .select()
    .single()
  if (error) throw error
  return data
}

/** Conta colaboradores ativos (sem data de desligamento) que contam para o cumprimento da cota. */
export async function contarPcdAtivos(empresaId) {
  const { count, error } = await supabase
    .from('colaboradores')
    .select('id', { count: 'exact', head: true })
    .eq('empresa_id', empresaId)
    .eq('conta_cota', true)
    .is('data_desligamento', null)
  if (error) throw error
  return count || 0
}
