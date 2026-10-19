import { useState } from 'react'
import { Link } from 'react-router-dom'

// Paleta categórica validada (daltonismo + contraste com legenda visível), nesta ordem.
const CATEGORICA = ['#12a594', '#6c4ce6', '#e0911f', '#4f65a3']
const NEUTRO = '#b4bac6'
const SIGNAL = '#12a594'
const INDIGO_400 = '#4f65a3'

const moeda = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

const SOMBRA_CARTAO = 'shadow-[0_1px_2px_rgba(15,21,38,0.05),0_8px_24px_-6px_rgba(15,21,38,0.10)]'

export function Cartao({ titulo, subtitulo, acao, children, className = '' }) {
  return (
    <section className={`flex min-w-0 flex-col rounded-lg border border-mist-300/70 bg-white p-6 ${SOMBRA_CARTAO} ${className}`}>
      {(titulo || acao) && (
        <header className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
          <div className="min-w-[12rem] flex-1">
            <h2 className="font-display text-[15px] font-semibold text-indigo-900">{titulo}</h2>
            {subtitulo && <p className="mt-0.5 text-xs text-graphite-500">{subtitulo}</p>}
          </div>
          {acao}
        </header>
      )}
      {children}
    </section>
  )
}

function LinkAcao({ to, children }) {
  return (
    <Link
      to={to}
      className="shrink-0 rounded-full border border-mist-300 px-3 py-1 text-xs font-semibold text-indigo-700 transition-colors hover:border-signal-300 hover:text-signal-700"
    >
      {children}
    </Link>
  )
}

/* ---------- 1. Faixa de destaque: situação da cota ---------- */

const BRILHO = (
  <>
    <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-signal-500/25 blur-3xl" aria-hidden="true" />
    <div className="pointer-events-none absolute -bottom-40 left-1/4 h-72 w-72 rounded-full bg-volt-500/20 blur-3xl" aria-hidden="true" />
    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" aria-hidden="true" />
  </>
)

export function HeroCota({ dados, nomeEmpresa }) {
  const { cota, ativos } = dados

  if (!cota) {
    return (
      <section className="relative overflow-hidden rounded-lg bg-gradient-to-br from-indigo-900 via-indigo-800 to-[#26346a] p-8 text-white">
        {BRILHO}
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-signal-300">Cota legal de PCD</p>
          <p className="mt-3 max-w-md font-display text-2xl font-medium">Informe o quadro de funcionários para calcular a cota da empresa.</p>
          <Link to="/app/conta" className="mt-5 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-indigo-900 hover:bg-signal-50">
            Preencher dados da empresa
          </Link>
        </div>
      </section>
    )
  }

  const pct = Math.round(cota.percentualCumprimento)
  const status =
    cota.cotaDevida === 0
      ? { texto: 'Sem cota obrigatória', ponto: 'bg-white/60' }
      : pct >= 100
        ? { texto: 'Cota cumprida', ponto: 'bg-signal-300' }
        : pct >= 50
          ? { texto: 'Cota parcialmente cumprida', ponto: 'bg-amber-300' }
          : { texto: 'Abaixo da metade da cota', ponto: 'bg-red-400' }

  const numeros = [
    { rotulo: 'Vagas em aberto', valor: cota.vagasEmAberto, nota: cota.vagasEmAberto > 0 ? 'para a cota' : 'cota preenchida' },
    { rotulo: 'Base de cálculo', valor: cota.base, nota: `alíquota de ${Math.round(cota.percentual * 100)}%` },
    {
      rotulo: 'Multa estimada',
      valor: moeda(cota.vagasEmAberto > 0 ? cota.exposicaoEstimada : 0),
      nota: cota.vagasEmAberto > 0 ? 'valor mínimo' : 'sem exposição',
      destaque: true,
    },
  ]

  return (
    <section className="relative overflow-hidden rounded-lg bg-gradient-to-br from-indigo-900 via-indigo-800 to-[#26346a] p-6 text-white shadow-[0_24px_60px_-28px_rgba(15,21,38,0.7)] sm:p-8">
      {BRILHO}
      <div className="relative grid gap-8 lg:grid-cols-[1fr_1.35fr] lg:items-center lg:gap-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-signal-300">Cota legal de PCD</p>
          <p className="mt-3 font-display text-6xl font-semibold leading-none tracking-tight tabular-nums">
            {ativos}
            <span className="text-white/35"> / {cota.cotaDevida}</span>
          </p>
          <p className="mt-2 text-sm text-indigo-200">colaboradores com deficiência na cota{nomeEmpresa ? ` · ${nomeEmpresa}` : ''}</p>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-signal-500 to-signal-300 transition-[width] duration-1000" style={{ width: `${Math.min(100, pct)}%` }} />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-2 font-medium text-white/90">
              <span className={`h-2 w-2 rounded-full ${status.ponto}`} aria-hidden="true" />
              {status.texto}
            </span>
            <span className="font-semibold tabular-nums">{pct}%</span>
          </div>
        </div>

        <dl className="grid gap-6 border-t border-white/10 pt-6 sm:grid-cols-3 sm:gap-0 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
          {numeros.map((n, i) => (
            <div key={n.rotulo} className={`min-w-0 ${i > 0 ? 'sm:border-l sm:border-white/10 sm:pl-6' : ''} ${i < numeros.length - 1 ? 'sm:pr-6' : ''} lg:px-6`}>
              <dt className="text-xs text-indigo-200">{n.rotulo}</dt>
              <dd className={`mt-2 whitespace-nowrap font-display font-semibold leading-none tabular-nums ${n.destaque ? 'text-[26px] text-amber-300' : 'text-4xl'}`}>
                {n.valor}
              </dd>
              <dd className="mt-2 text-xs text-white/55">{n.nota}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

/* ---------- 2. Indicadores-chave ---------- */

const ICONES = {
  documento: <path d="M6 4h9l3 3v13a1 1 0 01-1 1H6a1 1 0 01-1-1V5a1 1 0 011-1zM8 12h8M8 16h5M8 8h4" />,
  relogio: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  caixa: <path d="M4 12h4l1.5 3h5L16 12h4M4 12l1.6-6.4A1 1 0 016.56 5h10.88a1 1 0 01.96.6L20 12M4 12v6a1 1 0 001 1h14a1 1 0 001-1v-6" />,
  plano: <path d="M9 5h10M9 12h10M9 19h10M4.5 5.5l1 1 2-2M4.5 12.5l1 1 2-2M4.5 19.5l1 1 2-2" />,
}

const TOM = {
  signal: { barra: 'bg-signal-500', icone: 'bg-signal-50 text-signal-700' },
  amber: { barra: 'bg-amber-500', icone: 'bg-amber-50 text-amber-700' },
  red: { barra: 'bg-red-500', icone: 'bg-red-50 text-red-600' },
  indigo: { barra: 'bg-indigo-400', icone: 'bg-indigo-50 text-indigo-600' },
}

export function Indicador({ icone, titulo, valor, sufixo, detalhe, progresso, tom = 'signal', to }) {
  const conteudo = (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-medium leading-snug text-graphite-500">{titulo}</p>
        <span className={`hidden h-9 w-9 shrink-0 sm:flex items-center justify-center rounded-md ${TOM[tom].icone}`}>
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {ICONES[icone]}
          </svg>
        </span>
      </div>
      <p className="mt-3 font-display text-[28px] font-semibold sm:text-[32px] leading-none tracking-tight text-indigo-900 tabular-nums">
        {valor}
        {sufixo && <span className="ml-1 text-base font-medium text-graphite-400">{sufixo}</span>}
      </p>
      {progresso !== undefined && progresso !== null && (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-mist-200">
          <div className={`h-full rounded-full ${TOM[tom].barra} transition-[width] duration-700`} style={{ width: `${Math.min(100, progresso)}%` }} />
        </div>
      )}
      <p className="mt-3 text-xs text-graphite-500">{detalhe}</p>
    </>
  )
  const classe = `group block min-w-0 rounded-lg border border-mist-300/70 bg-white p-4 sm:p-5 transition-all duration-200 ${SOMBRA_CARTAO}`
  return to ? (
    <Link to={to} className={`${classe} hover:-translate-y-0.5 hover:border-signal-200`}>
      {conteudo}
    </Link>
  ) : (
    <div className={classe}>{conteudo}</div>
  )
}

/* ---------- 3. Evolução do quadro PCD ---------- */

export function EvolucaoQuadro({ serie, cota, semDataAdmissao }) {
  const [foco, setFoco] = useState(null)
  const maxBruto = Math.max(cota || 0, ...serie.map((s) => s.ativos), 1)
  const topo = maxBruto <= 4 ? 4 : Math.ceil((maxBruto * 1.15) / 2) * 2
  const ticks = [topo, topo / 2, 0]
  const W = 600
  const H = 200
  const x = (i) => (i / (serie.length - 1)) * W
  const y = (v) => H - (v / topo) * H
  const linha = serie.map((s, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(s.ativos).toFixed(1)}`).join(' ')
  const area = `${linha} L${W},${H} L0,${H} Z`
  const admissoes = serie.reduce((a, s) => a + s.admissoes, 0)
  const desligamentos = serie.reduce((a, s) => a + s.desligamentos, 0)

  return (
    <Cartao
      titulo="Evolução do quadro PCD"
      subtitulo="Colaboradores na cota ao fim de cada mês, comparados à cota exigida"
      acao={
        <div className="flex shrink-0 items-center gap-4 text-xs text-graphite-500">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full bg-signal-500" aria-hidden="true" /> Na cota
          </span>
          {cota > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="w-4 border-t-2 border-dashed border-graphite-300" aria-hidden="true" /> Cota exigida
            </span>
          )}
        </div>
      }
    >
      <div className="mt-6 grid grid-cols-[1.75rem_1fr] gap-2">
        <div className="relative h-52 text-right text-[11px] tabular-nums text-graphite-400">
          {ticks.map((t, i) => (
            <span key={t} className="absolute right-0 -translate-y-1/2" style={{ top: `${(i / 2) * 100}%` }}>
              {t}
            </span>
          ))}
        </div>
        <div>
          <div className="relative h-52">
            {ticks.map((t, i) => (
              <span key={t} className="absolute inset-x-0 h-px bg-mist-200" style={{ top: `${(i / 2) * 100}%` }} aria-hidden="true" />
            ))}
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
              <defs>
                <linearGradient id="evoArea" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={SIGNAL} stopOpacity="0.16" />
                  <stop offset="100%" stopColor={SIGNAL} stopOpacity="0" />
                </linearGradient>
              </defs>
              {cota > 0 && <line x1="0" x2={W} y1={y(cota)} y2={y(cota)} stroke="#9096a4" strokeWidth="1.5" strokeDasharray="5 5" vectorEffect="non-scaling-stroke" />}
              <path d={area} fill="url(#evoArea)" />
              <path d={linha} fill="none" stroke={SIGNAL} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              {foco !== null && <line x1={x(foco)} x2={x(foco)} y1="0" y2={H} stroke="#dbe0e9" strokeWidth="1" vectorEffect="non-scaling-stroke" />}
            </svg>
            {serie.map((s, i) =>
              foco === i || (foco === null && i === serie.length - 1) ? (
                <span
                  key={i}
                  className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal-500 ring-2 ring-white"
                  style={{ left: `${(x(i) / W) * 100}%`, top: `${(y(s.ativos) / H) * 100}%` }}
                />
              ) : null,
            )}
            <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${serie.length}, 1fr)` }}>
              {serie.map((s, i) => (
                <div key={i} className="relative" onMouseEnter={() => setFoco(i)} onMouseLeave={() => setFoco(null)}>
                  {foco === i && (
                    <div className={`pointer-events-none absolute top-0 z-10 w-max rounded-lg bg-indigo-900 px-3 py-2 text-xs text-white shadow-pop ${i > serie.length / 2 ? 'right-1/2' : 'left-1/2'}`}>
                      <p className="font-semibold capitalize">
                        {s.label} {s.ano}
                      </p>
                      <p className="mt-1 tabular-nums">
                        {s.ativos} na cota{cota ? ` de ${cota}` : ''}
                      </p>
                      <p className="tabular-nums text-indigo-200">
                        +{s.admissoes} admiss{s.admissoes === 1 ? 'ão' : 'ões'} · −{s.desligamentos} deslig.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2 grid text-center text-[11px] capitalize text-graphite-400" style={{ gridTemplateColumns: `repeat(${serie.length}, 1fr)` }}>
            {serie.map((s, i) => (
              <span key={i} className={i % 2 ? 'invisible sm:visible' : ''}>
                {s.label}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-mist-200 pt-4 text-xs text-graphite-500">
        <span>
          <strong className="font-semibold tabular-nums text-indigo-900">{admissoes}</strong> admissões em 12 meses
        </span>
        <span>
          <strong className="font-semibold tabular-nums text-indigo-900">{desligamentos}</strong> desligamentos
        </span>
        {semDataAdmissao > 0 && <span className="text-graphite-400 sm:ml-auto">{semDataAdmissao} sem data de admissão: considerada a data de cadastro</span>}
      </div>
      <table className="sr-only">
        <caption>Evolução do quadro PCD</caption>
        <thead>
          <tr>
            <th>Mês</th>
            <th>Na cota</th>
            <th>Admissões</th>
            <th>Desligamentos</th>
          </tr>
        </thead>
        <tbody>
          {serie.map((s, i) => (
            <tr key={i}>
              <td>{s.label}</td>
              <td>{s.ativos}</td>
              <td>{s.admissoes}</td>
              <td>{s.desligamentos}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Cartao>
  )
}

/* ---------- 4. Perfil por tipo de deficiência ---------- */

export function PerfilRosca({ perfil, total }) {
  const [foco, setFoco] = useState(null)
  const r = 52
  const circ = 2 * Math.PI * r
  const GAP = perfil.length > 1 ? 2.5 : 0
  let acumulado = 0
  let corIndice = 0
  const fatias = perfil.map((p) => {
    const tamanho = (p.valor / Math.max(total, 1)) * circ
    const cor = p.neutro ? NEUTRO : CATEGORICA[corIndice++]
    const f = { ...p, cor, inicio: acumulado, tamanho }
    acumulado += tamanho
    return f
  })
  const destaque = foco !== null ? fatias[foco] : null

  return (
    <Cartao titulo="Perfil por tipo de deficiência" subtitulo={`${total} colaborador${total !== 1 ? 'es' : ''} na cota`} acao={<LinkAcao to="/app/colaboradores">Ver</LinkAcao>}>
      {total === 0 ? (
        <p className="mt-8 text-sm text-graphite-500">Cadastre colaboradores para ver a distribuição.</p>
      ) : (
        <div className="mt-5 flex flex-1 flex-col items-center gap-6 sm:flex-row lg:flex-col 2xl:flex-row">
          <div className="relative h-48 w-48 shrink-0">
            <svg viewBox="0 0 150 150" className="h-full w-full -rotate-90 drop-shadow-[0_8px_14px_rgba(15,21,38,0.16)]">
              <circle cx="75" cy="75" r={r} fill="none" stroke="#f3f5f8" strokeWidth="32" />
              {fatias.map((f, i) => (
                <circle
                  key={f.id}
                  cx="75"
                  cy="75"
                  r={r}
                  fill="none"
                  stroke={f.cor}
                  strokeWidth={foco === i ? 38 : 32}
                  strokeDasharray={`${Math.max(f.tamanho - GAP, 0.5)} ${circ}`}
                  strokeDashoffset={-f.inicio}
                  className="cursor-pointer transition-[stroke-width,opacity] duration-200"
                  style={{ opacity: foco === null || foco === i ? 1 : 0.35 }}
                  onMouseEnter={() => setFoco(i)}
                  onMouseLeave={() => setFoco(null)}
                />
              ))}
            </svg>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className="font-display text-[28px] font-semibold leading-none text-indigo-900 tabular-nums">
                {destaque ? `${Math.round((destaque.valor / total) * 100)}%` : total}
              </p>
              <p className="mt-1 max-w-[5rem] truncate text-[11px] text-graphite-500">{destaque ? destaque.label : 'pessoas'}</p>
            </div>
          </div>
          <ul className="w-full flex-1 space-y-1">
            {fatias.map((f, i) => (
              <li
                key={f.id}
                onMouseEnter={() => setFoco(i)}
                onMouseLeave={() => setFoco(null)}
                className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors ${foco === i ? 'bg-mist-100' : ''}`}
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: f.cor }} aria-hidden="true" />
                <span className="truncate text-graphite-700">{f.label}</span>
                <span className="ml-auto font-semibold tabular-nums text-indigo-900">{f.valor}</span>
                <span className="w-9 text-right text-xs tabular-nums text-graphite-400">{Math.round((f.valor / total) * 100)}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Cartao>
  )
}

/* ---------- 5. Operação de acessibilidade ---------- */

export function OperacaoSolicitacoes({ solicitacoes }) {
  const { etapas, recusadas, abertas, tempoMedioDias, investimento, prazosVencidos } = solicitacoes
  const total = etapas.reduce((s, e) => s + e.valor, 0) + recusadas
  const max = Math.max(1, ...etapas.map((e) => e.valor))
  const tons = ['#b3c0dd', '#8195c4', INDIGO_400, SIGNAL]

  return (
    <Cartao titulo="Solicitações de adaptação" subtitulo={`${total} registrada${total !== 1 ? 's' : ''} · ${abertas} em aberto`} acao={<LinkAcao to="/app/solicitacoes">Abrir central</LinkAcao>}>
      <div className="mt-6 flex flex-1 flex-col gap-6">
        <ol className="space-y-3">
          {etapas.map((e, i) => (
            <li key={e.id} className="grid grid-cols-[minmax(0,8.5rem)_1fr_2rem] items-center gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2 text-graphite-700">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mist-200 text-[10px] font-semibold text-graphite-500">{i + 1}</span>
                <span className="truncate">{e.label}</span>
              </span>
              <span className="h-7 overflow-hidden rounded-md bg-mist-100">
                <span className="block h-full rounded-md transition-[width] duration-700" style={{ width: `${(e.valor / max) * 100}%`, backgroundColor: tons[i], minWidth: e.valor ? 6 : 0 }} />
              </span>
              <span className="text-right font-semibold tabular-nums text-indigo-900">{e.valor}</span>
            </li>
          ))}
          {recusadas > 0 && (
            <li className="pl-7 text-xs text-graphite-400">
              {recusadas} recusada{recusadas !== 1 ? 's' : ''} ou descartada{recusadas !== 1 ? 's' : ''}
            </li>
          )}
        </ol>
        <dl className="mt-auto grid gap-3 sm:grid-cols-3">
          <div className="rounded-md bg-mist-100 px-4 py-3">
            <dt className="text-xs text-graphite-500">Tempo médio de atendimento</dt>
            <dd className="mt-1 font-display text-xl font-semibold tabular-nums text-indigo-900">{tempoMedioDias !== null ? `${tempoMedioDias} dias` : '—'}</dd>
          </div>
          <div className="rounded-md bg-mist-100 px-4 py-3">
            <dt className="text-xs text-graphite-500">Investido em recursos</dt>
            <dd className="mt-1 font-display text-xl font-semibold tabular-nums text-indigo-900">{moeda(investimento)}</dd>
          </div>
          <div className={`rounded-md px-4 py-3 ${prazosVencidos ? 'bg-red-50' : 'bg-mist-100'}`}>
            <dt className="text-xs text-graphite-500">Prazos vencidos</dt>
            <dd className={`mt-1 font-display text-xl font-semibold tabular-nums ${prazosVencidos ? 'text-red-600' : 'text-indigo-900'}`}>{prazosVencidos}</dd>
          </div>
        </dl>
      </div>
    </Cartao>
  )
}

/* ---------- 6. Alertas ---------- */

const NIVEL = {
  critico: { ponto: 'bg-red-500', rotulo: 'Urgente', classe: 'text-red-600' },
  atencao: { ponto: 'bg-amber-500', rotulo: 'Atenção', classe: 'text-amber-700' },
  info: { ponto: 'bg-indigo-300', rotulo: 'Acompanhar', classe: 'text-indigo-600' },
}

export function Alertas({ alertas }) {
  return (
    <Cartao titulo="O que precisa de atenção" subtitulo="Prioridades calculadas a partir dos seus registros">
      {alertas.length === 0 ? (
        <div className="mt-6 flex flex-1 flex-col items-center justify-center rounded-md bg-signal-50/60 px-4 py-8 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-signal-100 text-signal-700">
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor" aria-hidden="true">
              <path d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5a1 1 0 111.4-1.4l3.9 3.9 6.7-6.7a1 1 0 011.4 0z" />
            </svg>
          </span>
          <p className="mt-3 text-sm font-medium text-signal-800">Tudo em dia</p>
          <p className="mt-1 text-xs text-graphite-500">Nenhuma pendência encontrada.</p>
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-mist-200">
          {alertas.slice(0, 6).map((a, i) => (
            <li key={i}>
              <Link to={a.link} className="group flex items-start gap-3 py-3">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${NIVEL[a.nivel].ponto}`} aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-indigo-900 group-hover:text-signal-700">{a.titulo}</span>
                  {a.detalhe && <span className="mt-0.5 block truncate text-xs text-graphite-500">{a.detalhe}</span>}
                </span>
                <span className={`shrink-0 text-[11px] font-semibold ${NIVEL[a.nivel].classe}`}>{NIVEL[a.nivel].rotulo}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Cartao>
  )
}

/* ---------- 7. Retenção e unidades ---------- */

export function Retencao({ retencao, ativos }) {
  const { pct, desligados12m, admitidos12m } = retencao
  return (
    <Cartao titulo="Retenção" subtitulo="Permanência de colaboradores PCD nos últimos 12 meses">
      <div className="mt-5 flex items-end gap-3">
        <p className="font-display text-5xl font-semibold leading-none tracking-tight text-indigo-900 tabular-nums">{pct !== null ? `${pct}%` : '—'}</p>
        <p className="pb-1 text-xs text-graphite-500">de permanência</p>
      </div>
      <div className="mt-auto grid grid-cols-3 divide-x divide-mist-200 rounded-md border border-mist-200 pt-0">
        {[
          ['Ativos', ativos],
          ['Admitidos', admitidos12m],
          ['Desligados', desligados12m],
        ].map(([l, v]) => (
          <div key={l} className="px-3 py-3 text-center">
            <p className="font-display text-lg font-semibold tabular-nums text-indigo-900">{v}</p>
            <p className="text-[11px] text-graphite-500">{l}</p>
          </div>
        ))}
      </div>
    </Cartao>
  )
}

export function PorUnidade({ porUnidade }) {
  if (porUnidade.length === 0) return null
  const max = Math.max(1, ...porUnidade.map((u) => u.valor))
  return (
    <Cartao titulo="Distribuição por unidade" subtitulo="Colaboradores PCD na cota em cada unidade">
      <ul className="mt-5 space-y-3">
        {porUnidade.slice(0, 6).map((u) => (
          <li key={u.id} className="grid grid-cols-[minmax(0,8rem)_1fr_2rem] items-center gap-3 text-sm">
            <span className="truncate text-graphite-700">{u.label}</span>
            <span className="h-2 overflow-hidden rounded-full bg-mist-200">
              <span className="block h-full rounded-full transition-[width] duration-700" style={{ width: `${(u.valor / max) * 100}%`, backgroundColor: u.neutro ? NEUTRO : INDIGO_400 }} />
            </span>
            <span className="text-right font-semibold tabular-nums text-indigo-900">{u.valor}</span>
          </li>
        ))}
      </ul>
    </Cartao>
  )
}
