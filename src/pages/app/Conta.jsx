import { useAuth } from '../../lib/auth.jsx'

export function Conta() {
  const { user } = useAuth()

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
        <h2 className="font-display text-lg font-semibold text-indigo-800">Suporte</h2>
        <p className="mt-1 text-sm text-graphite-500">
          Dúvidas sobre sua conta, relatórios ou kits de treinamento? Fale com a gente em{' '}
          <a href="mailto:contato@incluipro.com.br" className="font-semibold text-signal-700 hover:text-signal-800">
            contato@incluipro.com.br
          </a>
          .
        </p>
      </div>
    </div>
  )
}
