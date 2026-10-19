import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TIPOS_DEFICIENCIA, identificarCategoria } from '../../lib/accessibilityResources.js'

// Paleta das duas séries (validada para daltonismo): signal-500 e volt-500.
const COR_AVALIACOES = '#12a594'
const COR_SOLICITACOES = '#6c4ce6'

const COR_STATUS = {
  signal: '#12a594',
  amber: '#e0911f',
  red: '#dc2626',
}

function Cartao({ titulo, subtitulo, acao, children, className = '' }) {
  return (
    <div className={`flex flex-col rounded-xl border border-mist-300 bg-white p-6 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <div className="min-w-[12rem] flex-1">
          <h2 className="text-base font-semibold text-graphite-900">{titulo}</h2>
          {subtitulo && <p className="mt-1 text-xs text-graphite-400">{subtitulo}</p>}
        </div>
        {acao}
      </div>
      {children}
    </div>
  )
}

/* ---------- Rosca da cota ---------- */

export function RoscaCota({ resultado, pcdAtuais }) {
  if (!resultado) {
    return (
      <Cartao titulo="Cota de PCD" subtitulo="Percentual da cota legal preenchido">
        <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
          <p className="text-sm text-graphite-500">Informe o quadro de funcionários para ver a cota.</p>
          <Link to="/app/conta" className="mt-3 text-sm font-semibold text-signal-700 hover:text-signal-800">
            Preencher dados da empresa →
          </Link>
        </div>
      </Cartao>
    )
  }

  const { cotaDevida, vagasEmAberto, percentualCumprimento } = resultado
  if (cotaDevida === 0) {
    return (
      <Cartao titulo="Cota de PCD" subtitulo="Percentual da cota legal preenchido">
        <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
          <p className="text-sm font-medium text-graphite-700">Sem cota obrigatória</p>
          <p className="mt-1 max-w-[30ch] text-xs text-graphite-500">A Lei de Cotas vale a partir de 100 empregados na base de cálculo.</p>
        </div>
      </Cartao>
    )
  }
  const pct = Math.max(0, Math.min(100, percentualCumprimento))
  const status =
    percentualCumprimento >= 100
      ? { cor: COR_STATUS.signal, trilha: '#cdf3e9', texto: 'Cota cumprida', classe: 'text-signal-800 bg-signal-50' }
      : percentualCumprimento >= 50
        ? { cor: COR_STATUS.amber, trilha: '#fbe9c3', texto: 'Em andamento', classe: 'text-amber-700 bg-amber-50' }
        : { cor: COR_STATUS.red, trilha: '#fee2e2', texto: 'Atenção', classe: 'text-red-700 bg-red-50' }

  const r = 54
  const circ = 2 * Math.PI * r
  const preenchido = (pct / 100) * circ

  return (
    <Cartao titulo="Cota de PCD" subtitulo="Percentual da cota legal preenchido">
      <div className="mt-5 flex flex-1 flex-col items-center justify-center">
        <div className="relative h-44 w-44">
          <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90" role="img" aria-label={`${pcdAtuais} de ${cotaDevida} vagas da cota preenchidas, ${Math.round(percentualCumprimento)}%`}>
            <circle cx="70" cy="70" r={r} fill="none" stroke={status.trilha} strokeWidth="14" />
            {pct > 0 && (
              <circle
                cx="70"
                cy="70"
                r={r}
                fill="none"
                stroke={status.cor}
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={`${preenchido} ${circ}`}
                className="transition-[stroke-dasharray] duration-1000 ease-out"
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-4xl font-semibold leading-none text-graphite-900">{Math.round(percentualCumprimento)}%</p>
            <p className="mt-1.5 text-xs font-medium text-graphite-500">
              {pcdAtuais} de {cotaDevida} vagas
            </p>
          </div>
        </div>
        <span className={`mt-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${status.classe}`}>
          <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ backgroundColor: status.cor }} />
          {status.texto}
        </span>
        <p className="mt-2 text-xs text-graphite-500">
          {vagasEmAberto > 0 ? `Faltam ${vagasEmAberto} vaga${vagasEmAberto !== 1 ? 's' : ''} para cumprir a cota` : 'Nenhuma vaga em aberto'}
        </p>
      </div>
    </Cartao>
  )
}

/* ---------- Perfil por tipo de deficiência ---------- */

const ROTULO_CURTO = { neurodivergente: 'Neurodivergente' }

export function PerfilDeficiencia({ colaboradores }) {
  const ativos = colaboradores.filter((c) => !c.data_desligamento)
  const contagem = Object.fromEntries(TIPOS_DEFICIENCIA.map((t) => [t.id, 0]))
  let naoClassificado = 0
  for (const c of ativos) {
    const id = identificarCategoria(c.tipo_deficiencia)
    if (id) contagem[id] += 1
    else naoClassificado += 1
  }
  const linhas = TIPOS_DEFICIENCIA.map((t) => ({ id: t.id, label: ROTULO_CURTO[t.id] || t.label, valor: contagem[t.id] }))
  if (naoClassificado > 0) linhas.push({ id: 'outro', label: 'Não classificado', valor: naoClassificado, neutro: true })
  const total = ativos.length
  const max = Math.max(1, ...linhas.map((l) => l.valor))

  return (
    <Cartao
      titulo="Perfil por tipo de deficiência"
      subtitulo={`${total} colaborador${total !== 1 ? 'es' : ''} ativo${total !== 1 ? 's' : ''}`}
      acao={
        <Link to="/app/colaboradores" className="shrink-0 text-xs font-semibold text-indigo-700 hover:text-signal-600">
          Ver todos →
        </Link>
      }
    >
      {total === 0 ? (
        <p className="mt-6 text-sm text-graphite-500">Cadastre colaboradores para ver a distribuição.</p>
      ) : (
        <ul className="mt-5 space-y-3.5">
          {linhas.map((l) => {
            const pct = Math.round((l.valor / total) * 100)
            return (
              <li key={l.id} className="grid grid-cols-[8.5rem_1fr_auto] items-center gap-3 text-sm" title={`${l.label}: ${l.valor} (${pct}%)`}>
                <span className="truncate text-graphite-700">{l.label}</span>
                <span className="h-2.5 rounded-full bg-mist-200">
                  {l.valor > 0 && (
                    <span
                      className="block h-full rounded-full transition-[width] duration-700 ease-out"
                      style={{ width: `${(l.valor / max) * 100}%`, backgroundColor: l.neutro ? '#9096a4' : COR_AVALIACOES }}
                    />
                  )}
                </span>
                <span className="w-14 text-right tabular-nums">
                  <span className="font-semibold text-graphite-900">{l.valor}</span>
                  <span className="ml-1 text-xs text-graphite-400">{pct}%</span>
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </Cartao>
  )
}

/* ---------- Andamento das solicitações ---------- */

export function StatusSolicitacoes({ internas, canal }) {
  const recebidas = canal.filter((s) => !s.solicitacao_acessibilidade_id && !['concluida', 'recusada', 'descartada'].includes(s.status)).length
  const andamento = internas.filter((s) => !['concluido', 'recusado'].includes(s.status)).length
  const concluidas =
    internas.filter((s) => s.status === 'concluido').length +
    canal.filter((s) => !s.solicitacao_acessibilidade_id && s.status === 'concluida').length
  const recusadas =
    internas.filter((s) => s.status === 'recusado').length +
    canal.filter((s) => !s.solicitacao_acessibilidade_id && s.status === 'recusada').length

  const segmentos = [
    { id: 'recebidas', label: 'Aguardando análise', valor: recebidas, cor: '#8195c4' },
    { id: 'andamento', label: 'Em andamento', valor: andamento, cor: COR_STATUS.amber },
    { id: 'concluidas', label: 'Concluídas', valor: concluidas, cor: COR_STATUS.signal },
    { id: 'recusadas', label: 'Recusadas', valor: recusadas, cor: '#9096a4' },
  ]
  const total = segmentos.reduce((s, x) => s + x.valor, 0)
  const finalizadas = concluidas + recusadas
  const taxa = finalizadas > 0 ? Math.round((concluidas / finalizadas) * 100) : null

  return (
    <Cartao
      titulo="Solicitações de adaptação"
      subtitulo={`${total} no total`}
      acao={
        <Link to="/app/solicitacoes" className="shrink-0 text-xs font-semibold text-indigo-700 hover:text-signal-600">
          Abrir →
        </Link>
      }
    >
      {total === 0 ? (
        <p className="mt-6 text-sm text-graphite-500">Nenhuma solicitação registrada ainda.</p>
      ) : (
        <>
          <div className="mt-5 flex items-baseline gap-2">
            <p className="text-4xl font-semibold leading-none text-graphite-900">{taxa !== null ? `${taxa}%` : '—'}</p>
            <p className="text-xs text-graphite-500">de atendimento</p>
          </div>
          <div className="mt-5 flex h-3 gap-[2px] overflow-hidden rounded-full" role="img" aria-label={segmentos.map((s) => `${s.label}: ${s.valor}`).join(', ')}>
            {segmentos
              .filter((s) => s.valor > 0)
              .map((s) => (
                <span
                  key={s.id}
                  title={`${s.label}: ${s.valor}`}
                  className="h-full transition-[flex-grow] duration-700"
                  style={{ flexGrow: s.valor, backgroundColor: s.cor }}
                />
              ))}
          </div>
          <ul className="mt-6 divide-y divide-mist-200">
            {segmentos.map((s) => (
              <li key={s.id} className="flex items-center gap-2.5 py-2.5 text-sm text-graphite-700">
                <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: s.cor }} />
                <span className="truncate">{s.label}</span>
                <span className="ml-auto font-semibold tabular-nums text-graphite-900">{s.valor}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Cartao>
  )
}

/* ---------- Evolução mensal ---------- */

// Topo do eixo sempre par e "redondo", para a marca do meio ser um número inteiro.
function topoLimpo(max) {
  if (max <= 4) return 4
  if (max <= 10) return Math.ceil(max / 2) * 2
  const passo = Math.pow(10, Math.floor(Math.log10(max)))
  for (const m of [1, 2, 4, 6, 8, 10]) {
    if (m * passo >= max) return m * passo
  }
  return 10 * passo
}

export function EvolucaoMensal({ buckets }) {
  const [foco, setFoco] = useState(null)
  const maxReal = Math.max(0, ...buckets.flatMap((b) => [b.avaliacoes, b.solicitacoes]))
  const topo = topoLimpo(Math.max(1, maxReal))
  const ticks = [topo, topo / 2, 0]
  const semDados = maxReal === 0

  return (
    <Cartao
      titulo="Evolução mensal"
      subtitulo="Avaliações e solicitações registradas por mês — últimos 6 meses"
      acao={
        <div className="flex shrink-0 items-center gap-4 text-xs text-graphite-500">
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COR_AVALIACOES }} /> Avaliações
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COR_SOLICITACOES }} /> Solicitações
          </span>
        </div>
      }
    >
      <div className="relative mt-6 grid grid-cols-[1.75rem_1fr] gap-2">
        <div className="relative h-48 text-right text-[11px] tabular-nums text-graphite-400">
          {ticks.map((t, i) => (
            <span key={t} className="absolute right-0 -translate-y-1/2" style={{ top: `${(i / (ticks.length - 1)) * 100}%` }}>
              {t}
            </span>
          ))}
        </div>
        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-48" aria-hidden="true">
            {ticks.map((t, i) => (
              <span key={t} className="absolute inset-x-0 h-px bg-mist-300" style={{ top: `${(i / (ticks.length - 1)) * 100}%` }} />
            ))}
          </div>
          <div className="relative grid h-48 grid-cols-6 items-end">
            {buckets.map((b, i) => (
              <div
                key={`${b.label}-${i}`}
                className="relative flex h-full items-end justify-center gap-[2px] rounded-t-md hover:bg-mist-100"
                onMouseEnter={() => setFoco(i)}
                onMouseLeave={() => setFoco(null)}
              >
                {[
                  { v: b.avaliacoes, cor: COR_AVALIACOES },
                  { v: b.solicitacoes, cor: COR_SOLICITACOES },
                ].map((s, j) => (
                  <span
                    key={j}
                    className="w-3 rounded-t-[4px] transition-[height] duration-700 ease-out sm:w-5"
                    style={{ height: `${(s.v / topo) * 100}%`, backgroundColor: s.cor, minHeight: s.v > 0 ? 3 : 0 }}
                  />
                ))}
                {foco === i && (
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max -translate-x-1/2 rounded-md bg-indigo-900 px-3 py-2 text-xs text-white shadow-pop">
                    <p className="font-semibold capitalize">{b.label}</p>
                    <p className="mt-1 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: COR_AVALIACOES }} /> {b.avaliacoes} avaliaç{b.avaliacoes === 1 ? 'ão' : 'ões'}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: COR_SOLICITACOES }} /> {b.solicitacoes} solicitaç{b.solicitacoes === 1 ? 'ão' : 'ões'}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-6 text-center text-[11px] capitalize text-graphite-400">
            {buckets.map((b, i) => (
              <span key={`${b.label}-${i}`}>{b.label}</span>
            ))}
          </div>
          {semDados && (
            <p className="absolute inset-x-0 top-16 text-center text-sm text-graphite-400">
              Os registros dos próximos meses aparecem aqui.
            </p>
          )}
        </div>
      </div>
      <table className="sr-only">
        <caption>Evolução mensal</caption>
        <thead>
          <tr><th>Mês</th><th>Avaliações</th><th>Solicitações</th></tr>
        </thead>
        <tbody>
          {buckets.map((b, i) => (
            <tr key={i}><td>{b.label}</td><td>{b.avaliacoes}</td><td>{b.solicitacoes}</td></tr>
          ))}
        </tbody>
      </table>
    </Cartao>
  )
}
