import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Button } from '../components/ui/Button.jsx'
import { checkAccess } from '../lib/api.js'

const PLANOS = [
  {
    id: 'mensal',
    nome: 'Assinatura Mensal',
    preco: 'R$ 69,90',
    periodo: '/mês',
    link: 'https://pay.hotmart.com/W106997348I',
    itens: [
      'Acesso completo ao IncluiPro Avalia',
      'Acesso completo à biblioteca do IncluiPro Lidera',
      'Cancele quando quiser',
    ],
    accent: 'signal',
  },
  {
    id: 'vitalicio',
    nome: 'Acesso Vitalício',
    preco: 'R$ 247',
    periodo: 'pagamento único',
    link: 'https://pay.hotmart.com/B106997595Q?bid=1785730636924',
    itens: [
      'Acesso completo ao IncluiPro Avalia',
      'Acesso completo à biblioteca do IncluiPro Lidera',
      'Pague uma vez, use para sempre',
    ],
    accent: 'volt',
    destaque: true,
  },
]

export function Assinatura() {
  const location = useLocation()
  const semAcesso = location.state?.semAcesso
  const [email, setEmail] = useState('')
  const [resultado, setResultado] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  async function handleVerificar(e) {
    e.preventDefault()
    setErro('')
    setResultado(null)
    setCarregando(true)
    try {
      const res = await checkAccess(email)
      setResultado(res)
    } catch (err) {
      setErro(err.message)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div>
      <section className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-signal-600">Assinatura</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-indigo-800 sm:text-4xl">
          Escolha seu plano e comece agora
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-graphite-500">
          Pagamento processado com segurança pela Hotmart. O acesso é liberado automaticamente
          assim que o pagamento for confirmado.
        </p>
        {semAcesso && (
          <p className="mx-auto mt-6 max-w-xl rounded-xl bg-amber-50 px-5 py-3 text-sm font-medium text-amber-700">
            Não encontramos um pagamento confirmado para o e-mail da sua conta. Assine um plano
            abaixo ou verifique se já pagou com outro e-mail.
          </p>
        )}
      </section>

      <section className="mx-auto grid max-w-4xl gap-6 px-5 pb-16 sm:px-8 md:grid-cols-2">
        {PLANOS.map((plano) => (
          <div
            key={plano.id}
            className={`flex flex-col rounded-2xl border bg-white p-8 shadow-card ${
              plano.destaque ? 'border-volt-300 ring-2 ring-volt-100' : 'border-mist-300'
            }`}
          >
            {plano.destaque && (
              <span className="mb-3 inline-block w-fit rounded-full bg-volt-50 px-3 py-1 text-xs font-semibold text-volt-700">
                Melhor custo-benefício
              </span>
            )}
            <h2 className="font-display text-xl font-semibold text-indigo-800">{plano.nome}</h2>
            <p className="mt-3 flex items-baseline gap-1">
              <span className="font-display text-4xl font-semibold text-indigo-900">
                {plano.preco}
              </span>
              <span className="text-sm text-graphite-500">{plano.periodo}</span>
            </p>
            <ul className="mt-6 flex-1 space-y-2.5">
              {plano.itens.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-graphite-700">
                  <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-signal-600" fill="currentColor">
                    <path d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5a1 1 0 111.4-1.4l3.9 3.9 6.7-6.7a1 1 0 011.4 0z" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <Button href={plano.link} className="mt-8 w-full justify-center" size="lg">
              Assinar agora
            </Button>
          </div>
        ))}
      </section>

      <section className="border-t border-mist-300 bg-mist-100 py-16">
        <div className="mx-auto max-w-md px-5 sm:px-8">
          <h2 className="font-display text-xl font-semibold text-indigo-800">Já pagou?</h2>
          <p className="mt-2 text-sm text-graphite-500">
            Digite o e-mail que você usou na compra para verificar se seu acesso já foi liberado.
          </p>
          <form onSubmit={handleVerificar} className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@empresa.com.br"
              className="flex-1 rounded-xl border border-mist-400 px-4 py-3 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
            />
            <Button as="button" type="submit" disabled={carregando}>
              {carregando ? 'Verificando…' : 'Verificar'}
            </Button>
          </form>

          {erro && <p className="mt-4 text-sm text-red-600">{erro}</p>}

          {resultado && resultado.liberado && (
            <div className="mt-5 rounded-xl border border-signal-200 bg-signal-50 p-5">
              <p className="text-sm font-semibold text-signal-800">
                ✅ Acesso liberado{resultado.plano ? ` — plano ${resultado.plano === 'vitalicio' ? 'Vitalício' : 'Mensal'}` : ''}!
              </p>
              <p className="mt-2 text-sm text-graphite-700">
                Entre com este e-mail para acessar a plataforma.
              </p>
              <div className="mt-3 flex gap-2">
                <Button to="/login" size="sm">Entrar</Button>
                <Button to="/cadastro" variant="ghost" size="sm">Criar conta</Button>
              </div>
            </div>
          )}

          {resultado && !resultado.liberado && (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm font-semibold text-amber-800">
                Ainda não identificamos um pagamento confirmado para este e-mail.
              </p>
              <p className="mt-2 text-sm text-graphite-700">
                Se você acabou de pagar, aguarde alguns minutos e tente de novo. Se o problema
                continuar, fale com a gente em{' '}
                <a href="mailto:contato.incluipro@gmail.com" className="font-semibold text-amber-800">
                  contato.incluipro@gmail.com
                </a>
                .
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-8">
        <p className="text-sm text-graphite-500">
          Quer testar antes com o diagnóstico gratuito?{' '}
          <Link to="/diagnostico" className="font-semibold text-indigo-700 hover:text-signal-600">
            Faça o diagnóstico de maturidade
          </Link>
          .
        </p>
      </section>
    </div>
  )
}
