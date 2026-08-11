import { Link } from 'react-router-dom'
import { useAuth } from '../../lib/auth.jsx'
import { getReports } from '../../lib/reports.js'
import { kits } from '../../lib/kits.js'
import { Button } from '../../components/ui/Button.jsx'

const CARD_ICONS = {
  realizadas: (
    <path d="M6 4h9l3 3v13a1 1 0 01-1 1H6a1 1 0 01-1-1V5a1 1 0 011-1zM8 12h8M8 16h5M8 8h4" />
  ),
  pendentes: <path d="M12 7v5l3 3M12 22a10 10 0 100-20 10 10 0 000 20z" />,
  treinamentos: (
    <path d="M4 6h16M4 6v12a1 1 0 001 1h6M4 6l2-3h12l2 3M14 19l3 2v-6.5M17 14.5l3-2" />
  ),
}

export function Dashboard() {
  const { user } = useAuth()
  const historico = getReports()
  const recentes = historico.slice(0, 5)
  const novosKits = kits.filter((k) => k.novo)

  const stats = [
    {
      key: 'realizadas',
      label: 'Avaliações realizadas',
      valor: historico.length,
      nota: historico.length === 0 ? 'Nenhuma ainda' : 'Total nesta conta',
      accent: 'signal',
    },
    {
      key: 'pendentes',
      label: 'Avaliações pendentes',
      valor: 0,
      nota: 'Tudo em dia',
      accent: 'amber',
    },
    {
      key: 'treinamentos',
      label: 'Treinamentos disponíveis',
      valor: kits.length,
      nota: novosKits.length > 0 ? `${novosKits.length} novo` : 'Biblioteca completa',
      accent: 'volt',
      destaque: novosKits.length > 0,
    },
  ]

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-signal-600">
            Painel geral
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-indigo-800">
            Olá, {user?.companyName || 'bem-vindo(a)'}
          </h1>
          <p className="mt-2 max-w-2xl text-graphite-500">
            Acompanhe suas avaliações e a biblioteca de treinamentos em um só lugar.
          </p>
        </div>
        <Button to="/app/avalia" size="lg">+ Novo Relatório Técnico de Inclusão</Button>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.key}
            className="relative overflow-hidden rounded-2xl border border-mist-300 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-pop"
          >
            {s.destaque && (
              <span className="absolute right-4 top-4 rounded-full bg-signal-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                {s.nota}
              </span>
            )}
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                s.accent === 'signal'
                  ? 'bg-signal-50 text-signal-700'
                  : s.accent === 'volt'
                    ? 'bg-volt-50 text-volt-700'
                    : 'bg-amber-50 text-amber-700'
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                {CARD_ICONS[s.key]}
              </svg>
            </span>
            <p className="mt-4 font-display text-3xl font-semibold text-indigo-900">{s.valor}</p>
            <p className="mt-1 text-sm font-medium text-graphite-700">{s.label}</p>
            {!s.destaque && <p className="mt-1 text-xs text-graphite-300">{s.nota}</p>}
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-mist-300 bg-white p-6 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold text-indigo-800">
              Relatórios recentes
            </h2>
            <Link to="/app/avalia" className="text-xs font-semibold text-indigo-700 hover:text-signal-600">
              Ver todos →
            </Link>
          </div>

          {recentes.length === 0 ? (
            <div className="mt-6 rounded-xl bg-mist-100 p-6 text-center">
              <p className="text-sm text-graphite-500">
                Nenhum relatório gerado ainda. Comece uma nova avaliação para ver o resumo aqui.
              </p>
              <Button to="/app/avalia" size="sm" className="mt-4">
                Começar agora
              </Button>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-mist-200">
              {recentes.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-graphite-900">
                      {item.candidato}
                    </p>
                    <p className="truncate text-xs text-graphite-300">
                      {item.empresa || 'Empresa não informada'} ·{' '}
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

        <div className="rounded-2xl border border-mist-300 bg-white p-6 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold text-indigo-800">
              Treinamentos
            </h2>
            <Link to="/app/lidera" className="text-xs font-semibold text-indigo-700 hover:text-signal-600">
              Ver todos →
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {kits.map((kit) => (
              <li key={kit.tema} className="flex items-center justify-between gap-3 rounded-xl border border-mist-200 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-graphite-900">{kit.tema}</p>
                  <p className="text-xs text-graphite-300">{kit.slides} slides</p>
                </div>
                {kit.novo && (
                  <span className="shrink-0 rounded-full bg-signal-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                    Novo
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
