import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { Button } from '../components/ui/Button.jsx'

export function RedefinirSenha() {
  const { definirNovaSenha } = useAuth()
  const navigate = useNavigate()
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    if (senha.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.')
      return
    }
    if (senha !== confirmarSenha) {
      setErro('As senhas não conferem.')
      return
    }
    setEnviando(true)
    try {
      await definirNovaSenha(senha)
      setSucesso(true)
      setTimeout(() => navigate('/app', { replace: true }), 2000)
    } catch (err) {
      setErro(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="mx-auto flex min-h-[70svh] max-w-md flex-col justify-center px-5 py-16 sm:px-8">
      <h1 className="font-display text-3xl font-semibold text-indigo-800">Redefinir senha</h1>
      <p className="mt-2 text-graphite-500">Escolha uma nova senha para sua conta.</p>

      {sucesso ? (
        <div className="mt-8 rounded-2xl border border-signal-200 bg-signal-50 p-6 text-sm text-signal-800">
          ✅ Senha atualizada. Redirecionando para a plataforma…
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5 rounded-2xl border border-mist-300 bg-white p-8 shadow-card"
        >
          {erro && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}
          <div>
            <label className="text-sm font-semibold text-graphite-900">Nova senha</label>
            <input
              required
              minLength={6}
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="mt-2 w-full rounded-xl border border-mist-400 px-4 py-3 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-graphite-900">Confirmar nova senha</label>
            <input
              required
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className="mt-2 w-full rounded-xl border border-mist-400 px-4 py-3 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
              placeholder="Repita a senha"
            />
          </div>
          <Button as="button" type="submit" disabled={enviando} className="w-full justify-center">
            {enviando ? 'Salvando…' : 'Salvar nova senha'}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-graphite-500">
        <Link to="/login" className="font-semibold text-signal-700 hover:text-signal-800">
          Voltar para o login
        </Link>
      </p>
    </section>
  )
}
