import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { checkAccess } from '../lib/api.js'

const CACHE_KEY = 'incluipro_entitlement_cache'

function readCache(email) {
  try {
    const cache = JSON.parse(sessionStorage.getItem(CACHE_KEY)) || {}
    return cache[email] || null
  } catch {
    return null
  }
}

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
  const { user } = useAuth()
  const location = useLocation()
  const email = user?.email?.trim().toLowerCase()
  const [status, setStatus] = useState(() => (email ? readCache(email) : null))
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    if (!email) return
    const cached = readCache(email)
    if (cached) {
      setStatus(cached)
      return
    }
    let cancelado = false
    setStatus('verificando')
    checkAccess(email)
      .then((res) => {
        if (cancelado) return
        const resultado = res.liberado ? 'liberado' : 'bloqueado'
        writeCache(email, resultado)
        setStatus(resultado)
      })
      .catch(() => {
        if (!cancelado) setStatus('erro')
      })
    return () => {
      cancelado = true
    }
  }, [email, tentativa])

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
    return <Navigate to="/assinatura" replace state={{ from: location, semAcesso: true }} />
  }

  return children
}
