import { useState } from 'react'
import { Button } from './ui/Button.jsx'
import { calcularCota, corSemaforo } from '../lib/cota.js'
import { saveLead } from '../lib/leads.js'
import { enviarDiagnostico } from '../lib/api.js'

const CAMPOS_INICIAIS = {
  totalFuncionarios: '',
  aprendizes: '',
  aposentadosInvalidez: '',
  pcdAtuais: '',
}

const formatBRL = (valor) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const SEMAFORO_COR = {
  signal: 'text-signal-400',
  amber: 'text-amber-400',
  red: 'text-red-400',
}

export function CalculadoraCota() {
  const [campos, setCampos] = useState(CAMPOS_INICIAIS)
  const [resultado, setResultado] = useState(null)
  const [email, setEmail] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erroEnvio, setErroEnvio] = useState('')

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

  async function handleEnviarLead(e) {
    e.preventDefault()
    setErroEnvio('')
    setEnviando(true)
    saveLead({ origem: 'calculadora-cota', email, empresa, ...campos, ...resultado })
    try {
      await enviarDiagnostico({ email, empresa, ...campos })
      setEnviado(true)
    } catch {
      setErroEnvio('Não foi possível enviar o e-mail agora. Tente novamente em instantes.')
    } finally {
      setEnviando(false)
    }
  }

  const semaforo = resultado ? corSemaforo(resultado.percentualCumprimento) : null

  return (
    <div className="overflow-hidden rounded-3xl border border-indigo-950/10 bg-indigo-900 shadow-pop">
      {/* "Visor" digital */}
      <div className="border-b border-white/10 bg-indigo-950 px-6 py-6 sm:px-8">
        {resultado ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-indigo-400">Base</p>
              <p className="mt-0.5 font-mono text-2xl font-semibold tabular-nums text-white">{resultado.base}</p>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-indigo-400">Cota devida</p>
              <p className="mt-0.5 font-mono text-2xl font-semibold tabular-nums text-white">
                {resultado.cotaDevida}
                <span className="ml-1 text-sm font-normal text-indigo-400">
                  ({Math.round(resultado.percentual * 100)}%)
                </span>
              </p>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-indigo-400">Vagas em aberto</p>
              <p className={`mt-0.5 font-mono text-2xl font-semibold tabular-nums ${SEMAFORO_COR[semaforo.cor]}`}>
                {resultado.vagasEmAberto}
              </p>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-indigo-400">Exposição estimada</p>
              <p className="mt-0.5 font-mono text-xl font-semibold tabular-nums text-white">
                {formatBRL(resultado.exposicaoEstimada)}
              </p>
            </div>
          </div>
        ) : (
          <p className="font-mono text-sm text-indigo-500">
            Preencha os números do seu quadro e calcule →
          </p>
        )}
      </div>

      {/* "Teclado" */}
      <form onSubmit={handleCalcular} className="grid gap-3 bg-white p-6 sm:grid-cols-2 sm:p-8">
        <label className="text-sm">
          <span className="font-semibold text-graphite-700">Total de funcionários (CLT)</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            required
            value={campos.totalFuncionarios}
            onChange={(e) => handleChange('totalFuncionarios', e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-mist-400 px-4 py-3 font-mono text-lg tabular-nums outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
          />
        </label>
        <label className="text-sm">
          <span className="font-semibold text-graphite-700">Aprendizes</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            value={campos.aprendizes}
            onChange={(e) => handleChange('aprendizes', e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-mist-400 px-4 py-3 font-mono text-lg tabular-nums outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
          />
        </label>
        <label className="text-sm">
          <span className="font-semibold text-graphite-700">Aposentados por invalidez</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            value={campos.aposentadosInvalidez}
            onChange={(e) => handleChange('aposentadosInvalidez', e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-mist-400 px-4 py-3 font-mono text-lg tabular-nums outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
          />
        </label>
        <label className="text-sm">
          <span className="font-semibold text-graphite-700">PCD atualmente contratados</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            value={campos.pcdAtuais}
            onChange={(e) => handleChange('pcdAtuais', e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-mist-400 px-4 py-3 font-mono text-lg tabular-nums outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
          />
        </label>
        <button
          type="submit"
          className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-signal-600 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-signal-700 sm:col-span-2"
        >
          <span className="font-mono text-lg">=</span> Calcular cota
        </button>

        {resultado && (
          <div className="sm:col-span-2">
            <p className="text-xs leading-relaxed text-graphite-400">
              Estimativa referencial com base no valor mínimo por vaga. O valor efetivo depende de
              critérios de gradação da fiscalização.
            </p>

            {!enviado ? (
              <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-mist-100 p-5 sm:flex-row sm:items-end">
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
                <Button as="button" type="button" onClick={handleEnviarLead} disabled={enviando}>
                  {enviando ? 'Enviando…' : 'Receber diagnóstico completo'}
                </Button>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-signal-200 bg-signal-50 p-5 text-sm text-signal-800">
                ✅ Diagnóstico completo enviado para {email} — confira sua caixa de entrada (e o
                spam, por garantia).
              </div>
            )}
            {erroEnvio && <p className="mt-3 text-sm text-red-600">{erroEnvio}</p>}
          </div>
        )}
      </form>
    </div>
  )
}
