import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from './supabase.js'
import { getPrimeiraEmpresa, criarEmpresa } from './empresa.js'
import { migrarRelatoriosLocais } from './migracao.js'
import { aceitarConvitesPendentes } from './membros.js'

const AuthContext = createContext(null)

export const TERMOS_VERSAO = 'v1-2026'

function mapErro(error) {
  const msg = error?.message || ''
  if (msg.includes('Invalid login credentials')) return 'E-mail ou senha inválidos.'
  if (msg.includes('User already registered')) return 'Já existe uma conta cadastrada com este e-mail.'
  if (msg.includes('Password should be at least')) return 'A senha precisa ter pelo menos 6 caracteres.'
  if (msg.includes('Unable to validate email')) return 'Digite um e-mail válido.'
  return msg || 'Não foi possível concluir. Tente novamente.'
}

// Garante conta + empresa para o usuário autenticado. Este código pode rodar duas vezes em
// paralelo — uma vez pela chamada explícita de login()/register() e outra pelo listener
// onAuthStateChange, que o Supabase dispara sozinho assim que a sessão é criada — por isso
// primeiro busca a conta existente, e só tenta criar (de forma segura contra a corrida) se
// realmente não existir ainda. Nunca sobrescreve nome/e-mail de uma conta já existente.
const CHAVE_ACEITE_PENDENTE = 'incluipro_aceite_termos_pendente'

// Quando a confirmação de e-mail está ativa no projeto Supabase, o cadastro ainda não tem
// sessão para gravar o aceite direto na tabela — guarda a intenção localmente e resgata aqui,
// no primeiro login que efetivamente cria a conta (mesmo navegador).
function resgatarAceitePendente(email) {
  try {
    const bruto = localStorage.getItem(CHAVE_ACEITE_PENDENTE)
    if (!bruto) return false
    const pendente = JSON.parse(bruto)
    localStorage.removeItem(CHAVE_ACEITE_PENDENTE)
    return pendente?.email === email
  } catch {
    return false
  }
}

async function garantirSessao(authUser, nomeSugerido, aceiteTermos) {
  let { data: conta } = await supabase.from('contas').select('*').eq('id', authUser.id).maybeSingle()

  if (!conta) {
    const payload = { id: authUser.id, nome: nomeSugerido || authUser.email, email: authUser.email, tipo: 'rh' }
    if (aceiteTermos || resgatarAceitePendente(authUser.email)) {
      payload.aceite_termos_em = new Date().toISOString()
      payload.aceite_termos_versao = TERMOS_VERSAO
    }
    // ignoreDuplicates faz o upsert virar "insere se não existir, senão não faz nada" — se outra
    // chamada concorrente venceu a corrida, esta não retorna linha (não é erro).
    const { data: inserida, error: erroInsercao } = await supabase
      .from('contas')
      .upsert(payload, { onConflict: 'id', ignoreDuplicates: true })
      .select()
      .maybeSingle()
    if (erroInsercao) throw erroInsercao
    conta = inserida
    if (!conta) {
      const { data: contaExistente, error: erroBusca } = await supabase
        .from('contas')
        .select('*')
        .eq('id', authUser.id)
        .single()
      if (erroBusca) throw erroBusca
      conta = contaExistente
    }
  }

  await aceitarConvitesPendentes(conta.id, conta.email).catch(() => {})

  let empresa = await getPrimeiraEmpresa(conta.id)
  if (!empresa) {
    empresa = await criarEmpresa({ contaId: conta.id, nome: nomeSugerido || conta.nome || conta.email })
  }

  return {
    id: conta.id,
    contaId: conta.id,
    empresaId: empresa.id,
    companyName: empresa.nome,
    email: conta.email,
    plan: conta.plano,
    papel: empresa.papel || 'admin',
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const montandoRef = useRef(false)

  async function montarComGuard(authUser, nomeSugerido, aceiteTermos) {
    if (montandoRef.current) return null
    montandoRef.current = true
    try {
      return await garantirSessao(authUser, nomeSugerido, aceiteTermos)
    } finally {
      montandoRef.current = false
    }
  }

  useEffect(() => {
    let ativo = true

    async function carregarSessaoInicial() {
      const { data } = await supabase.auth.getSession()
      const authUser = data?.session?.user
      if (!authUser) {
        if (ativo) setLoading(false)
        return
      }
      try {
        const sessao = await montarComGuard(authUser)
        if (ativo && sessao) setUser(sessao)
      } catch {
        if (ativo) setUser(null)
      } finally {
        if (ativo) setLoading(false)
      }
    }

    carregarSessaoInicial()

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
        return
      }
      if (event === 'PASSWORD_RECOVERY') {
        // A tela de redefinição de senha cuida do próprio fluxo; não monta sessão de app aqui.
        return
      }
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        try {
          const sessao = await montarComGuard(session.user)
          if (ativo && sessao) setUser(sessao)
        } catch {
          if (ativo) setUser(null)
        }
      }
    })

    return () => {
      ativo = false
      listener?.subscription?.unsubscribe()
    }
  }, [])

  async function register({ companyName, email, password, aceitouTermos }) {
    if (!aceitouTermos) {
      throw new Error('É necessário aceitar os Termos de Uso e a Política de Privacidade.')
    }

    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw new Error(mapErro(error))

    if (!data.session) {
      // Confirmação de e-mail exigida pelo projeto Supabase — sem sessão ainda para gravar o
      // aceite. Guarda a intenção localmente; garantirSessao resgata no primeiro login.
      try {
        localStorage.setItem(
          CHAVE_ACEITE_PENDENTE,
          JSON.stringify({ email, quando: new Date().toISOString(), versao: TERMOS_VERSAO }),
        )
      } catch {
        // localStorage indisponível — sem risco maior, só perde o atalho e o aceite não é pré-preenchido.
      }
      return { requiresEmailConfirmation: true }
    }

    const sessao = await montarComGuard(data.user, companyName, true)
    if (sessao) {
      setUser(sessao)
      migrarRelatoriosLocais(sessao.empresaId).catch(() => {})
      return sessao
    }
    // Outro caminho (listener) já montou a sessão nesse meio-tempo; devolve o que houver.
    return user
  }

  async function login({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(mapErro(error))

    const sessao = await montarComGuard(data.user)
    if (sessao) {
      setUser(sessao)
      migrarRelatoriosLocais(sessao.empresaId).catch(() => {})
      return sessao
    }
    return user
  }

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
  }

  async function solicitarRecuperacaoSenha(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    })
    if (error) throw new Error(mapErro(error))
  }

  async function definirNovaSenha(novaSenha) {
    const { error } = await supabase.auth.updateUser({ password: novaSenha })
    if (error) throw new Error(mapErro(error))
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, register, login, logout, solicitarRecuperacaoSenha, definirNovaSenha }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  return ctx
}
