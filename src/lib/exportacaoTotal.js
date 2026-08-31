// Exportação total dos dados da empresa — medo de aprisionamento trava compra corporativa.

import { supabase } from './supabase.js'

async function coletarDados(empresaId) {
  const [empresa, unidades, colaboradores, avaliacoes, membros] = await Promise.all([
    supabase.from('empresas').select('*').eq('id', empresaId).maybeSingle(),
    supabase.from('unidades').select('*').eq('empresa_id', empresaId),
    supabase.from('colaboradores').select('*').eq('empresa_id', empresaId),
    supabase.from('avaliacoes').select('*').eq('empresa_id', empresaId),
    supabase.from('membros_empresa').select('*').eq('empresa_id', empresaId),
  ])
  return {
    empresa: empresa.data,
    unidades: unidades.data || [],
    colaboradores: colaboradores.data || [],
    avaliacoes: avaliacoes.data || [],
    membros: membros.data || [],
  }
}

function baixarArquivo(conteudo, nomeArquivo, tipo) {
  const blob = new Blob([conteudo], { type: tipo })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nomeArquivo
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function exportarTudoJson(empresaId) {
  const dados = await coletarDados(empresaId)
  baixarArquivo(
    JSON.stringify({ exportadoEm: new Date().toISOString(), ...dados }, null, 2),
    `incluipro-exportacao-${new Date().toISOString().slice(0, 10)}.json`,
    'application/json',
  )
}

function paraCsv(linhas) {
  if (linhas.length === 0) return ''
  const colunas = Object.keys(linhas[0])
  const escapar = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  return [colunas.join(','), ...linhas.map((l) => colunas.map((c) => escapar(l[c])).join(','))].join('\n')
}

export async function exportarColaboradoresCsv(empresaId) {
  const { colaboradores } = await coletarDados(empresaId)
  baixarArquivo(
    paraCsv(colaboradores),
    `incluipro-colaboradores-${new Date().toISOString().slice(0, 10)}.csv`,
    'text/csv',
  )
}
