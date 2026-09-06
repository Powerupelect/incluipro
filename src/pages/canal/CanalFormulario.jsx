import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getEmpresaPorSlug, TIPOS_CANAL } from '../../lib/canalColaborador.js'
import { enviarSolicitacaoCanal } from '../../lib/api.js'

const CAMPOS_INICIAIS = { nomeInformado: '', tipo: '', descricao: '', site: '' }

export function CanalFormulario() {
  const { slug } = useParams()
  const [empresa, setEmpresa] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [naoEncontrada, setNaoEncontrada] = useState(false)
  const [form, setForm] = useState(CAMPOS_INICIAIS)
  const [erros, setErros] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [erroEnvio, setErroEnvio] = useState('')
  const [protocolo, setProtocolo] = useState(null)
  const erroRef = useRef(null)

  useEffect(() => {
    let ativo = true
    getEmpresaPorSlug(slug)
      .then((dados) => {
        if (!ativo) return
        if (!dados) setNaoEncontrada(true)
        else setEmpresa(dados)
      })
      .catch(() => {
        if (ativo) setNaoEncontrada(true)
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })
    return () => {
      ativo = false
    }
  }, [slug])

  useEffect(() => {
    if (Object.keys(erros).length > 0 && erroRef.current) {
      erroRef.current.focus()
    }
  }, [erros])

  function update(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  function validar() {
    const proximosErros = {}
    if (!form.nomeInformado.trim()) proximosErros.nomeInformado = 'Informe o nome completo.'
    if (!form.tipo) proximosErros.tipo = 'Selecione o tipo de solicitação.'
    if (!form.descricao.trim()) proximosErros.descricao = 'Descreva o pedido.'
    else if (form.descricao.length > 1000) proximosErros.descricao = 'A descrição pode ter no máximo 1000 caracteres.'
    return proximosErros
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const proximosErros = validar()
    setErros(proximosErros)
    if (Object.keys(proximosErros).length > 0) return

    setErroEnvio('')
    setEnviando(true)
    try {
      const resposta = await enviarSolicitacaoCanal({
        slug,
        nomeInformado: form.nomeInformado.trim(),
        tipo: form.tipo,
        descricao: form.descricao.trim(),
        site: form.site,
      })
      if (resposta?.enviado) {
        setProtocolo(resposta.protocolo)
      } else {
        setErroEnvio(resposta?.motivo || 'Não foi possível enviar sua solicitação agora. Tente novamente.')
      }
    } catch (err) {
      setErroEnvio(err.message || 'Não foi possível enviar sua solicitação agora. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  if (carregando) {
    return (
      <main className="mx-auto max-w-xl px-5 py-16 text-center">
        <p className="text-graphite-500">Carregando…</p>
      </main>
    )
  }

  if (naoEncontrada) {
    return (
      <main className="mx-auto max-w-xl px-5 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold text-indigo-900">Link não encontrado</h1>
        <p className="mt-3 text-graphite-600">
          Este link de solicitações não existe ou não está mais ativo. Confira o endereço com o RH
          da sua empresa.
        </p>
      </main>
    )
  }

  if (protocolo) {
    return (
      <main className="mx-auto max-w-xl px-5 py-16">
        <div className="rounded-lg border border-signal-200 bg-signal-50 p-8 text-center">
          <h1 className="font-display text-2xl font-semibold text-indigo-900">Solicitação enviada</h1>
          <p className="mt-3 text-graphite-700">
            Guarde o código abaixo para consultar o andamento do seu pedido.
          </p>
          <p className="mt-5 font-display text-3xl font-semibold tracking-wide text-signal-700">
            {protocolo}
          </p>
          <Link
            to={`/solicitar/${slug}/consultar`}
            className="mt-6 inline-block text-sm font-semibold text-indigo-700 underline hover:text-signal-700"
          >
            Consultar andamento
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-xl px-5 py-12 sm:py-16">
      <header>
        <p className="font-display text-2xl font-semibold text-indigo-900 sm:text-3xl">
          {empresa.nome}
        </p>
        <p className="mt-1 text-base text-graphite-700">Canal de solicitações de acessibilidade</p>
        <p className="mt-4 max-w-prose text-sm leading-relaxed text-graphite-600">
          Use este canal para solicitar recursos, adaptações ou apoio relacionados à
          acessibilidade no seu ambiente de trabalho.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-6">
        {/* Campo-armadilha para robôs — invisível e fora da navegação por teclado/leitor de tela. */}
        <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', top: 'auto' }}>
          <label htmlFor="site">Não preencha este campo</label>
          <input
            id="site"
            name="site"
            tabIndex={-1}
            autoComplete="off"
            value={form.site}
            onChange={(e) => update('site', e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="nomeInformado" className="block text-base font-semibold text-graphite-900">
            Nome completo
          </label>
          <input
            id="nomeInformado"
            required
            value={form.nomeInformado}
            onChange={(e) => update('nomeInformado', e.target.value)}
            aria-invalid={Boolean(erros.nomeInformado)}
            aria-describedby={erros.nomeInformado ? 'erro-nomeInformado' : undefined}
            className={`mt-2 min-h-[44px] w-full rounded-md border px-4 py-3 text-base outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100 ${
              erros.nomeInformado ? 'border-red-500' : 'border-mist-400'
            }`}
          />
          {erros.nomeInformado && (
            <p id="erro-nomeInformado" role="alert" className="mt-1.5 text-sm text-red-600">
              {erros.nomeInformado}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="tipo" className="block text-base font-semibold text-graphite-900">
            Tipo de solicitação
          </label>
          <select
            id="tipo"
            required
            value={form.tipo}
            onChange={(e) => update('tipo', e.target.value)}
            aria-invalid={Boolean(erros.tipo)}
            aria-describedby={erros.tipo ? 'erro-tipo' : undefined}
            className={`mt-2 min-h-[44px] w-full rounded-md border bg-white px-4 py-3 text-base outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100 ${
              erros.tipo ? 'border-red-500' : 'border-mist-400'
            }`}
          >
            <option value="">Selecione…</option>
            {TIPOS_CANAL.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
          {erros.tipo && (
            <p id="erro-tipo" role="alert" className="mt-1.5 text-sm text-red-600">
              {erros.tipo}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="descricao" className="block text-base font-semibold text-graphite-900">
            Descrição do pedido
          </label>
          <textarea
            id="descricao"
            required
            rows={5}
            maxLength={1000}
            value={form.descricao}
            onChange={(e) => update('descricao', e.target.value)}
            aria-invalid={Boolean(erros.descricao)}
            aria-describedby={erros.descricao ? 'erro-descricao' : 'ajuda-descricao'}
            className={`mt-2 w-full rounded-md border px-4 py-3 text-base outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100 ${
              erros.descricao ? 'border-red-500' : 'border-mist-400'
            }`}
          />
          <p id="ajuda-descricao" className="mt-1.5 text-sm text-graphite-500">
            {form.descricao.length}/1000 caracteres
          </p>
          {erros.descricao && (
            <p id="erro-descricao" role="alert" className="mt-1.5 text-sm text-red-600">
              {erros.descricao}
            </p>
          )}
        </div>

        <p className="text-sm leading-relaxed text-graphite-500">
          As informações enviadas serão tratadas pela {empresa.nome} com a finalidade de avaliar e
          providenciar a adaptação solicitada. Descreva apenas o que for necessário para o
          atendimento do pedido.
        </p>

        {erroEnvio && (
          <p ref={erroRef} tabIndex={-1} role="alert" className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {erroEnvio}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="min-h-[44px] w-full rounded-md bg-signal-600 px-6 py-3 text-base font-semibold text-white hover:bg-signal-700 disabled:opacity-60"
        >
          {enviando ? 'Enviando…' : 'Enviar solicitação'}
        </button>
      </form>

      <footer className="mt-10 text-center text-xs text-graphite-300">
        Canal fornecido por IncluiPro
      </footer>
    </main>
  )
}
