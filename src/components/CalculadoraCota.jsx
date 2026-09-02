import { useEffect, useState } from 'react'
import { Button } from './ui/Button.jsx'
import { calcularCota, corSemaforo } from '../lib/cota.js'

const CAMPOS_INICIAIS = {
  totalFuncionarios: '',
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

  function handleChange(campo, valor) {
    setCampos((prev) => ({ ...prev, [campo]: valor }))
  }

  // Calculadora "ao vivo" — o resultado atualiza a cada tecla, sem precisar de um botão.
  useEffect(() => {
    if (!campos.totalFuncionarios) {
      setResultado(null)
      return
    }
    setResultado(
      calcularCota({
        totalFuncionarios: Number(campos.totalFuncionarios) || 0,
        pcdAtuais: Number(campos.pcdAtuais) || 0,
      }),
    )
  }, [campos.totalFuncionarios, campos.pcdAtuais])

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

      {/* "Teclado" — dois campos, resultado ao vivo, sem botão de calcular */}
      <div className="grid gap-3 bg-white p-6 sm:grid-cols-2 sm:p-8">
        <label className="text-sm">
          <span className="font-semibold text-graphite-700">Total de funcionários (CLT)</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            value={campos.totalFuncionarios}
            onChange={(e) => handleChange('totalFuncionarios', e.target.value)}
            placeholder="Ex: 340"
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
            placeholder="Ex: 4"
            className="mt-1.5 w-full rounded-xl border border-mist-400 px-4 py-3 font-mono text-lg tabular-nums outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
          />
        </label>

        {resultado && (
          <div className="sm:col-span-2">
            <p className="text-xs leading-relaxed text-graphite-400">
              Estimativa referencial com base no valor mínimo por vaga. O valor efetivo depende de
              critérios de gradação da fiscalização.
            </p>

            <div className="mt-5 rounded-2xl border border-mist-300 bg-mist-100 p-6">
              <p className="font-display text-lg font-semibold text-indigo-900">
                Como a IncluiPro pode ajudar
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-mist-300 bg-white p-4">
                  <p className="text-sm font-semibold text-signal-700">IncluiPro Avalia</p>
                  <p className="mt-1 text-sm leading-relaxed text-graphite-600">
                    Relatórios Técnicos de Inclusão prontos em minutos, para estruturar cada
                    contratação e organizar a documentação da cota.
                  </p>
                </div>
                <div className="rounded-xl border border-mist-300 bg-white p-4">
                  <p className="text-sm font-semibold text-signal-700">IncluiPro Lidera</p>
                  <p className="mt-1 text-sm leading-relaxed text-graphite-600">
                    Kits de treinamento prontos para preparar as lideranças a gerir equipes
                    inclusivas no dia a dia.
                  </p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button to="/produtos">Ver todos os produtos</Button>
                <Button to="/diagnostico" variant="ghost">
                  Fazer diagnóstico completo
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
