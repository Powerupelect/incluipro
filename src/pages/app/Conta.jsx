import { useState } from 'react'
import { useAuth } from '../../lib/auth.jsx'
import { getApiKey, setApiKey } from '../../lib/apiKey.js'
import { Button } from '../../components/ui/Button.jsx'

export function Conta() {
  const { user } = useAuth()
  const [apiKey, setApiKeyState] = useState(() => getApiKey())
  const [saved, setSaved] = useState(false)

  function handleSaveKey(e) {
    e.preventDefault()
    setApiKey(apiKey.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-signal-600">
          Minha conta
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-indigo-800">
          Dados da empresa e assinatura
        </h1>
      </div>

      <div className="rounded-2xl border border-mist-300 bg-white p-6 shadow-card sm:p-8">
        <h2 className="font-display text-lg font-semibold text-indigo-800">Empresa</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-graphite-300">
              Nome da empresa
            </dt>
            <dd className="mt-1 text-sm text-graphite-900">{user?.companyName}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-graphite-300">
              E-mail responsável
            </dt>
            <dd className="mt-1 text-sm text-graphite-900">{user?.email}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-mist-300 bg-white p-6 shadow-card sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-indigo-800">Plano atual</h2>
            <p className="mt-1 text-sm text-graphite-500">{user?.plan}</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700">
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
              <path d="M10 2a1 1 0 011 1v6.586l3.707 3.707a1 1 0 01-1.414 1.414L9 10.414V3a1 1 0 011-1z" />
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 110-12 6 6 0 010 12z" fillRule="evenodd" clipRule="evenodd" />
            </svg>
            Acesso para testes — nenhuma cobrança ativa
          </span>
        </div>
        <p className="mt-4 text-xs text-graphite-300">
          {/* TODO: integrar com Stripe Billing ou Hotmart/Kiwify quando o plano pago for ativado. */}
          Esta conta está em período de testes da plataforma. Nenhum meio de pagamento é
          coletado e nenhuma cobrança será feita nesta etapa.
        </p>
      </div>

      <div className="rounded-2xl border border-mist-300 bg-white p-6 shadow-card sm:p-8">
        <h2 className="font-display text-lg font-semibold text-indigo-800">
          Chave de API da Anthropic
        </h2>
        <p className="mt-1 text-sm text-graphite-500">
          Usada pelo IncluiPro Avalia para gerar relatórios. Armazenada apenas no seu navegador
          (localStorage) — nunca é enviada a servidores da IncluiPro.
        </p>
        <form onSubmit={handleSaveKey} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKeyState(e.target.value)}
            placeholder="sk-ant-..."
            className="flex-1 rounded-xl border border-mist-400 px-4 py-3 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
          />
          <Button as="button" type="submit">
            {saved ? 'Salvo!' : 'Salvar chave'}
          </Button>
        </form>
        <p className="mt-3 text-xs text-amber-700">
          Atenção: esta chamada é feita diretamente do navegador para fins de prototipagem. Em
          produção, mova a chamada à API para um backend/proxy seguro.
        </p>
      </div>
    </div>
  )
}
