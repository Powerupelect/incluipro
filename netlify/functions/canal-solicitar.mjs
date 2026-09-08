// Recebe o envio do formulário público do Canal de Solicitações do Colaborador
// (sem login). Passa por aqui em vez de gravar direto do navegador para que o
// limite de envios por IP seja real — se o navegador gravasse direto no Supabase,
// esse limite poderia ser contornado só chamando a API do Supabase diretamente.

import { createClient } from '@supabase/supabase-js'
import { getStore } from '@netlify/blobs'

export const config = { path: '/api/canal-solicitar' }

const LIMITE_POR_HORA = 3
const ALFABETO_SUFIXO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

function gerarSufixoProtocolo(tamanho) {
  let s = ''
  for (let i = 0; i < tamanho; i++) {
    s += ALFABETO_SUFIXO[Math.floor(Math.random() * ALFABETO_SUFIXO.length)]
  }
  return s
}

function clienteSupabase() {
  const url = process.env.VITE_SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !anonKey) throw new Error('Supabase não configurado no ambiente da função.')
  return createClient(url, anonKey)
}

async function verificarLimite(ip) {
  const store = getStore('incluipro-canal-rate-limit')
  const chave = ip || 'sem-ip'
  const agora = Date.now()
  const registro = (await store.get(chave, { type: 'json' })) || { contagem: 0, inicioJanela: agora }
  const dentroDaJanela = agora - registro.inicioJanela < 60 * 60 * 1000
  const contagemAtual = dentroDaJanela ? registro.contagem : 0
  if (contagemAtual >= LIMITE_POR_HORA) return false
  await store.setJSON(chave, {
    contagem: contagemAtual + 1,
    inicioJanela: dentroDaJanela ? registro.inicioJanela : agora,
  })
  return true
}

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  let body
  try {
    body = await req.json()
  } catch {
    return new Response('JSON inválido', { status: 400 })
  }

  // Honeypot: campo invisível para humanos. Se vier preenchido, é robô — responde
  // como se tivesse dado certo, sem gravar nada, para não ensinar o robô a se adaptar.
  if (String(body?.site || '').trim()) {
    return Response.json({ enviado: true, protocolo: `SOL-${new Date().getFullYear()}-${gerarSufixoProtocolo(4)}` })
  }

  const slug = String(body?.slug || '').trim().toLowerCase()
  const nomeInformado = String(body?.nomeInformado || '').trim().slice(0, 200)
  const tipo = String(body?.tipo || '').trim()
  const descricao = String(body?.descricao || '').trim().slice(0, 1000)

  if (!slug || !nomeInformado || !tipo || !descricao) {
    return Response.json({ enviado: false, motivo: 'Preencha todos os campos do formulário.' }, { status: 400 })
  }

  const ip = req.headers.get('x-nf-client-connection-ip') || req.headers.get('x-forwarded-for') || ''
  const podeEnviar = await verificarLimite(ip.split(',')[0].trim())
  if (!podeEnviar) {
    return Response.json(
      { enviado: false, motivo: 'Muitas solicitações enviadas deste endereço. Tente novamente mais tarde.' },
      { status: 429 },
    )
  }

  try {
    const supabase = clienteSupabase()

    const { data: empresas, error: erroEmpresa } = await supabase.rpc('empresa_por_slug', { p_slug: slug })
    if (erroEmpresa) throw erroEmpresa
    const empresa = empresas?.[0]
    if (!empresa) {
      return Response.json({ enviado: false, motivo: 'Link inválido — confira com o RH da sua empresa.' }, { status: 404 })
    }

    const ano = new Date().getFullYear()
    let protocolo = null
    let ultimoErro = null
    for (let tentativa = 0; tentativa < 5 && !protocolo; tentativa++) {
      const candidato = `SOL-${ano}-${gerarSufixoProtocolo(4)}`
      const { error } = await supabase.from('solicitacoes_canal').insert({
        empresa_id: empresa.id,
        protocolo: candidato,
        nome_informado: nomeInformado,
        tipo,
        descricao,
      })
      if (!error) {
        protocolo = candidato
      } else if (error.code === '23505') {
        ultimoErro = error
      } else {
        throw error
      }
    }
    if (!protocolo) throw ultimoErro || new Error('Não foi possível gerar um protocolo único.')

    return Response.json({ enviado: true, protocolo })
  } catch (err) {
    return Response.json({ enviado: false, motivo: String(err?.message || err) }, { status: 500 })
  }
}
