import { useState } from 'react'
import { Button } from '../components/ui/Button.jsx'
import { calcularMaturidade, NIVEIS, CRITERIOS } from '../lib/diagnostico.js'
import { saveLead } from '../lib/leads.js'

const nivelStyle = {
  [NIVEIS.INICIAL.id]: { color: 'bg-amber-400', text: 'text-amber-600' },
  [NIVEIS.EM_DESENVOLVIMENTO.id]: { color: 'bg-volt-400', text: 'text-volt-600' },
  [NIVEIS.AVANCADO.id]: { color: 'bg-signal-500', text: 'text-signal-700' },
}

const initialForm = {
  companyName: '',
  employees: '',
  pcdCount: '',
  hasAssessmentProcess: false,
  trainsLeaders: false,
  hasAccessiblePhysicalSpace: false,
  hasInclusionGoals: false,
  tracksRetention: false,
  hasAccessibleCommunication: false,
  hasInclusionContact: false,
}

export function Diagnostico() {
  const [form, setForm] = useState(initialForm)
  const [step, setStep] = useState('form') // form | email | result
  const [email, setEmail] = useState('')
  const [consentimento, setConsentimento] = useState(false)
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
  const percentual = resultado ? Math.round((resultado.score / resultado.max) * 100) : 0

  return (
    <section className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-signal-600">
        Diagnóstico gratuito
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-indigo-800 sm:text-4xl">
        Qual o nível de maturidade em inclusão da sua empresa?
      </h1>
      <p className="mt-3 text-graphite-500">
        Responda algumas perguntas rápidas sobre processos, ambiente e cultura, e receba um
        panorama detalhado gratuito, com recomendações práticas.
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
            <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-graphite-300">
              Processos, ambiente e cultura
            </legend>
            {CRITERIOS.map((criterio) => (
              <label
                key={criterio.key}
                className="flex items-start gap-3 rounded-xl border border-mist-300 p-4 hover:border-signal-300"
              >
                <input
                  type="checkbox"
                  checked={form[criterio.key]}
                  onChange={(e) => update(criterio.key, e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-signal-600"
                />
                <span className="text-sm text-graphite-700">{criterio.label}</span>
              </label>
            ))}
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
          <label className="flex items-start gap-3 rounded-xl border border-mist-300 p-4 hover:border-signal-300">
            <input
              required
              type="checkbox"
              checked={consentimento}
              onChange={(e) => setConsentimento(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-signal-600"
            />
            <span className="text-sm text-graphite-700">
              Concordo em fornecer meus dados de contato e receber comunicações da IncluiPro
              Soluções sobre este diagnóstico e seus produtos, conforme a{' '}
              <span className="font-semibold">Lei Geral de Proteção de Dados (LGPD)</span>.
            </span>
          </label>
          <Button as="button" type="submit" disabled={!consentimento} className="w-full justify-center">
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
            <div
              className={`h-full rounded-full ${style.color} transition-all`}
              style={{ width: `${percentual}%` }}
            />
          </div>

          <p className="leading-relaxed text-graphite-700">{nivel.descricao}</p>

          <div className="rounded-xl bg-mist-200 p-5 text-sm text-graphite-700">
            Pontuação: <strong>{resultado.score}</strong> de {resultado.max} pontos possíveis
            ({percentual}%), calculada a partir da proporção de PCD no quadro de funcionários e
            de {CRITERIOS.length} dimensões de processo, ambiente, governança e cultura.
          </div>

          <div>
            <p className="text-sm font-semibold text-graphite-900">
              Detalhamento por dimensão
            </p>
            <ul className="mt-3 space-y-2">
              {resultado.atendidos.map((c) => (
                <li key={c.key} className="flex items-start gap-2.5 text-sm text-graphite-700">
                  <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-signal-600" fill="currentColor">
                    <path d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5a1 1 0 111.4-1.4l3.9 3.9 6.7-6.7a1 1 0 011.4 0z" />
                  </svg>
                  <span>
                    {c.label}
                    <span className="ml-1.5 text-xs text-graphite-300">· {c.categoria}</span>
                  </span>
                </li>
              ))}
              {resultado.naoAtendidos.map((c) => (
                <li key={c.key} className="flex items-start gap-2.5 text-sm text-graphite-400">
                  <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-graphite-300" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.7 7.3a1 1 0 00-1.4 1.4L8.6 10l-1.3 1.3a1 1 0 101.4 1.4L10 11.4l1.3 1.3a1 1 0 001.4-1.4L11.4 10l1.3-1.3a1 1 0 00-1.4-1.4L10 8.6 8.7 7.3z" clipRule="evenodd" />
                  </svg>
                  <span>
                    {c.label}
                    <span className="ml-1.5 text-xs text-graphite-300">· {c.categoria}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-signal-200 bg-signal-50 p-5">
            <p className="text-sm font-semibold text-signal-800">Próximos passos recomendados</p>
            <ul className="mt-3 space-y-2">
              {nivel.recomendacoes.map((r) => (
                <li key={r} className="flex items-start gap-2.5 text-sm text-signal-900">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-signal-600" />
                  {r}
                </li>
              ))}
            </ul>
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
