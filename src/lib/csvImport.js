// Importação de colaboradores por CSV — parser simples (sem biblioteca), suporta campos entre
// aspas com vírgula/quebra de linha dentro. Cabeçalho esperado: nome,cargo,tipo_deficiencia,
// observacoes_condicao,unidade (unidade é o NOME da unidade, opcional).

import { supabase } from './supabase.js'
import { getUnidades, criarUnidade } from './empresa.js'

export const CABECALHO_ESPERADO = ['nome', 'cargo', 'tipo_deficiencia', 'observacoes_condicao', 'unidade']

export function gerarModeloCsv() {
  const linhaExemplo = [
    'Ana Beatriz Souza',
    'Analista de Atendimento',
    'Deficiência auditiva',
    'Usuária de aparelho auditivo bilateral, comunica-se por leitura labial e Libras',
    'Matriz',
  ]
  return [CABECALHO_ESPERADO.join(','), linhaExemplo.map((v) => `"${v.replace(/"/g, '""')}"`).join(',')].join('\n')
}

/** Parser CSV simples: lida com aspas duplas, vírgulas e quebras de linha dentro de campos. */
export function parseCsv(texto) {
  const linhas = []
  let campo = ''
  let linha = []
  let dentroDeAspas = false

  for (let i = 0; i < texto.length; i++) {
    const ch = texto[i]
    const proximo = texto[i + 1]

    if (dentroDeAspas) {
      if (ch === '"' && proximo === '"') {
        campo += '"'
        i++
      } else if (ch === '"') {
        dentroDeAspas = false
      } else {
        campo += ch
      }
      continue
    }

    if (ch === '"') {
      dentroDeAspas = true
    } else if (ch === ',') {
      linha.push(campo)
      campo = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && proximo === '\n') i++
      linha.push(campo)
      linhas.push(linha)
      linha = []
      campo = ''
    } else {
      campo += ch
    }
  }
  if (campo !== '' || linha.length > 0) {
    linha.push(campo)
    linhas.push(linha)
  }
  return linhas.filter((l) => l.some((c) => c.trim() !== ''))
}

/**
 * Valida e transforma as linhas de um CSV de colaboradores.
 * Retorna { validas: [{linha, dados}], erros: [{linha, motivo}] }.
 */
export function validarLinhasColaboradores(linhasCsv) {
  if (linhasCsv.length === 0) {
    return { validas: [], erros: [{ linha: 0, motivo: 'Arquivo vazio.' }] }
  }

  const cabecalho = linhasCsv[0].map((c) => c.trim().toLowerCase())
  const indiceNome = cabecalho.indexOf('nome')
  if (indiceNome === -1) {
    return {
      validas: [],
      erros: [{ linha: 1, motivo: 'Cabeçalho inválido: a coluna "nome" é obrigatória.' }],
    }
  }
  const indiceCargo = cabecalho.indexOf('cargo')
  const indiceTipo = cabecalho.indexOf('tipo_deficiencia')
  const indiceObs = cabecalho.indexOf('observacoes_condicao')
  const indiceUnidade = cabecalho.indexOf('unidade')

  const validas = []
  const erros = []

  for (let i = 1; i < linhasCsv.length; i++) {
    const numeroLinha = i + 1 // +1 porque a linha 1 é o cabeçalho
    const campos = linhasCsv[i]
    const nome = (campos[indiceNome] || '').trim()
    if (!nome) {
      erros.push({ linha: numeroLinha, motivo: 'Nome vazio — linha ignorada.' })
      continue
    }
    validas.push({
      linha: numeroLinha,
      dados: {
        nome,
        cargo: indiceCargo >= 0 ? (campos[indiceCargo] || '').trim() : '',
        tipoDeficiencia: indiceTipo >= 0 ? (campos[indiceTipo] || '').trim() : '',
        observacoesCondicao: indiceObs >= 0 ? (campos[indiceObs] || '').trim() : '',
        unidadeNome: indiceUnidade >= 0 ? (campos[indiceUnidade] || '').trim() : '',
      },
    })
  }

  return { validas, erros }
}

/**
 * Importa as linhas já validadas como colaboradores da empresa. Resolve o nome da unidade
 * para o id correspondente, criando a unidade se ainda não existir. Retorna
 * { importados, falhas: [{linha, motivo}] }.
 */
export async function importarColaboradores(validas, empresaId) {
  const unidadesExistentes = await getUnidades(empresaId)
  const unidadesPorNome = new Map(unidadesExistentes.map((u) => [u.nome.trim().toLowerCase(), u.id]))

  let importados = 0
  const falhas = []

  for (const { linha, dados } of validas) {
    try {
      let unidadeId = null
      if (dados.unidadeNome) {
        const chave = dados.unidadeNome.toLowerCase()
        if (unidadesPorNome.has(chave)) {
          unidadeId = unidadesPorNome.get(chave)
        } else {
          const novaUnidade = await criarUnidade({ empresaId, nome: dados.unidadeNome })
          unidadesPorNome.set(chave, novaUnidade.id)
          unidadeId = novaUnidade.id
        }
      }

      const { error } = await supabase.from('colaboradores').insert({
        empresa_id: empresaId,
        nome: dados.nome,
        cargo: dados.cargo || null,
        tipo_deficiencia: dados.tipoDeficiencia || null,
        observacoes_condicao: dados.observacoesCondicao || null,
        unidade_id: unidadeId,
      })
      if (error) throw error
      importados++
    } catch (err) {
      falhas.push({ linha, motivo: err.message || 'Erro ao importar esta linha.' })
    }
  }

  return { importados, falhas }
}
