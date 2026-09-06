import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { consultarProtocolo, getEmpresaPorSlug, STATUS_CANAL_LABEL } from '../../lib/canalColaborador.js'

export function CanalConsulta() {
  const { slug } = useParams()
  const [empresa, setEmpresa] = useState(null)
  const [protocoloDigitado, setProtocoloDigitado] = useState('')
  const [resultado, setResultado] = useState(null)
  const [erro, setErro] = useState('')
  const [consultando, setConsultando] = useState(false)

  useEffect(() => {
    let ativo = true
    getEmpresaPorSlug(slug).then((dados) => {
      if (ativo) setEmpresa(dados)
    })
    return () => {
      ativo = false
    }
  }, [slug])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!protocoloDigitado.trim()) {
      setErro('Informe o código do protocolo.')
      setResultado(null)
      return
    }
    setErro('')
    setResultado(null)
    setConsultando(true)
    try {
      const dados = await consultarProtocolo(protocoloDigitado)
      if (!dados) {
        setErro('Protocolo não encontrado. Confira o código e tente novamente.')
      } else {
        setResultado(dados)
      }
    } catch {
      setErro('Não foi possível consultar agora. Tente novamente em instantes.')
    } finally {
      setConsultando(false)
    }
  }

  return (
    <main className="mx-auto max-w-xl px-5 py-12 sm:py-16">
      <header>
        <p className="font-display text-2xl font-semibold text-indigo-900 sm:text-3xl">
          {empresa?.nome || 'Consultar solicitação'}
        </p>
        <p className="mt-1 text-base text-graphite-700">Consultar andamento da solicitação</p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-6">
        <div>
          <label htmlFor="protocolo" className="block text-base font-semibold text-graphite-900">
            Código do protocolo
          </label>
          <input
            id="protocolo"
            required
            placeholder="SOL-2026-0147"
            value={protocoloDigitado}
            onChange={(e) => setProtocoloDigitado(e.target.value)}
            aria-invalid={Boolean(erro)}
            aria-describedby={erro ? 'erro-protocolo' : undefined}
            className={`mt-2 min-h-[44px] w-full rounded-md border px-4 py-3 text-base outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100 ${
              erro ? 'border-red-500' : 'border-mist-400'
            }`}
          />
          {erro && (
            <p id="erro-protocolo" role="alert" className="mt-1.5 text-sm text-red-600">
              {erro}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={consultando}
          className="min-h-[44px] w-full rounded-md bg-signal-600 px-6 py-3 text-base font-semibold text-white hover:bg-signal-700 disabled:opacity-60"
        >
          {consultando ? 'Consultando…' : 'Consultar'}
        </button>
      </form>

      {resultado && (
        <div role="status" className="mt-6 rounded-lg border border-mist-300 bg-white p-6">
          <p className="text-sm text-graphite-500">Status atual</p>
          <p className="mt-1 font-display text-xl font-semibold text-indigo-900">
            {STATUS_CANAL_LABEL[resultado.status] || resultado.status}
          </p>
          <p className="mt-3 text-sm text-graphite-500">
            Última atualização em {new Date(resultado.atualizada_em).toLocaleDateString('pt-BR')}
          </p>
        </div>
      )}

      <footer className="mt-10 text-center text-xs text-graphite-300">
        Canal fornecido por IncluiPro
      </footer>
    </main>
  )
}
