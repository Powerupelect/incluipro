import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Button } from '../components/ui/Button.jsx'
import { checkAccess } from '../lib/api.js'
import { PLANO_LABEL } from '../lib/plano.js'

const LINK_ASSINAR = 'https://pay.hotmart.com/W106997348I'
const LINK_NOTA_FISCAL =
  'mailto:contato@incluipro.com?subject=Solicita%C3%A7%C3%A3o%20de%20Nota%20Fiscal%20e%20Contrato'

const ITENS_INCLUSOS = [
  'Painel de conformidade com cálculo da cota legal',
  'Relatórios Técnicos de Inclusão, sem limite no período',
  'Kits de capacitação para lideranças, por tema e por tipo de deficiência',
  'Canal do colaborador com link próprio da empresa',
  'Documentação consolidada para fiscalização',
  'Sem limite de usuários',
  'Sem prazo mínimo de permanência',
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
          Um plano único, com tudo incluso
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-graphite-500 sm:text-lg">
          Produto único, sem travamento de recurso por plano. Preço fixo, sem variação por porte
          da empresa.
        </p>
        {semAcesso && (
          <p className="mx-auto mt-6 max-w-xl rounded-xl bg-amber-50 px-5 py-3 text-sm font-medium text-amber-700">
            Não encontramos um pagamento confirmado para o e-mail da sua conta. Assine abaixo ou
            verifique se já pagou com outro e-mail.
          </p>
        )}
      </section>

      <section className="mx-auto max-w-xl px-5 pb-16 sm:px-8">
        <div className="relative flex flex-col overflow-hidden rounded-3xl border border-volt-300 bg-white p-8 shadow-pop ring-2 ring-volt-100 sm:p-10">
          <div className="step-pattern absolute inset-x-0 top-0 h-24 opacity-[0.06]" />
          <span className="relative mb-4 inline-block w-fit rounded-full bg-volt-50 px-3 py-1 text-xs font-semibold text-volt-700">
            Plano Principal
          </span>
          <h2 className="relative font-display text-2xl font-semibold text-indigo-800 sm:text-3xl">
            Um plano, todos os módulos
          </h2>

          <div className="relative mt-5">
            <p className="font-display text-xl font-medium text-graphite-400 line-through decoration-2">
              R$ 697<span className="ml-1 font-normal">/ mês</span>
            </p>
            <p className="mt-1 font-display text-5xl font-semibold text-signal-700">
              R$ 522<span className="ml-1 text-xl font-medium text-graphite-500">/ mês</span>
            </p>
            <p className="mt-2 text-sm font-medium text-graphite-600">
              Condição de fundador — mantida nas renovações enquanto o contrato permanecer ativo.
            </p>
          </div>

          <ul className="relative mt-7 space-y-3 border-t border-mist-300 pt-7">
            {ITENS_INCLUSOS.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-base text-graphite-700">
                <svg viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 shrink-0 text-signal-600" fill="currentColor">
                  <path d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5a1 1 0 111.4-1.4l3.9 3.9 6.7-6.7a1 1 0 011.4 0z" />
                </svg>
                {item}
              </li>
            ))}
          </ul>

          <p className="relative mt-6 text-sm font-medium text-graphite-500">
            Menos que o piso da multa de uma única vaga não preenchida.
          </p>

          <Button
            href={LINK_ASSINAR}
            target="_blank"
            rel="noopener noreferrer"
            className="relative mt-6 w-full justify-center"
            size="lg"
          >
            Assinar
          </Button>
          <a
            href={LINK_NOTA_FISCAL}
            className="relative mt-3 text-center text-sm font-medium text-graphite-500 underline decoration-graphite-300 underline-offset-2 hover:text-graphite-700"
          >
            Preciso de nota fiscal e contrato
          </a>
          <p className="relative mt-1 text-center text-xs text-graphite-400">
            Entre em contato com nosso e-mail:{' '}
            <a href="mailto:contato@incluipro.com" className="font-medium text-graphite-500 hover:text-graphite-700">
              contato@incluipro.com
            </a>
          </p>
        </div>
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
                ✅ Acesso liberado{resultado.plano ? ` — ${PLANO_LABEL[resultado.plano] || resultado.plano}` : ''}!
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
                <a href="mailto:contato@incluipro.com" className="font-semibold text-amber-800">
                  contato@incluipro.com
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
