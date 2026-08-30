import { useState } from 'react'
import { Button } from './ui/Button.jsx'
import { calcularCota } from '../lib/cota.js'
import { saveLead } from '../lib/leads.js'

const CAMPOS_INICIAIS = {
  totalFuncionarios: '',
  aprendizes: '',
  aposentadosInvalidez: '',
  pcdAtuais: '',
}

const formatBRL = (valor) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function CalculadoraCota() {
  const [campos, setCampos] = useState(CAMPOS_INICIAIS)
  const [resultado, setResultado] = useState(null)
  const [email, setEmail] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [enviado, setEnviado] = useState(false)

  function handleChange(campo, valor) {
    setCampos((prev) => ({ ...prev, [campo]: valor }))
  }

  function handleCalcular(e) {
    e.preventDefault()
    const numeros = {
      totalFuncionarios: Number(campos.totalFuncionarios) || 0,
      aprendizes: Number(campos.aprendizes) || 0,
      aposentadosInvalidez: Number(campos.aposentadosInvalidez) || 0,
      pcdAtuais: Number(campos.pcdAtuais) || 0,
    }
    setResultado(calcularCota(numeros))
    setEnviado(false)
  }

  function handleEnviarLead(e) {
    e.preventDefault()
    saveLead({ origem: 'calculadora-cota', email, empresa, ...campos, ...resultado })
    setEnviado(true)
  }

  return (
    <div className="rounded-3xl border border-mist-300 bg-white p-6 shadow-card sm:p-8">
      <form onSubmit={handleCalcular} className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="font-semibold text-graphite-700">Total de funcionários (CLT)</span>
          <input
            type="number"
            min="0"
            required
            value={campos.totalFuncionarios}
            onChange={(e) => handleChange('totalFuncionarios', e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-mist-400 px-4 py-2.5 outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
          />
        </label>
        <label className="text-sm">
          <span className="font-semibold text-graphite-700">Aprendizes</span>
          <input
            type="number"
            min="0"
            value={campos.aprendizes}
            onChange={(e) => handleChange('aprendizes', e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-mist-400 px-4 py-2.5 outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
          />
        </label>
        <label className="text-sm">
          <span className="font-semibold text-graphite-700">Aposentados por invalidez</span>
          <input
            type="number"
            min="0"
            value={campos.aposentadosInvalidez}
            onChange={(e) => handleChange('aposentadosInvalidez', e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-mist-400 px-4 py-2.5 outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
          />
        </label>
        <label className="text-sm">
          <span className="font-semibold text-graphite-700">PCD atualmente contratados</span>
          <input
            type="number"
            min="0"
            value={campos.pcdAtuais}
            onChange={(e) => handleChange('pcdAtuais', e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-mist-400 px-4 py-2.5 outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
          />
        </label>
        <Button as="button" type="submit" className="justify-center sm:col-span-2">
          Calcular cota
        </Button>
      </form>

      {resultado && (
        <div className="mt-8 border-t border-mist-300 pt-8">
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl bg-mist-100 p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-graphite-500">
                Base de cálculo
              </p>
              <p className="mt-1 font-display text-2xl font-semibold text-indigo-800">
                {resultado.base}
              </p>
            </div>
            <div className="rounded-xl bg-mist-100 p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-graphite-500">
                Cota devida
              </p>
              <p className="mt-1 font-display text-2xl font-semibold text-indigo-800">
                {resultado.cotaDevida}{' '}
                <span className="text-sm font-normal text-graphite-500">
                  ({Math.round(resultado.percentual * 100)}%)
                </span>
              </p>
            </div>
            <div
              className={`rounded-xl p-4 text-center ${
                resultado.vagasEmAberto > 0 ? 'bg-red-50' : 'bg-signal-50'
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-graphite-500">
                Vagas em aberto
              </p>
              <p
                className={`mt-1 font-display text-2xl font-semibold ${
                  resultado.vagasEmAberto > 0 ? 'text-red-700' : 'text-signal-700'
                }`}
              >
                {resultado.vagasEmAberto}
              </p>
            </div>
            <div className="rounded-xl bg-mist-100 p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-graphite-500">
                Exposição estimada
              </p>
              <p className="mt-1 font-display text-xl font-semibold text-indigo-800">
                {formatBRL(resultado.exposicaoEstimada)}
              </p>
            </div>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-graphite-400">
            Estimativa referencial com base no valor mínimo por vaga. O valor efetivo depende de
            critérios de gradação da fiscalização.
          </p>

          {!enviado ? (
            <form
              onSubmit={handleEnviarLead}
              className="mt-6 flex flex-col gap-3 rounded-2xl bg-mist-100 p-5 sm:flex-row sm:items-end"
            >
              <label className="flex-1 text-sm">
                <span className="font-semibold text-graphite-700">E-mail corporativo</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@empresa.com.br"
                  className="mt-1.5 w-full rounded-xl border border-mist-400 px-4 py-2.5 outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
                />
              </label>
              <label className="flex-1 text-sm">
                <span className="font-semibold text-graphite-700">Empresa (opcional)</span>
                <input
                  type="text"
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-mist-400 px-4 py-2.5 outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
                />
              </label>
              <Button as="button" type="submit">
                Receber diagnóstico completo
              </Button>
            </form>
          ) : (
            <div className="mt-6 rounded-2xl border border-signal-200 bg-signal-50 p-5 text-sm text-signal-800">
              ✅ Recebemos seus dados. Nossa equipe vai entrar em contato com o diagnóstico
              completo.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
