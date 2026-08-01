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

  function handleManageSubscription() {
    // TODO: integrar com Stripe Billing ou Hotmart/Kiwify.
    alert('Gerenciamento de assinatura ainda não conectado a um provedor de pagamentos.')
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
          <Button as="button" variant="ghost" onClick={handleManageSubscription}>
            Gerenciar assinatura
          </Button>
        </div>
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
