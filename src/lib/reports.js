// Relatórios do IncluiPro Avalia — agora persistidos no Supabase (colaboradores + avaliacoes),
// em vez de localStorage. Cada relatório cria um colaborador novo nesta etapa (sem seletor de
// colaborador existente ainda); apagar o relatório apaga o colaborador junto (cascade).

import { supabase } from './supabase.js'

function mapAvaliacaoToReport(row) {
  const colaborador = row.colaboradores || {}
  return {
    id: row.id,
    colaboradorId: row.colaborador_id,
    createdAt: row.criado_em,
    updatedAt: row.atualizado_em,
    candidato: colaborador.nome || 'Candidato sem nome',
    cargo: colaborador.cargo || '',
    tipoDeficiencia: colaborador.tipo_deficiencia || '',
    observacoesCondicao: colaborador.observacoes_condicao || '',
    recursosSugeridos: row.recursos_sugeridos || [],
    conteudo: row.conteudo_gerado || '',
    editado: row.editado || false,
    rotina: row.rotina || '',
    historico: row.historico || '',
    necessidades: row.necessidades || '',
    expectativas: row.expectativas || '',
    observacoesErgonomicas: row.observacoes_ergonomicas || '',
    notasLivres: row.notas_livres || '',
  }
}

const SELECT_COM_COLABORADOR =
  '*, colaboradores(nome, cargo, tipo_deficiencia, observacoes_condicao)'

export async function getReports(empresaId) {
  if (!empresaId) return []
  const { data, error } = await supabase
    .from('avaliacoes')
    .select(SELECT_COM_COLABORADOR)
    .eq('empresa_id', empresaId)
    .order('criado_em', { ascending: false })
  if (error) throw error
  return (data || []).map(mapAvaliacaoToReport)
}

export async function saveReport(fields, empresaId) {
  if (!empresaId) throw new Error('Empresa não identificada.')

  const { data: colaborador, error: erroColaborador } = await supabase
    .from('colaboradores')
    .insert({
      empresa_id: empresaId,
      nome: fields.candidato || 'Candidato sem nome',
      cargo: fields.cargo || null,
      tipo_deficiencia: fields.tipoDeficiencia || null,
      observacoes_condicao: fields.observacoesCondicao || null,
    })
    .select()
    .single()
  if (erroColaborador) throw erroColaborador

  const { data: avaliacao, error: erroAvaliacao } = await supabase
    .from('avaliacoes')
    .insert({
      colaborador_id: colaborador.id,
      empresa_id: empresaId,
      rotina: fields.rotina || null,
      historico: fields.historico || null,
      necessidades: fields.necessidades || null,
      expectativas: fields.expectativas || null,
      observacoes_ergonomicas: fields.observacoesErgonomicas || null,
      notas_livres: fields.notasLivres || null,
      recursos_sugeridos: fields.recursosSugeridos || [],
      conteudo_gerado: fields.conteudo || '',
    })
    .select()
    .single()
  if (erroAvaliacao) throw erroAvaliacao

  return mapAvaliacaoToReport({ ...avaliacao, colaboradores: colaborador })
}

export async function updateReport(id, patch) {
  const { data: atual, error: erroBusca } = await supabase
    .from('avaliacoes')
    .select('colaborador_id')
    .eq('id', id)
    .single()
  if (erroBusca) throw erroBusca

  const patchColaborador = {}
  if (patch.candidato !== undefined) patchColaborador.nome = patch.candidato
  if (patch.cargo !== undefined) patchColaborador.cargo = patch.cargo
  if (patch.tipoDeficiencia !== undefined) patchColaborador.tipo_deficiencia = patch.tipoDeficiencia
  if (patch.observacoesCondicao !== undefined) {
    patchColaborador.observacoes_condicao = patch.observacoesCondicao
  }
  if (Object.keys(patchColaborador).length > 0) {
    const { error } = await supabase
      .from('colaboradores')
      .update(patchColaborador)
      .eq('id', atual.colaborador_id)
    if (error) throw error
  }

  const patchAvaliacao = { editado: true, atualizado_em: new Date().toISOString() }
  if (patch.conteudo !== undefined) patchAvaliacao.conteudo_gerado = patch.conteudo
  if (patch.recursosSugeridos !== undefined) patchAvaliacao.recursos_sugeridos = patch.recursosSugeridos
  if (patch.rotina !== undefined) patchAvaliacao.rotina = patch.rotina
  if (patch.historico !== undefined) patchAvaliacao.historico = patch.historico
  if (patch.necessidades !== undefined) patchAvaliacao.necessidades = patch.necessidades
  if (patch.expectativas !== undefined) patchAvaliacao.expectativas = patch.expectativas
  if (patch.observacoesErgonomicas !== undefined) {
    patchAvaliacao.observacoes_ergonomicas = patch.observacoesErgonomicas
  }
  if (patch.notasLivres !== undefined) patchAvaliacao.notas_livres = patch.notasLivres

  const { data: avaliacao, error: erroAvaliacao } = await supabase
    .from('avaliacoes')
    .update(patchAvaliacao)
    .eq('id', id)
    .select(SELECT_COM_COLABORADOR)
    .single()
  if (erroAvaliacao) throw erroAvaliacao

  return mapAvaliacaoToReport(avaliacao)
}

export async function deleteReport(id) {
  const { data: atual, error: erroBusca } = await supabase
    .from('avaliacoes')
    .select('colaborador_id')
    .eq('id', id)
    .single()
  if (erroBusca) throw erroBusca
  // Apaga o colaborador; a avaliação cascade-apaga junto (mapeamento 1:1 nesta etapa).
  const { error } = await supabase.from('colaboradores').delete().eq('id', atual.colaborador_id)
  if (error) throw error
}
