import { getEmpresa, contarPcdAtivos } from './empresa.js'
import { calcularCota, corSemaforo } from './cota.js'
import { getReports } from './reports.js'
import { getColaboradoresComDeficiencia, getDocumentos, TIPOS_DOCUMENTO } from './documentos.js'
import { getSolicitacoes, TIPOS_SOLICITACAO } from './solicitacoesAcessibilidade.js'
import { getCargos } from './cargos.js'
import { classificarCompatibilidade } from './matrizCompatibilidade.js'
import { TIPOS_DEFICIENCIA } from './accessibilityResources.js'

export const SEM_REGISTRO =
  'Sem registro estruturado nesta versão do sistema — completar manualmente antes do envio à fiscalização.'

export function gerarNumeroProtocolo(empresaId) {
  const data = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const sufixo = (empresaId || '').replace(/-/g, '').slice(0, 8).toUpperCase()
  return `IP-${data}-${sufixo}`
}

export async function gerarHashIntegridade(texto) {
  const encoder = new TextEncoder()
  const dados = encoder.encode(texto)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dados)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 24)
    .toUpperCase()
}

export async function montarDadosDossie(empresaId) {
  const [empresa, pcdAtivos, relatorios, colaboradoresComDef, documentos, solicitacoes, cargos] = await Promise.all([
    getEmpresa(empresaId),
    contarPcdAtivos(empresaId),
    getReports(empresaId),
    getColaboradoresComDeficiencia(empresaId),
    getDocumentos(empresaId),
    getSolicitacoes(empresaId),
    getCargos(empresaId),
  ])

  const cota =
    empresa && empresa.total_funcionarios > 0
      ? calcularCota({
          totalFuncionarios: empresa.total_funcionarios || 0,
          aprendizes: empresa.aprendizes || 0,
          aposentadosInvalidez: empresa.aposentados_invalidez || 0,
          pcdAtuais: pcdAtivos,
        })
      : null

  const documentacaoPorPessoa = colaboradoresComDef.map((colaborador) => {
    const docs = documentos.filter((d) => d.colaborador_id === colaborador.id)
    return {
      colaborador,
      documentos: TIPOS_DOCUMENTO.map((t) => ({
        tipo: t.label,
        presente: docs.some((d) => d.tipo === t.id),
        validade: docs.find((d) => d.tipo === t.id)?.data_validade || null,
      })),
    }
  })

  const adaptacoesExecutadas = solicitacoes
    .filter((s) => s.status === 'executado' || s.status === 'concluido')
    .map((s) => ({
      colaborador: s.colaboradores?.nome || '—',
      tipo: TIPOS_SOLICITACAO.find((t) => t.id === s.tipo)?.label || s.tipo,
      data: s.atualizado_em,
      temComprovante: Boolean(s.anexo_path),
    }))

  const mapeamentoCargos = cargos.map((cargo) => ({
    cargo: cargo.nome,
    compatibilidades: TIPOS_DEFICIENCIA.map((tipo) => ({
      tipo: tipo.label,
      status: classificarCompatibilidade(cargo, tipo.id).status,
    })),
  }))

  const anoAtual = new Date().getFullYear()
  const admitidosNoAno = colaboradoresComDef.filter(
    (c) => c.data_admissao && new Date(c.data_admissao).getFullYear() === anoAtual,
  ).length
  const desligadosNoAno = colaboradoresComDef.filter(
    (c) => c.data_desligamento && new Date(c.data_desligamento).getFullYear() === anoAtual,
  ).length

  return {
    empresa,
    periodo: { inicio: `01/01/${anoAtual}`, fim: new Date().toLocaleDateString('pt-BR') },
    cota,
    pcdAtivos,
    relatorios,
    documentacaoPorPessoa,
    adaptacoesExecutadas,
    capacitacoes: null, // sem fonte de dados — ver SEM_REGISTRO
    mapeamentoCargos,
    investimentoAcessibilidade: null, // sem fonte de dados — ver SEM_REGISTRO
    planoDeAcao: null, // sem fonte de dados — ver SEM_REGISTRO
    esforcosRecrutamento: null, // sem fonte de dados — ver SEM_REGISTRO
    evolucaoNoAno: { admitidosNoAno, desligadosNoAno },
    semaforo: cota ? corSemaforo(cota.percentualCumprimento) : null,
  }
}
