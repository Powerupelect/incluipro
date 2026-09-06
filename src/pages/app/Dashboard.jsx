import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../lib/auth.jsx'
import { getReports } from '../../lib/reports.js'
import { getEmpresa, contarPcdAtivos } from '../../lib/empresa.js'
import { kits } from '../../lib/kits.js'
import { Button } from '../../components/ui/Button.jsx'
import { PainelCota } from '../../components/PainelCota.jsx'
import { getDocumentos } from '../../lib/documentos.js'
import { getSolicitacoes } from '../../lib/solicitacoesAcessibilidade.js'
import { getColaboradores } from '../../lib/colaboradores.js'
import { calcularPendencias } from '../../lib/pendencias.js'
import { gerarResumoExecutivoPdf } from '../../lib/resumoExecutivo.js'
import { calcularCota } from '../../lib/cota.js'
import { StatusPonto, EstadoVazio } from '../../components/ui/Table.jsx'

export function Dashboard() {
  const { user } = useAuth()
  const [historico, setHistorico] = useState([])
  const [empresa, setEmpresa] = useState(null)
  const [pcdAtivos, setPcdAtivos] = useState(0)
  const [solicitacoes, setSolicitacoes] = useState([])
  const [pendencias, setPendencias] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [gerandoResumo, setGerandoResumo] = useState(false)

  useEffect(() => {
    if (!user?.empresaId) return
    let ativo = true
    setCarregando(true)
    Promise.all([
      getReports(user.empresaId),
      getEmpresa(user.empresaId),
      contarPcdAtivos(user.empresaId),
      getDocumentos(user.empresaId),
      getSolicitacoes(user.empresaId),
    ])
      .then(([relatorios, empresaData, count, docs, sols]) => {
        if (!ativo) return
        setHistorico(relatorios)
        setEmpresa(empresaData)
        setPcdAtivos(count)
        setSolicitacoes(sols)
        setPendencias(calcularPendencias(docs, sols))
      })
      .catch(() => {})
      .finally(() => {
        if (ativo) setCarregando(false)
      })
    return () => {
      ativo = false
    }
  }, [user?.empresaId])

  const recentes = historico.slice(0, 5)
  const novosKits = kits.filter((k) => k.novo)

  async function handleBaixarResumo() {
    if (!empresa || gerandoResumo) return
    setGerandoResumo(true)
    try {
      const colaboradores = await getColaboradores(user.empresaId)
      const agora = new Date()
      const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1)
      const noMes = (dataStr) => dataStr && new Date(dataStr) >= inicioMes

      const resultado = calcularCota({
        totalFuncionarios: empresa.total_funcionarios || 0,
        aprendizes: empresa.aprendizes || 0,
        aposentadosInvalidez: empresa.aposentados_invalidez || 0,
        pcdAtuais: pcdAtivos,
      })

      gerarResumoExecutivoPdf({
        empresaNome: empresa.nome || user.companyName,
        mesReferencia: agora.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        resultado,
        pcdAtivos,
        colaboradoresNovosNoMes: colaboradores.filter((c) => noMes(c.criado_em)).length,
        avaliacoesNoMes: historico.filter((r) => noMes(r.createdAt)).length,
        adaptacoesConcluidasNoMes: solicitacoes.filter((s) => s.status === 'concluido' && noMes(s.atualizado_em)).length,
        adaptacoesConcluidasTotal: solicitacoes.filter((s) => s.status === 'concluido').length,
        pendencias: pendencias || [],
      })
    } finally {
      setGerandoResumo(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold text-indigo-900">Painel</h1>
        <div className="flex flex-wrap gap-2">
          <Button as="button" variant="ghost" onClick={handleBaixarResumo} disabled={!empresa || gerandoResumo}>
            {gerandoResumo ? 'Gerando…' : 'Baixar resumo executivo'}
          </Button>
          <Button to="/app/avalia" size="lg">+ Nova avaliação</Button>
        </div>
      </div>

      {carregando ? (
        <p className="text-sm text-graphite-500">Carregando…</p>
      ) : (
        <>
          <PainelCota empresa={empresa} pcdAtivos={pcdAtivos} />

          <div className="mt-6 rounded-2xl border border-mist-300 bg-white p-6">
            <h2 className="text-base font-semibold text-graphite-900">Pendências</h2>
            {pendencias && pendencias.length > 0 ? (
              <ul className="mt-3 space-y-2.5">
                {pendencias.map((p, i) => (
                  <li key={i}>
                    {p.link ? (
                      <Link to={p.link} className="hover:underline">
                        <StatusPonto cor={p.cor}>{p.texto}</StatusPonto>
                      </Link>
                    ) : (
                      <StatusPonto cor={p.cor}>{p.texto}</StatusPonto>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-graphite-500">Nenhuma pendência identificada no momento.</p>
            )}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-2xl border border-mist-300 bg-white p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-graphite-900">Avaliações recentes</h2>
                <Link to="/app/avalia" className="text-xs font-semibold text-indigo-700 hover:text-signal-600">
                  Ver todas →
                </Link>
              </div>

              {recentes.length === 0 ? (
                <div className="mt-4">
                  <EstadoVazio
                    titulo="Nenhuma avaliação gerada ainda"
                    descricao="Comece uma nova avaliação para ver o resumo aqui."
                    acao={<Button to="/app/avalia" size="sm">Começar agora</Button>}
                  />
                </div>
              ) : (
                <ul className="mt-4 divide-y divide-mist-200">
                  {recentes.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-graphite-900">
                          {item.candidato}
                        </p>
                        <p className="truncate text-xs text-graphite-400">
                          {item.cargo || 'Cargo não informado'} ·{' '}
                          {new Date(item.updatedAt || item.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Link
                        to="/app/avalia"
                        className="shrink-0 text-xs font-semibold text-indigo-700 hover:text-signal-600"
                      >
                        Abrir
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-mist-300 bg-white p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-graphite-900">Treinamentos</h2>
                <Link to="/app/lidera" className="text-xs font-semibold text-indigo-700 hover:text-signal-600">
                  Ver todos →
                </Link>
              </div>
              <ul className="mt-4 space-y-3">
                {kits.map((kit) => (
                  <li key={kit.tema} className="flex items-center justify-between gap-3 rounded-xl border border-mist-200 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-graphite-900">{kit.tema}</p>
                      <p className="text-xs text-graphite-400">{kit.slides} slides</p>
                    </div>
                    {kit.novo && (
                      <span className="shrink-0 rounded-full bg-signal-600 px-2.5 py-1 text-[10px] font-bold text-white">
                        Novo
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              {novosKits.length > 0 && (
                <p className="mt-3 text-xs text-graphite-400">{novosKits.length} kit(s) novo(s) na biblioteca.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
