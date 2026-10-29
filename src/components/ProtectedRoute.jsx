import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { checkAccess, iniciarTeste } from '../lib/api.js'

const CACHE_KEY = 'incluipro_entitlement_cache'

function readCache(email) {
  try {
    const cache = JSON.parse(sessionStorage.getItem(CACHE_KEY)) || {}
    return cache[email] || null
  } catch {
    return null
  }
}

// Guarda { status, diasRestantes } por e-mail durante a sessão do navegador.
function writeCache(email, status) {
  try {
    const cache = JSON.parse(sessionStorage.getItem(CACHE_KEY)) || {}
    cache[email] = status
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // localStorage indisponível — segue sem cache
  }
}

// Além do login mockado (useAuth), exige que o e-mail tenha acesso liberado
// de verdade — via pagamento Hotmart confirmado ou liberação manual no
// painel administrativo (ver netlify/functions/access-check.mjs).
export function ProtectedRoute({ children }) {
  const { user, loading: sessaoCarregando } = useAuth()
  const location = useLocation()
  const email = user?.email?.trim().toLowerCase()
  const [acesso, setAcesso] = useState(() => (email ? readCache(email) : null))
  const status = acesso?.status ?? null
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    if (!email) return
    const cached = readCache(email)
    if (cached?.status) {
      setAcesso(cached)
      return
    }
    let cancelado = false
    setAcesso({ status: 'verificando' })
    checkAccess(email)
      // Quem nunca testou nem assinou ganha o teste grátis automaticamente no primeiro acesso.
      .then((res) => (!res.liberado && res.podeTestar ? iniciarTeste(email, user?.companyName) : res))
      .then((res) => {
        if (cancelado) return
        const resultado = res.liberado
          ? { status: 'liberado', diasRestantes: res.diasRestantes ?? null }
          : { status: 'bloqueado', testeExpirado: Boolean(res.testeExpirado) }
        writeCache(email, resultado)
        setAcesso(resultado)
      })
      .catch(() => {
        if (!cancelado) setAcesso({ status: 'erro' })
      })
    return () => {
      cancelado = true
    }
  }, [email, tentativa])

  if (sessaoCarregando) {
    return (
      <div className="flex min-h-[60svh] items-center justify-center px-5 text-center">
        <p className="text-sm text-graphite-500">Carregando sua sessão…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (status === 'verificando' || status === null) {
    return (
      <div className="flex min-h-[60svh] items-center justify-center px-5 text-center">
        <p className="text-sm text-graphite-500">Verificando seu acesso…</p>
      </div>
    )
  }

  if (status === 'erro') {
    return (
      <div className="mx-auto flex min-h-[60svh] max-w-md flex-col items-center justify-center px-5 text-center">
        <p className="font-display text-xl font-semibold text-indigo-800">
          Não foi possível verificar seu acesso
        </p>
        <p className="mt-2 text-sm text-graphite-500">
          Tente novamente em instantes ou fale com a gente em{' '}
          <a href="mailto:contato@incluipro.com" className="font-semibold text-signal-700">
            contato@incluipro.com
          </a>
          .
        </p>
        <button
          onClick={() => setTentativa((t) => t + 1)}
          className="mt-4 rounded-full border border-mist-400 px-5 py-2 text-sm font-semibold text-indigo-700 hover:border-signal-400"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  if (status === 'bloqueado') {
    return <Navigate to="/assinatura" replace state={{ from: location, semAcesso: true, testeExpirado: acesso.testeExpirado }} />
  }

  if (acesso.diasRestantes != null) {
    const dias = acesso.diasRestantes
    return (
      <>
        <div className="bg-volt-700 px-5 py-2 text-center text-sm text-white">
          Teste grátis: {dias <= 1 ? 'último dia' : `faltam ${dias} dias`}.{' '}
          <Link to="/assinatura" className="font-semibold underline underline-offset-2">
            Assinar com condição de Fundador
          </Link>
        </div>
        {children}
      </>
    )
  }

  return children
}
