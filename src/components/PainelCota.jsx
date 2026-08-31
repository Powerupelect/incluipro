import { useState } from 'react'
import { Link } from 'react-router-dom'
import { calcularCota } from '../lib/cota.js'

function corSemaforo(percentualCumprimento) {
  if (percentualCumprimento >= 100) return { cor: 'signal', label: 'Cota cumprida' }
  if (percentualCumprimento >= 80) return { cor: 'amber', label: 'Falta pouco' }
  return { cor: 'red', label: 'Abaixo da cota' }
}

const CORES = {
  signal: { bg: 'bg-signal-50', text: 'text-signal-700', dot: 'bg-signal-500' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  red: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
}

export function PainelCota({ empresa, pcdAtivos }) {
  const [simulando, setSimulando] = useState(0)

  if (!empresa) return null

  const totalFuncionarios = empresa.total_funcionarios || 0
  const aprendizes = empresa.aprendizes || 0
  const aposentadosInvalidez = empresa.aposentados_invalidez || 0

  if (totalFuncionarios === 0) {
    return (
      <div className="rounded-2xl border border-mist-300 bg-white p-6 shadow-card sm:p-8">
        <h2 className="font-display text-lg font-semibold text-indigo-800">Cota de PCD</h2>
        <p className="mt-2 text-sm text-graphite-500">
          Informe o quadro de funcionários da empresa para ver sua cota calculada aqui.
        </p>
        <Link
          to="/app/conta"
          className="mt-4 inline-block text-sm font-semibold text-signal-700 hover:text-signal-800"
        >
          Preencher dados da empresa →
        </Link>
      </div>
    )
  }

  const resultado = calcularCota({
    totalFuncionarios,
    aprendizes,
    aposentadosInvalidez,
    pcdAtuais: pcdAtivos,
  })

  const resultadoSimulado = calcularCota({
    totalFuncionarios,
    aprendizes,
    aposentadosInvalidez,
    pcdAtuais: pcdAtivos + simulando,
  })

  const semaforo = corSemaforo(resultado.percentualCumprimento)
  const cores = CORES[semaforo.cor]

  return (
    <div className="rounded-2xl border border-mist-300 bg-white p-6 shadow-card sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-indigo-800">Cota de PCD</h2>
        <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${cores.bg} ${cores.text}`}>
          <span className={`h-2 w-2 rounded-full ${cores.dot}`} />
          {semaforo.label}
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl bg-mist-100 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-graphite-500">Base de cálculo</p>
          <p className="mt-1 font-display text-xl font-semibold text-indigo-800">{resultado.base}</p>
        </div>
        <div className="rounded-xl bg-mist-100 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-graphite-500">Percentual</p>
          <p className="mt-1 font-display text-xl font-semibold text-indigo-800">
            {Math.round(resultado.percentual * 100)}%
          </p>
        </div>
        <div className="rounded-xl bg-mist-100 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-graphite-500">Cota devida</p>
          <p className="mt-1 font-display text-xl font-semibold text-indigo-800">{resultado.cotaDevida}</p>
        </div>
        <div className="rounded-xl bg-mist-100 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-graphite-500">Cota cumprida</p>
          <p className="mt-1 font-display text-xl font-semibold text-indigo-800">{pcdAtivos}</p>
        </div>
        <div className={`rounded-xl p-4 ${resultado.vagasEmAberto > 0 ? 'bg-red-50' : 'bg-signal-50'}`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-graphite-500">Vagas em aberto</p>
          <p className={`mt-1 font-display text-xl font-semibold ${resultado.vagasEmAberto > 0 ? 'text-red-700' : 'text-signal-700'}`}>
            {resultado.vagasEmAberto}
          </p>
        </div>
        <div className="rounded-xl bg-mist-100 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-graphite-500">% cumprido</p>
          <p className="mt-1 font-display text-xl font-semibold text-indigo-800">
            {Math.round(resultado.percentualCumprimento)}%
          </p>
        </div>
      </div>

      <div className="mt-8 border-t border-mist-300 pt-6">
        <p className="text-sm font-semibold text-graphite-900">
          Simulador: se eu contratar mais pessoas, como fico?
        </p>
        <div className="mt-3 flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="20"
            value={simulando}
            onChange={(e) => setSimulando(Number(e.target.value))}
            className="flex-1 accent-signal-600"
          />
          <span className="w-16 shrink-0 text-right text-sm font-semibold text-graphite-900">
            +{simulando}
          </span>
        </div>
        {simulando > 0 && (
          <p className="mt-3 text-sm text-graphite-700">
            Com mais <strong>{simulando}</strong> contratação{simulando > 1 ? 'ões' : ''}, ficam{' '}
            <strong>{resultadoSimulado.vagasEmAberto}</strong> vaga{resultadoSimulado.vagasEmAberto !== 1 ? 's' : ''}{' '}
            em aberto ({Math.round(resultadoSimulado.percentualCumprimento)}% da cota cumprido).
          </p>
        )}
      </div>
    </div>
  )
}
