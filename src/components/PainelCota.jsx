import { Link } from 'react-router-dom'
import { calcularCota, corSemaforo, faixaCota } from '../lib/cota.js'
import { StatusPonto } from './ui/Table.jsx'

const MES_ANO = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

export function PainelCota({ empresa, pcdAtivos }) {
  if (!empresa) return null

  const totalFuncionarios = empresa.total_funcionarios || 0
  const aprendizes = empresa.aprendizes || 0
  const aposentadosInvalidez = empresa.aposentados_invalidez || 0

  if (totalFuncionarios === 0) {
    return (
      <div className="rounded-lg border border-mist-300 bg-white p-6 sm:p-8">
        <h2 className="text-base font-semibold text-indigo-900">Cota de PCD</h2>
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

  const resultado = calcularCota({ totalFuncionarios, aprendizes, aposentadosInvalidez, pcdAtuais: pcdAtivos })
  const semaforo = corSemaforo(resultado.percentualCumprimento)

  return (
    <div className="rounded-lg border border-mist-300 bg-white p-6 sm:p-8">
      <p className="text-sm text-graphite-500">
        {empresa.nome || 'Sua empresa'} · {MES_ANO}
      </p>

      <p className="mt-3 font-display text-4xl font-semibold leading-none text-indigo-900 sm:text-5xl">
        {pcdAtivos} <span className="text-graphite-300">/</span> {resultado.cotaDevida}
      </p>
      <p className="mt-2 text-graphite-600">colaboradores com deficiência na cota legal</p>

      <div className="mt-4">
        {resultado.vagasEmAberto > 0 ? (
          <StatusPonto cor={semaforo.cor}>
            {resultado.vagasEmAberto} vaga{resultado.vagasEmAberto !== 1 ? 's' : ''} em aberto
          </StatusPonto>
        ) : (
          <StatusPonto cor="signal">Cota cumprida</StatusPonto>
        )}
      </div>

      <div className="mt-8 border-t border-mist-300 pt-6">
        <p className="text-sm font-semibold text-graphite-900">Como esse número foi calculado</p>
        <dl className="mt-3 space-y-1.5 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-graphite-500">Total de empregados CLT (matriz e filiais)</dt>
            <dd className="tabular-nums text-graphite-900">{totalFuncionarios}</dd>
          </div>
          {aprendizes > 0 && (
            <div className="flex items-center justify-between">
              <dt className="text-graphite-500">− aprendizes (não entram na base — Lei 10.097/2000)</dt>
              <dd className="tabular-nums text-graphite-900">{aprendizes}</dd>
            </div>
          )}
          {aposentadosInvalidez > 0 && (
            <div className="flex items-center justify-between">
              <dt className="text-graphite-500">− aposentados por invalidez</dt>
              <dd className="tabular-nums text-graphite-900">{aposentadosInvalidez}</dd>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-mist-200 pt-1.5 font-semibold">
            <dt className="text-graphite-900">Base de cálculo da cota</dt>
            <dd className="tabular-nums text-graphite-900">{resultado.base}</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-graphite-700">
          Alíquota legal aplicável: <strong>{Math.round(resultado.percentual * 100)}%</strong>, faixa de{' '}
          {faixaCota(resultado.base)} → cota devida de <strong>{resultado.cotaDevida}</strong>.
        </p>
      </div>
    </div>
  )
}
