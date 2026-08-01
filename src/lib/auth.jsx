import { createContext, useContext, useEffect, useState } from 'react'

// TODO: substituir por autenticação real (ex: Supabase Auth, Firebase Auth ou backend próprio).
// Por enquanto, empresas e sessão são simuladas inteiramente em localStorage.

const ACCOUNTS_KEY = 'incluipro_accounts'
const SESSION_KEY = 'incluipro_session'

function readAccounts() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || []
  } catch {
    return []
  }
}

function writeAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY))
  } catch {
    return null
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readSession())

  useEffect(() => {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(SESSION_KEY)
    }
  }, [user])

  function register({ companyName, email, password, employees }) {
    const accounts = readAccounts()
    if (accounts.some((a) => a.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Já existe uma conta cadastrada com este e-mail.')
    }
    const account = {
      id: crypto.randomUUID(),
      companyName,
      email,
      password, // TODO: nunca armazenar senha em texto puro em produção — usar backend com hashing
      employees: employees || '',
      plan: 'Mensal · IncluiPro Avalia + IncluiPro Lidera',
      createdAt: new Date().toISOString(),
    }
    writeAccounts([...accounts, account])
    const session = { id: account.id, companyName, email, plan: account.plan }
    setUser(session)
    return session
  }

  function login({ email, password }) {
    const accounts = readAccounts()
    const account = accounts.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password,
    )
    if (!account) {
      throw new Error('E-mail ou senha inválidos.')
    }
    const session = {
      id: account.id,
      companyName: account.companyName,
      email: account.email,
      plan: account.plan,
    }
    setUser(session)
    return session
  }

  function logout() {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  return ctx
}
