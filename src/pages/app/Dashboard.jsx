import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../lib/auth.jsx'
import { getReports } from '../../lib/reports.js'
import { getEmpresa, contarPcdAtivos } from '../../lib/empresa.js'
import { kits } from '../../lib/kits.js'
import { Button } from '../../components/ui/Button.jsx'
import { PainelCota } from '../../components/PainelCota.jsx'
import { getDocumentos } from '../../lib/documentos.js'
import { getSolicitacoes } from '../../lib/solicitacoesAcessibilidade.js'
import { getSolicitacoesCanal } from '../../lib/canalColaborador.js'
import { calcularPendencias } from '../../lib/pendencias.js'
import { calcularCota, corSemaforo } from '../../lib/cota.js'
import { tendenciaMensal, contagemPorMes } from '../../lib/painelMetricas.js'
import { StatusPonto, EstadoVazio } from '../../components/ui/Table.jsx'

const STATUS_INTERNO_ABERTO = (s) => !['concluido', 'recusado'].includes(s.status)
const STATUS_CANAL_ABERTO = (s) => !['concluida', 'recusada', 'descartada'].includes(s.status)

const HOJE_FORMATADO = new Date().toLocaleDateString('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

const ICONE_PESSOAS = (
  <>
    <circle cx="9" cy="8" r="3" />
    <path d="M3 20c.9-3 3-5 6-5s5.1 2 6 5M16 5.5a3 3 0 010 5.8M20.5 20c-.5-2.3-1.7-4-3.5-5" />
  </>
)
const ICONE_ALVO = (
  <>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="0.5" fill="currentColor" />
  </>
)
const ICONE_DOCUMENTO = <path d="M6 4h9l3 3v13a1 1 0 01-1 1H6a1 1 0 01-1-1V5a1 1 0 011-1zM8 12h8M8 16h5M8 8h4" />
const ICONE_CAIXA_ENTRADA = (
  <path d="M4 12h4l1.5 3h5L16 12h4M4 12l1.6-6.4A1 1 0 016.56 5h10.88a1 1 0 01.96.6L20 12M4 12v6a1 1 0 001 1h14a1 1 0 001-1v-6" />
)

function iniciais(nome) {
  const partes = (nome || '').trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

export function Dashboard() {
  const { user } = useAuth()
  const [historico, setHistorico] = useState([])
  const [empresa, setEmpresa] = useState(null)
  const [pcdAtivos, setPcdAtivos] = useState(0)
  const [solicitacoesInternas, setSolicitacoesInternas] = useState([])
  const [solicitacoesCanal, setSolicitacoesCanal] = useState([])
  const [pendencias, setPendencias] = useState(null)
  const [carregando, setCarregando] = useState(true)

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
      getSolicitacoesCanal(user.empresaId),
    ])
      .then(([relatorios, empresaData, count, docs, sols, canal]) => {
        if (!ativo) return
        setHistorico(relatorios)
        setEmpresa(empresaData)
        setPcdAtivos(count)
        setSolicitacoesInternas(sols)
        setSolicitacoesCanal(canal)
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

  const resultadoCota = useMemo(() => {
    if (!empresa?.total_funcionarios) return null
    return calcularCota({
      totalFuncionarios: empresa.total_funcionarios || 0,
      aprendizes: empresa.aprendizes || 0,
      aposentadosInvalidez: empresa.aposentados_invalidez || 0,
      pcdAtuais: pcdAtivos,
    })
  }, [empresa, pcdAtivos])

  const solicitacoesAbertas = useMemo(
    () =>
      solicitacoesInternas.filter(STATUS_INTERNO_ABERTO).length +
      solicitacoesCanal.filter(STATUS_CANAL_ABERTO).length,
    [solicitacoesInternas, solicitacoesCanal],
  )

  const tendenciaAvaliacoes = useMemo(
    () => tendenciaMensal(historico.map((h) => h.createdAt)),
    [historico],
  )

  const evolucao = useMemo(() => {
    const datasAvaliacoes = historico.map((h) => h.createdAt)
    const datasSolicitacoes = [
      ...solicitacoesInternas.map((s) => s.criado_em),
      ...solicitacoesCanal.map((s) => s.criada_em),
    ]
    const porMesAvaliacoes = contagemPorMes(datasAvaliacoes)
    const porMesSolicitacoes = contagemPorMes(datasSolicitacoes)
    const buckets = porMesAvaliacoes.map((b, i) => ({
      label: b.label,
      avaliacoes: b.quantidade,
      solicitacoes: porMesSolicitacoes[i].quantidade,
    }))
    const mesesAtivos = buckets.filter((b) => b.avaliacoes > 0 || b.solicitacoes > 0).length
    return { buckets, mostrar: mesesAtivos >= 2 }
  }, [historico, solicitacoesInternas, solicitacoesCanal])

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-indigo-900">Painel</h1>
          <p className="mt-1 text-sm text-graphite-500">
            {user?.companyName ? `${user.companyName} · ` : ''}
            {HOJE_FORMATADO}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button shape="crm" to="/app/avalia" size="lg">+ Nova avaliação</Button>
        </div>
      </div>

      {carregando ? (
        <p className="text-sm text-graphite-500">Carregando…</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CartaoKpi
              icone={ICONE_PESSOAS}
              corIcone="indigo"
              titulo="Colaboradores PCD ativos"
              valor={pcdAtivos}
              subtitulo={resultadoCota ? `sobre uma cota de ${resultadoCota.cotaDevida}` : 'informe o quadro de funcionários'}
            />
            <CartaoKpi
              icone={ICONE_ALVO}
              corIcone={resultadoCota ? corSemaforo(resultadoCota.percentualCumprimento).cor : 'neutro'}
              titulo="Cota atingida"
              valor={resultadoCota ? `${Math.round(resultadoCota.percentualCumprimento)}%` : '—'}
              subtitulo={
                resultadoCota
                  ? resultadoCota.vagasEmAberto > 0
                    ? `faltam ${resultadoCota.vagasEmAberto} vaga${resultadoCota.vagasEmAberto !== 1 ? 's' : ''}`
                    : 'cota cumprida'
                  : 'sem dados ainda'
              }
              corSubtitulo={resultadoCota ? corSemaforo(resultadoCota.percentualCumprimento).cor : 'neutro'}
            />
            <CartaoKpi
              icone={ICONE_DOCUMENTO}
              corIcone="volt"
              titulo="Avaliações este mês"
              valor={tendenciaAvaliacoes.esteMes}
              variacao={tendenciaAvaliacoes.variacao}
            />
            <CartaoKpi
              icone={ICONE_CAIXA_ENTRADA}
              corIcone={solicitacoesAbertas > 0 ? 'amber' : 'signal'}
              titulo="Solicitações abertas"
              valor={solicitacoesAbertas}
              subtitulo="aguardando retorno do RH"
            />
          </div>

          {evolucao.mostrar && (
            <div className="mt-6 rounded-lg border border-mist-300 bg-white p-6">
              <h2 className="text-base font-semibold text-graphite-900">Evolução mensal</h2>
              <p className="mt-1 text-xs text-graphite-400">Avaliações e solicitações registradas por mês, últimos 6 meses.</p>
              <GraficoEvolucao buckets={evolucao.buckets} />
            </div>
          )}

          <div className="mt-6">
            <PainelCota empresa={empresa} pcdAtivos={pcdAtivos} />
          </div>

          <div className="mt-6 rounded-lg border border-mist-300 bg-white p-6">
            <h2 className="text-base font-semibold text-graphite-900">Pendências</h2>
            <p className="mt-1 text-xs text-graphite-400">
              Documentação e adaptações que precisam de atenção — laudos incompletos, prazos vencidos.
            </p>
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
            <div className="rounded-lg border border-mist-300 bg-white p-6">
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
                    acao={<Button shape="crm" to="/app/avalia" size="sm">Começar agora</Button>}
                  />
                </div>
              ) : (
                <ul className="mt-4 divide-y divide-mist-200">
                  {recentes.map((item) => (
                    <li key={item.id} className="flex items-center gap-3 py-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700">
                        {iniciais(item.candidato)}
                      </span>
                      <div className="min-w-0 flex-1">
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

            <div className="rounded-lg border border-mist-300 bg-white p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-graphite-900">Treinamentos</h2>
                <Link to="/app/lidera" className="text-xs font-semibold text-indigo-700 hover:text-signal-600">
                  Ver todos →
                </Link>
              </div>
              <ul className="mt-4 space-y-3">
                {kits.map((kit) => (
                  <li key={kit.tema} className="flex items-center gap-3 rounded-md border border-mist-200 px-4 py-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-volt-50 text-volt-700">
                      <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 6h16M4 6v12a1 1 0 001 1h6M4 6l2-3h12l2 3M14 19l3 2v-6.5M17 14.5l3-2" />
                      </svg>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-graphite-900">{kit.tema}</p>
                      <p className="text-xs text-graphite-400">{kit.slides} slides</p>
                    </div>
                    {kit.novo && (
                      <span className="shrink-0 rounded bg-signal-600 px-2.5 py-1 text-[10px] font-bold text-white">
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

const COR_TEXTO_SUBTITULO = {
  signal: 'text-signal-800',
  amber: 'text-amber-800',
  red: 'text-red-700',
  indigo: 'text-indigo-700',
  volt: 'text-volt-700',
  neutro: 'text-graphite-500',
}

const COR_CARTAO = {
  signal: 'bg-signal-50',
  amber: 'bg-amber-50',
  red: 'bg-red-50',
  indigo: 'bg-indigo-50',
  volt: 'bg-volt-50',
  neutro: 'bg-mist-200',
}

const COR_ICONE_SOLIDO = {
  signal: 'bg-signal-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  indigo: 'bg-indigo-500',
  volt: 'bg-volt-500',
  neutro: 'bg-graphite-300',
}

function CartaoKpi({ icone, corIcone = 'indigo', titulo, valor, subtitulo, corSubtitulo = 'neutro', variacao }) {
  return (
    <div className={`rounded-xl p-5 ${COR_CARTAO[corIcone]}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold text-graphite-700">{titulo}</p>
        {icone && (
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-sm ${COR_ICONE_SOLIDO[corIcone]}`}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {icone}
            </svg>
          </span>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <p className="font-display text-3xl font-semibold text-graphite-900">{valor}</p>
        {variacao !== undefined && variacao !== null && (
          <span className={`text-xs font-semibold ${variacao >= 0 ? 'text-signal-700' : 'text-red-600'}`}>
            {variacao >= 0 ? '↑' : '↓'} {Math.abs(variacao)}%
          </span>
        )}
      </div>
      {subtitulo && <p className={`mt-1 text-xs font-medium ${COR_TEXTO_SUBTITULO[corSubtitulo]}`}>{subtitulo}</p>}
    </div>
  )
}

function GraficoEvolucao({ buckets }) {
  const max = Math.max(1, ...buckets.flatMap((b) => [b.avaliacoes, b.solicitacoes]))
  const alturaMax = 130
  const larguraGrupo = 60

  return (
    <div className="mt-4">
      <div className="flex items-center gap-4 text-xs text-graphite-500">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm bg-signal-500" /> Avaliações
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm bg-indigo-300" /> Solicitações
        </span>
      </div>
      <svg
        viewBox={`0 0 ${buckets.length * larguraGrupo} 160`}
        className="mt-3 w-full"
        style={{ height: 170 }}
        role="img"
        aria-label={`Evolução mensal: ${buckets.map((b) => `${b.label}, ${b.avaliacoes} avaliações e ${b.solicitacoes} solicitações`).join('; ')}`}
      >
        <line x1="0" y1={alturaMax + 10} x2={buckets.length * larguraGrupo} y2={alturaMax + 10} className="stroke-mist-300" strokeWidth="1" />
        {buckets.map((b, i) => {
          const x = i * larguraGrupo
          const alturaAval = (b.avaliacoes / max) * alturaMax
          const alturaSol = (b.solicitacoes / max) * alturaMax
          return (
            <g key={`${b.label}-${i}`}>
              <rect x={x + 10} y={alturaMax + 10 - alturaAval} width="16" height={alturaAval} rx="2" className="fill-signal-500" />
              <rect x={x + 30} y={alturaMax + 10 - alturaSol} width="16" height={alturaSol} rx="2" className="fill-indigo-300" />
              <text x={x + 30} y={alturaMax + 28} textAnchor="middle" className="fill-graphite-400 text-[9px]">
                {b.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
