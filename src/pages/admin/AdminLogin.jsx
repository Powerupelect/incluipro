import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button.jsx'
import { adminLogin } from '../../lib/api.js'
import { setAdminToken } from '../../lib/adminAuth.js'

export function AdminLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', senha: '' })
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    try {
      const res = await adminLogin(form.email, form.senha)
      setAdminToken(res.token)
      navigate('/admin', { replace: true })
    } catch (err) {
      setErro(err.message)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <section className="mx-auto flex min-h-[70svh] max-w-md flex-col justify-center px-5 py-16 sm:px-8">
      <h1 className="font-display text-3xl font-semibold text-indigo-800">Área administrativa</h1>
      <p className="mt-2 text-graphite-500">Acesso restrito à equipe IncluiPro.</p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5 rounded-2xl border border-mist-300 bg-white p-8 shadow-card"
      >
        {erro && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}
        <div>
          <label className="text-sm font-semibold text-graphite-900">E-mail</label>
          <input
            required
            type="email"
            autoComplete="username"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-mist-400 px-4 py-3 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-graphite-900">Senha</label>
          <input
            required
            type="password"
            autoComplete="current-password"
            value={form.senha}
            onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))}
            className="mt-2 w-full rounded-xl border border-mist-400 px-4 py-3 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
          />
        </div>
        <Button as="button" type="submit" disabled={carregando} className="w-full justify-center">
          {carregando ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
    </section>
  )
}
