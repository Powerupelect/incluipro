// Helpers de empresa. Desde a Etapa 6, o acesso a uma empresa passa por membros_empresa
// (papéis de acesso), não mais só por empresas.conta_id — uma conta pode ser convidada como
// membro de uma empresa que não criou.

import { supabase } from './supabase.js'

export async function getPrimeiraEmpresa(contaId) {
  const { data, error } = await supabase
    .from('membros_empresa')
    .select('empresa_id, papel, empresas(*)')
    .eq('conta_id', contaId)
    .order('criado_em', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  if (!data?.empresas) return null
  return { ...data.empresas, papel: data.papel }
}

export async function criarEmpresa({ contaId, nome }) {
  const { data, error } = await supabase
    .from('empresas')
    .insert({ conta_id: contaId, nome: nome || 'Minha empresa' })
    .select()
    .single()
  if (error) throw error

  const { error: erroMembro } = await supabase
    .from('membros_empresa')
    .insert({ empresa_id: data.id, conta_id: contaId, papel: 'admin' })
  if (erroMembro) throw erroMembro

  return { ...data, papel: 'admin' }
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

// ---------------------------------------------------------------------------------------
// Unidades
// ---------------------------------------------------------------------------------------

export async function getUnidades(empresaId) {
  if (!empresaId) return []
  const { data, error } = await supabase
    .from('unidades')
    .select('*')
    .eq('empresa_id', empresaId)
    .order('nome', { ascending: true })
  if (error) throw error
  return data || []
}

export async function criarUnidade({ empresaId, nome, cnpj, cidade, uf }) {
  const { data, error } = await supabase
    .from('unidades')
    .insert({ empresa_id: empresaId, nome, cnpj: cnpj || null, cidade: cidade || null, uf: uf || null })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function removerUnidade(id) {
  const { error } = await supabase.from('unidades').delete().eq('id', id)
  if (error) throw error
}
