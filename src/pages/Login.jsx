import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { Button } from '../components/ui/Button.jsx'

export function Login() {
  const { login, solicitarRecuperacaoSenha } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [entrando, setEntrando] = useState(false)

  const [mostrarRecuperacao, setMostrarRecuperacao] = useState(false)
  const [emailRecuperacao, setEmailRecuperacao] = useState('')
  const [enviandoRecuperacao, setEnviandoRecuperacao] = useState(false)
  const [recuperacaoEnviada, setRecuperacaoEnviada] = useState(false)
  const [erroRecuperacao, setErroRecuperacao] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setEntrando(true)
    try {
      await login(form)
      const from = location.state?.from?.pathname || '/app/avalia'
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setEntrando(false)
    }
  }

  async function handleSolicitarRecuperacao(e) {
    e.preventDefault()
    setErroRecuperacao('')
    setEnviandoRecuperacao(true)
    try {
      await solicitarRecuperacaoSenha(emailRecuperacao)
      setRecuperacaoEnviada(true)
    } catch (err) {
      setErroRecuperacao(err.message)
    } finally {
      setEnviandoRecuperacao(false)
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
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-graphite-900">Senha</label>
            <button
              type="button"
              onClick={() => {
                setMostrarRecuperacao((v) => !v)
                setRecuperacaoEnviada(false)
                setErroRecuperacao('')
              }}
              className="text-xs font-semibold text-signal-700 hover:text-signal-800"
            >
              Esqueci minha senha
            </button>
          </div>
          <input
            required
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-mist-400 px-4 py-3 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
            placeholder="••••••••"
          />
        </div>
        <Button as="button" type="submit" disabled={entrando} className="w-full justify-center">
          {entrando ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>

      {mostrarRecuperacao && (
        <div className="mt-4 rounded-2xl border border-mist-300 bg-mist-100 p-6">
          {recuperacaoEnviada ? (
            <p className="text-sm text-signal-700">
              ✅ Se este e-mail tiver uma conta, enviamos um link para redefinir a senha. Verifique
              sua caixa de entrada.
            </p>
          ) : (
            <form onSubmit={handleSolicitarRecuperacao} className="space-y-3">
              <label className="text-sm font-semibold text-graphite-900">
                Digite seu e-mail para receber o link de recuperação
              </label>
              {erroRecuperacao && <p className="text-sm text-red-600">{erroRecuperacao}</p>}
              <input
                required
                type="email"
                value={emailRecuperacao}
                onChange={(e) => setEmailRecuperacao(e.target.value)}
                placeholder="voce@empresa.com.br"
                className="w-full rounded-xl border border-mist-400 px-4 py-3 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
              />
              <Button as="button" type="submit" size="sm" disabled={enviandoRecuperacao}>
                {enviandoRecuperacao ? 'Enviando…' : 'Enviar link de recuperação'}
              </Button>
            </form>
          )}
        </div>
      )}

      <p className="mt-6 text-center text-sm text-graphite-500">
        Ainda não tem conta?{' '}
        <Link to="/cadastro" className="font-semibold text-signal-700 hover:text-signal-800">
          Criar conta
        </Link>
      </p>
    </section>
  )
}
