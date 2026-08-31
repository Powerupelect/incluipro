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
