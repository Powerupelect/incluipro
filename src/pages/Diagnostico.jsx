import { useState } from 'react'
import { Button } from '../components/ui/Button.jsx'
import { calcularMaturidade, NIVEIS } from '../lib/diagnostico.js'
import { saveLead } from '../lib/leads.js'

const nivelStyle = {
  [NIVEIS.INICIAL.id]: { bar: 'w-1/3', color: 'bg-amber-400', text: 'text-amber-600' },
  [NIVEIS.EM_DESENVOLVIMENTO.id]: { bar: 'w-2/3', color: 'bg-volt-400', text: 'text-volt-600' },
  [NIVEIS.AVANCADO.id]: { bar: 'w-full', color: 'bg-signal-500', text: 'text-signal-700' },
}

export function Diagnostico() {
  const [form, setForm] = useState({
    companyName: '',
    employees: '',
    pcdCount: '',
    hasAssessmentProcess: false,
    trainsLeaders: false,
  })
  const [step, setStep] = useState('form') // form | email | result
  const [email, setEmail] = useState('')
  const [resultado, setResultado] = useState(null)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleSubmitForm(e) {
    e.preventDefault()
    const r = calcularMaturidade(form)
    setResultado(r)
    setStep('email')
  }

  function handleSubmitEmail(e) {
    e.preventDefault()
    // TODO: integrar com backend/CRM — por enquanto, o lead é salvo apenas em localStorage.
    saveLead({ ...form, email })
    setStep('result')
  }

  const nivel = resultado?.nivel
  const style = nivel ? nivelStyle[nivel.id] : null

  return (
    <section className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-signal-600">
        Diagnóstico gratuito
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-indigo-800 sm:text-4xl">
        Qual o nível de maturidade em inclusão da sua empresa?
      </h1>
      <p className="mt-3 text-graphite-500">
        Responda 4 perguntas rápidas e receba um panorama inicial gratuito.
      </p>

      {step === 'form' && (
        <form
          onSubmit={handleSubmitForm}
          className="mt-10 space-y-6 rounded-2xl border border-mist-300 bg-white p-8 shadow-card"
        >
          <div>
            <label className="text-sm font-semibold text-graphite-900">Nome da empresa</label>
            <input
              required
              value={form.companyName}
              onChange={(e) => update('companyName', e.target.value)}
              className="mt-2 w-full rounded-xl border border-mist-400 px-4 py-3 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
              placeholder="Ex: Comércio Horizonte Ltda."
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-graphite-900">
                Número de funcionários
              </label>
              <input
                required
                type="number"
                min="0"
                value={form.employees}
                onChange={(e) => update('employees', e.target.value)}
                className="mt-2 w-full rounded-xl border border-mist-400 px-4 py-3 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
                placeholder="Ex: 120"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-graphite-900">
                Nº de PCD contratados hoje
              </label>
              <input
                required
                type="number"
                min="0"
                value={form.pcdCount}
                onChange={(e) => update('pcdCount', e.target.value)}
                className="mt-2 w-full rounded-xl border border-mist-400 px-4 py-3 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
                placeholder="Ex: 4"
              />
            </div>
          </div>

          <fieldset className="space-y-3 border-t border-mist-300 pt-6">
            <label className="flex items-start gap-3 rounded-xl border border-mist-300 p-4 hover:border-signal-300">
              <input
                type="checkbox"
                checked={form.hasAssessmentProcess}
                onChange={(e) => update('hasAssessmentProcess', e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-signal-600"
              />
              <span className="text-sm text-graphite-700">
                Já temos um processo estruturado de avaliação social para candidatos PCD.
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-xl border border-mist-300 p-4 hover:border-signal-300">
              <input
                type="checkbox"
                checked={form.trainsLeaders}
                onChange={(e) => update('trainsLeaders', e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-signal-600"
              />
              <span className="text-sm text-graphite-700">
                Já treinamos líderes sobre gestão de equipes inclusivas.
              </span>
            </label>
          </fieldset>

          <Button as="button" type="submit" className="w-full justify-center">
            Ver meu nível de maturidade
          </Button>
        </form>
      )}

      {step === 'email' && (
        <form
          onSubmit={handleSubmitEmail}
          className="mt-10 space-y-5 rounded-2xl border border-mist-300 bg-white p-8 shadow-card"
        >
          <h2 className="font-display text-xl font-semibold text-indigo-800">
            Seu diagnóstico está pronto 🎉
          </h2>
          <p className="text-sm text-graphite-500">
            Informe seu e-mail corporativo para ver o resultado completo e receber recomendações
            personalizadas.
          </p>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-mist-400 px-4 py-3 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
            placeholder="voce@empresa.com.br"
          />
          <Button as="button" type="submit" className="w-full justify-center">
            Ver resultado completo
          </Button>
        </form>
      )}

      {step === 'result' && resultado && (
        <div className="mt-10 space-y-6 rounded-2xl border border-mist-300 bg-white p-8 shadow-card">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-graphite-300">
              Nível de maturidade em inclusão
            </p>
            <p className={`mt-1 font-display text-3xl font-semibold ${style.text}`}>
              {nivel.label}
            </p>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-mist-300">
            <div className={`h-full rounded-full ${style.color} ${style.bar} transition-all`} />
          </div>

          <p className="leading-relaxed text-graphite-700">{nivel.descricao}</p>

          <div className="rounded-xl bg-mist-200 p-5 text-sm text-graphite-700">
            Pontuação: <strong>{resultado.score}</strong> de {resultado.max} pontos possíveis,
            calculada a partir da proporção de PCD no quadro de funcionários e da existência de
            processos estruturados de avaliação e treinamento de líderes.
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button to="/produtos">Ver como o IncluiPro pode ajudar</Button>
            <Button to="/cadastro" variant="ghost">
              Criar conta e assinar
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}
