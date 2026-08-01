import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { Button } from '../components/ui/Button.jsx'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      login(form)
      const from = location.state?.from?.pathname || '/app/avalia'
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="mx-auto flex min-h-[70svh] max-w-md flex-col justify-center px-5 py-16 sm:px-8">
      <h1 className="font-display text-3xl font-semibold text-indigo-800">Entrar</h1>
      <p className="mt-2 text-graphite-500">Acesse a plataforma com o e-mail da sua empresa.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-2xl border border-mist-300 bg-white p-8 shadow-card">
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}
        <div>
          <label className="text-sm font-semibold text-graphite-900">E-mail</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-mist-400 px-4 py-3 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
            placeholder="voce@empresa.com.br"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-graphite-900">Senha</label>
          <input
            required
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-mist-400 px-4 py-3 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
            placeholder="••••••••"
          />
        </div>
        <Button as="button" type="submit" className="w-full justify-center">
          Entrar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-graphite-500">
        Ainda não tem conta?{' '}
        <Link to="/cadastro" className="font-semibold text-signal-700 hover:text-signal-800">
          Criar conta
        </Link>
      </p>
    </section>
  )
}
