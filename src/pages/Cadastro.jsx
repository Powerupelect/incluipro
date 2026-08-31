import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { Button } from '../components/ui/Button.jsx'

export function Cadastro() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ companyName: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [confirmarEmail, setConfirmarEmail] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setEnviando(true)
    try {
      const resultado = await register(form)
      if (resultado?.requiresEmailConfirmation) {
        setConfirmarEmail(true)
      } else {
        navigate('/app/avalia', { replace: true })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  if (confirmarEmail) {
    return (
      <section className="mx-auto flex min-h-[70svh] max-w-md flex-col justify-center px-5 py-16 text-center sm:px-8">
        <div className="rounded-2xl border border-signal-200 bg-signal-50 p-8">
          <h1 className="font-display text-2xl font-semibold text-indigo-800">
            Confirme seu e-mail
          </h1>
          <p className="mt-3 text-sm text-graphite-700">
            Enviamos um link de confirmação para <strong>{form.email}</strong>. Clique nele para
            ativar sua conta e depois volte para fazer login.
          </p>
          <Button to="/login" className="mt-6">
            Ir para o login
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto flex min-h-[70svh] max-w-md flex-col justify-center px-5 py-16 sm:px-8">
      <h1 className="font-display text-3xl font-semibold text-indigo-800">Criar conta</h1>
      <p className="mt-2 text-graphite-500">
        Cadastre sua empresa para acessar o diagnóstico completo e assinar a plataforma.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-2xl border border-mist-300 bg-white p-8 shadow-card">
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}
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
        <div>
          <label className="text-sm font-semibold text-graphite-900">E-mail do responsável</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className="mt-2 w-full rounded-xl border border-mist-400 px-4 py-3 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
            placeholder="voce@empresa.com.br"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-graphite-900">Senha</label>
          <input
            required
            minLength={6}
            type="password"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            className="mt-2 w-full rounded-xl border border-mist-400 px-4 py-3 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
            placeholder="Mínimo 6 caracteres"
          />
        </div>
        <Button as="button" type="submit" disabled={enviando} className="w-full justify-center">
          {enviando ? 'Criando conta…' : 'Criar conta e assinar'}
        </Button>
        <p className="text-center text-xs text-graphite-300">
          Seu acesso à plataforma depende de um pagamento confirmado para este e-mail — veja o
          plano em{' '}
          <Link to="/assinatura" className="font-semibold text-graphite-500 hover:text-signal-700">
            Assinatura
          </Link>
          .
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-graphite-500">
        Já tem conta?{' '}
        <Link to="/login" className="font-semibold text-signal-700 hover:text-signal-800">
          Entrar
        </Link>
      </p>
    </section>
  )
}
