// Migração automática dos relatórios salvos no localStorage (versão pré-Supabase)
// para o banco de dados, executada uma vez no primeiro login de cada navegador.

import { supabase } from './supabase.js'

const REPORTS_KEY = 'incluipro_reports'
const MIGRACAO_FLAG_KEY = 'incluipro_migracao_concluida'

function lerRelatoriosLocaisAntigos() {
  try {
    return JSON.parse(localStorage.getItem(REPORTS_KEY)) || []
  } catch {
    return []
  }
}

/** Importa os relatórios antigos do navegador para a empresa informada. Roda uma vez por navegador. */
export async function migrarRelatoriosLocais(empresaId) {
  if (!empresaId) return { migrados: 0, total: 0 }
  if (localStorage.getItem(MIGRACAO_FLAG_KEY) === 'true') return { migrados: 0, total: 0, jaMigrado: true }

  const antigos = lerRelatoriosLocaisAntigos()
  if (antigos.length === 0) {
    localStorage.setItem(MIGRACAO_FLAG_KEY, 'true')
    return { migrados: 0, total: 0 }
  }

  let migrados = 0
  for (const antigo of antigos) {
    const { data: colaborador, error: erroColaborador } = await supabase
      .from('colaboradores')
      .insert({
        empresa_id: empresaId,
        nome: antigo.candidato || 'Candidato sem nome',
        cargo: antigo.cargo || null,
        tipo_deficiencia: antigo.tipoDeficiencia || null,
        observacoes_condicao: antigo.observacoesCondicao || null,
      })
      .select()
      .single()
    if (erroColaborador) continue

    const { error: erroAvaliacao } = await supabase.from('avaliacoes').insert({
      colaborador_id: colaborador.id,
      empresa_id: empresaId,
      recursos_sugeridos: antigo.recursosSugeridos || [],
      conteudo_gerado: antigo.conteudo || '',
      editado: Boolean(antigo.editado),
      criado_em: antigo.createdAt || new Date().toISOString(),
    })
    if (!erroAvaliacao) migrados++
  }

  localStorage.setItem(MIGRACAO_FLAG_KEY, 'true')
  if (migrados === antigos.length) {
    localStorage.removeItem(REPORTS_KEY)
  }
  return { migrados, total: antigos.length }
}
