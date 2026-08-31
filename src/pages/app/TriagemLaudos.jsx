import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../lib/auth.jsx'
import { Button } from '../../components/ui/Button.jsx'
import {
  TIPOS_DOCUMENTO,
  getColaboradoresComDeficiencia,
  getDocumentos,
  uploadDocumento,
  removerDocumento,
  urlAssinadaDocumento,
} from '../../lib/documentos.js'
import { resumoTriagem } from '../../lib/triagemLaudos.js'

const NOVO_DOC_INICIAL = {
  tipo: 'laudo',
  dataEmissao: '',
  dataValidade: '',
  descreveBarreira: false,
  arquivo: null,
}

export function TriagemLaudos() {
  const { user } = useAuth()
  const [colaboradores, setColaboradores] = useState([])
  const [documentos, setDocumentos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [colaboradorAberto, setColaboradorAberto] = useState(null)
  const [novoDoc, setNovoDoc] = useState(NOVO_DOC_INICIAL)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  async function carregar() {
    if (!user?.empresaId) return
    setCarregando(true)
    try {
      const [cols, docs] = await Promise.all([
        getColaboradoresComDeficiencia(user.empresaId),
        getDocumentos(user.empresaId),
      ])
      setColaboradores(cols)
      setDocumentos(docs)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [user?.empresaId])

  const resumo = useMemo(() => resumoTriagem(colaboradores, documentos), [colaboradores, documentos])

  async function handleUpload(e, colaboradorId) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      const doc = await uploadDocumento({
        empresaId: user.empresaId,
        colaboradorId,
        tipo: novoDoc.tipo,
        arquivo: novoDoc.arquivo,
        dataEmissao: novoDoc.dataEmissao,
        dataValidade: novoDoc.dataValidade,
        descreveBarreira: novoDoc.descreveBarreira,
      })
      setDocumentos((d) => [...d, doc])
      setNovoDoc(NOVO_DOC_INICIAL)
    } catch {
      setErro('Não foi possível salvar o documento. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  async function handleRemover(documento) {
    if (!confirm('Remover este documento?')) return
    await removerDocumento(documento).catch(() => {})
    setDocumentos((d) => d.filter((x) => x.id !== documento.id))
  }

  async function handleAbrirArquivo(arquivoPath) {
    try {
      const url = await urlAssinadaDocumento(arquivoPath)
      window.open(url, '_blank', 'noopener')
    } catch {
      setErro('Não foi possível abrir o arquivo.')
    }
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-signal-600">Triagem documental</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-indigo-800">Laudos e comprovantes</h1>
        <p className="mt-2 max-w-2xl text-graphite-500">
          Repositório e checagem de consistência dos documentos que fundamentam o enquadramento na
          cota. Sinalização de indicativo de risco documental — não é parecer jurídico ou médico.
        </p>
      </div>

      <div className="mb-8 rounded-2xl border border-mist-300 bg-white p-6 shadow-card">
        <p className="font-display text-lg font-semibold text-indigo-800">
          {resumo.total} cadastrado{resumo.total === 1 ? '' : 's'} · {resumo.consistentes} com
          documentação consistente · {resumo.emRisco} em risco
        </p>
        <p className="mt-1 text-sm text-graphite-500">
          Indicativo de risco documental calculado a partir dos documentos cadastrados abaixo.
        </p>
      </div>

      {carregando ? (
        <p className="text-sm text-graphite-500">Carregando…</p>
      ) : colaboradores.length === 0 ? (
        <p className="text-sm text-graphite-500">
          Nenhum colaborador com deficiência cadastrado ainda. Cadastre relatórios em IncluiPro
          Avalia para que apareçam aqui.
        </p>
      ) : (
        <div className="space-y-4">
          {resumo.analisados.map(({ colaborador, emRisco, motivos }) => {
            const docsDoColaborador = documentos.filter((d) => d.colaborador_id === colaborador.id)
            const aberto = colaboradorAberto === colaborador.id
            return (
              <div key={colaborador.id} className="rounded-2xl border border-mist-300 bg-white shadow-card">
                <button
                  onClick={() => setColaboradorAberto(aberto ? null : colaborador.id)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
                >
                  <div>
                    <p className="font-semibold text-graphite-900">{colaborador.nome}</p>
                    <p className="text-sm text-graphite-500">{colaborador.tipo_deficiencia}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      emRisco ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {emRisco ? 'Em risco' : 'Consistente'}
                  </span>
                </button>

                {aberto && (
                  <div className="border-t border-mist-200 px-6 py-5">
                    {motivos.length > 0 && (
                      <ul className="mb-5 space-y-1 text-sm text-amber-800">
                        {motivos.map((m, i) => (
                          <li key={i}>• {m}</li>
                        ))}
                      </ul>
                    )}

                    {docsDoColaborador.length > 0 && (
                      <ul className="mb-5 space-y-2">
                        {docsDoColaborador.map((doc) => (
                          <li
                            key={doc.id}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-mist-200 bg-mist-100 px-4 py-2.5 text-sm"
                          >
                            <span>
                              <span className="font-semibold text-graphite-800">
                                {TIPOS_DOCUMENTO.find((t) => t.id === doc.tipo)?.label || doc.tipo}
                              </span>
                              {doc.data_validade && (
                                <span className="ml-2 text-graphite-500">válido até {doc.data_validade}</span>
                              )}
                            </span>
                            <span className="flex gap-3">
                              {doc.arquivo_path && (
                                <button
                                  onClick={() => handleAbrirArquivo(doc.arquivo_path)}
                                  className="font-semibold text-signal-600 hover:text-signal-700"
                                >
                                  Abrir arquivo
                                </button>
                              )}
                              <button
                                onClick={() => handleRemover(doc)}
                                className="font-semibold text-red-500 hover:text-red-700"
                              >
                                Remover
                              </button>
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <form
                      onSubmit={(e) => handleUpload(e, colaborador.id)}
                      className="grid gap-3 rounded-xl border border-dashed border-mist-400 p-4 sm:grid-cols-2"
                    >
                      <label className="text-sm">
                        <span className="font-semibold text-graphite-700">Tipo de documento</span>
                        <select
                          value={novoDoc.tipo}
                          onChange={(e) => setNovoDoc((d) => ({ ...d, tipo: e.target.value }))}
                          className="mt-1.5 w-full rounded-xl border border-mist-400 px-3 py-2 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
                        >
                          {TIPOS_DOCUMENTO.map((t) => (
                            <option key={t.id} value={t.id}>{t.label}</option>
                          ))}
                        </select>
                      </label>
                      <label className="text-sm">
                        <span className="font-semibold text-graphite-700">Arquivo (opcional)</span>
                        <input
                          type="file"
                          onChange={(e) => setNovoDoc((d) => ({ ...d, arquivo: e.target.files?.[0] || null }))}
                          className="mt-1.5 w-full text-sm"
                        />
                      </label>
                      <label className="text-sm">
                        <span className="font-semibold text-graphite-700">Data de emissão</span>
                        <input
                          type="date"
                          value={novoDoc.dataEmissao}
                          onChange={(e) => setNovoDoc((d) => ({ ...d, dataEmissao: e.target.value }))}
                          className="mt-1.5 w-full rounded-xl border border-mist-400 px-3 py-2 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
                        />
                      </label>
                      <label className="text-sm">
                        <span className="font-semibold text-graphite-700">Validade</span>
                        <input
                          type="date"
                          value={novoDoc.dataValidade}
                          onChange={(e) => setNovoDoc((d) => ({ ...d, dataValidade: e.target.value }))}
                          className="mt-1.5 w-full rounded-xl border border-mist-400 px-3 py-2 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
                        />
                      </label>
                      <label className="flex items-center gap-2 text-sm sm:col-span-2">
                        <input
                          type="checkbox"
                          checked={novoDoc.descreveBarreira}
                          onChange={(e) => setNovoDoc((d) => ({ ...d, descreveBarreira: e.target.checked }))}
                        />
                        <span className="text-graphite-700">O documento descreve a barreira funcional</span>
                      </label>
                      <div className="sm:col-span-2">
                        <Button as="button" type="submit" disabled={enviando}>
                          {enviando ? 'Salvando…' : 'Adicionar documento'}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {erro && <p className="mt-4 text-sm text-red-600">{erro}</p>}
    </div>
  )
}
