// Papéis de acesso (admin/rh/gestor/leitura) e convites de equipe para uma empresa.

import { supabase } from './supabase.js'

export const PAPEL_LABEL = {
  admin: 'Admin — tudo, inclusive convidar',
  rh: 'RH — cria e edita tudo',
  gestor: 'Gestor — apenas a própria unidade',
  leitura: 'Leitura — visualizar e baixar',
}

export async function getMembros(empresaId) {
  if (!empresaId) return []
  const { data, error } = await supabase
    .from('membros_empresa')
    .select('*, contas(nome, email)')
    .eq('empresa_id', empresaId)
    .order('criado_em', { ascending: true })
  if (error) throw error
  return (data || []).map((m) => ({
    id: m.id,
    contaId: m.conta_id,
    emailConvite: m.email_convite,
    email: m.contas?.email || m.email_convite,
    nome: m.contas?.nome || null,
    papel: m.papel,
    unidadeId: m.unidade_id,
    pendente: !m.conta_id,
  }))
}

export async function convidarMembro({ empresaId, email, papel, unidadeId }) {
  const { data, error } = await supabase
    .from('membros_empresa')
    .insert({
      empresa_id: empresaId,
      email_convite: email.trim().toLowerCase(),
      papel: papel || 'rh',
      unidade_id: papel === 'gestor' ? unidadeId || null : null,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function atualizarPapelMembro(id, { papel, unidadeId }) {
  const { error } = await supabase
    .from('membros_empresa')
    .update({ papel, unidade_id: papel === 'gestor' ? unidadeId || null : null })
    .eq('id', id)
  if (error) throw error
}

export async function removerMembro(id) {
  const { error } = await supabase.from('membros_empresa').delete().eq('id', id)
  if (error) throw error
}

/** Vincula convites pendentes (sem conta ainda) ao usuário que acabou de logar/cadastrar,
 * casando pelo e-mail. Roda uma vez por login — silencioso se não houver convites. */
export async function aceitarConvitesPendentes(contaId, email) {
  if (!email) return
  const { data: pendentes, error } = await supabase
    .from('membros_empresa')
    .select('id')
    .is('conta_id', null)
    .eq('email_convite', email.trim().toLowerCase())
  if (error || !pendentes?.length) return
  for (const convite of pendentes) {
    await supabase.from('membros_empresa').update({ conta_id: contaId }).eq('id', convite.id)
  }
}
