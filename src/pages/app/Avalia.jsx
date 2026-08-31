import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { Button } from '../../components/ui/Button.jsx'
import { montarRelatorio } from '../../lib/montarRelatorio.js'
import { identificarCategoria } from '../../lib/accessibilityResources.js'
import { ConsultaRapida } from '../../components/ConsultaRapida.jsx'
import {
  getReports,
  saveReport,
  deleteReport,
  updateReport,
  registrarRevisaoConfirmada,
} from '../../lib/reports.js'
import { baixarRelatorioPDF } from '../../lib/pdf.js'
import { useAuth } from '../../lib/auth.jsx'
import { getSugestaoRedacao } from '../../lib/sugestoesRedacao.js'

const CAMPOS_ESSENCIAIS = [
  { key: 'nome', label: 'Nome do candidato' },
  { key: 'tipoDeficiencia', label: 'Tipo de deficiência' },
  { key: 'necessidades', label: 'Necessidades específicas no trabalho' },
  { key: 'observacoesErgonomicas', label: 'Observações ergonômicas/ambientais' },
]

const blocos = [
  {
    titulo: 'Identificação',
    icone: (
      <>
        <path d="M4 5h16v14H4z" />
        <circle cx="9" cy="10" r="2" />
        <path d="M6 16.5c.6-1.6 1.8-2.5 3-2.5s2.4.9 3 2.5M14 9h4M14 13h4" />
      </>
    ),
    campos: [
      { key: 'nome', label: 'Nome do candidato', type: 'text' },
      { key: 'cargo', label: 'Cargo pretendido', type: 'text' },
      { key: 'empresa', label: 'Empresa', type: 'text' },
    ],
  },
  {
    titulo: 'Deficiência',
    icone: (
      <path d="M12 21s-7-4.5-9.5-9C1 8.5 2.5 5 6 5c2 0 3.5 1.3 4 2 .5-.7 2-2 4-2 3.5 0 5 3.5 3.5 7-2.5 4.5-9.5 9-9.5 9z" />
    ),
    campos: [
      { key: 'tipoDeficiencia', label: 'Tipo de deficiência', type: 'text' },
      { key: 'observacoesCondicao', label: 'Observações sobre a condição', type: 'textarea' },
    ],
  },
  {
    titulo: 'Rotina e autonomia',
    icone: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </>
    ),
    campos: [
      {
        key: 'rotina',
        label: 'Como o candidato descreve sua rotina e nível de autonomia no dia a dia',
        type: 'textarea',
      },
    ],
  },
  {
    titulo: 'Histórico profissional',
    icone: (
      <>
        <path d="M4 8h16v11H4z" />
        <path d="M9 8V6a2 2 0 012-2h2a2 2 0 012 2v2" />
      </>
    ),
    campos: [
      { key: 'historico', label: 'Experiências anteriores relevantes', type: 'textarea' },
    ],
  },
  {
    titulo: 'Necessidades específicas no trabalho',
    icone: (
      <>
        <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h14" strokeLinecap="round" />
        <circle cx="16" cy="6" r="2" />
        <circle cx="8" cy="12" r="2" />
        <circle cx="18" cy="18" r="2" />
      </>
    ),
    campos: [
      {
        key: 'necessidades',
        label: 'Adaptações, apoios ou recursos necessários no ambiente de trabalho',
        type: 'textarea',
      },
    ],
  },
  {
    titulo: 'Expectativas do candidato',
    icone: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="0.6" fill="currentColor" />
      </>
    ),
    campos: [
      { key: 'expectativas', label: 'O que o candidato espera da vaga e da empresa', type: 'textarea' },
    ],
  },
  {
    titulo: 'Observações ergonômicas/ambientais',
    icone: (
      <>
        <path d="M4 21V9l8-5 8 5v12" />
        <path d="M9 21v-6h6v6" />
      </>
    ),
    campos: [
      {
        key: 'observacoesErgonomicas',
        label: 'Acessibilidade física, mobiliário, iluminação, ruído, etc.',
        type: 'textarea',
      },
    ],
  },
  {
    titulo: 'Notas livres',
    icone: (
      <>
        <path d="M4 20h4l10-10-4-4L4 16v4z" />
        <path d="M13.5 6.5l4 4" />
      </>
    ),
    campos: [{ key: 'notasLivres', label: 'Outras observações do avaliador', type: 'textarea' }],
  },
]

const TOTAL_CAMPOS = blocos.reduce((soma, b) => soma + b.campos.length, 0)

const initialForm = {
  nome: '',
  cargo: '',
  empresa: '',
  tipoDeficiencia: '',
  observacoesCondicao: '',
  rotina: '',
  historico: '',
  necessidades: '',
  expectativas: '',
  observacoesErgonomicas: '',
  notasLivres: '',
}

function reportToPdfPayload(fields) {
  return {
    nome: fields.candidato || fields.nome || '',
    cargo: fields.cargo || '',
    empresa: fields.empresa || '',
    tipoDeficiencia: fields.tipoDeficiencia || '',
    observacoesCondicao: fields.observacoesCondicao || '',
    relatorioMarkdown: fields.conteudo || fields.relatorio || '',
  }
}

export function Avalia() {
  const { user } = useAuth()
  const empresaId = user?.empresaId
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [relatorio, setRelatorio] = useState('')
  const [currentReportId, setCurrentReportId] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [editDraft, setEditDraft] = useState('')
  const [copiado, setCopiado] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [historico, setHistorico] = useState([])
  const [historicoCarregando, setHistoricoCarregando] = useState(true)
  const [busca, setBusca] = useState('')

  useEffect(() => {
    if (!empresaId) return
    let ativo = true
    setHistoricoCarregando(true)
    getReports(empresaId)
      .then((relatorios) => {
        if (ativo) setHistorico(relatorios)
      })
      .catch(() => {
        if (ativo) setError('Não foi possível carregar seus relatórios agora.')
      })
      .finally(() => {
        if (ativo) setHistoricoCarregando(false)
      })
    return () => {
      ativo = false
    }
  }, [empresaId])

  const [recursosSugeridos, setRecursosSugeridos] = useState([])
  const [categoriaAtiva, setCategoriaAtiva] = useState(null)
  const [painelAberto, setPainelAberto] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [colaboradorIdParaSalvar, setColaboradorIdParaSalvar] = useState(null)
  const [revisaoModal, setRevisaoModal] = useState(null) // { colaboradorId, nome } | null
  const [revisaoSalvando, setRevisaoSalvando] = useState(false)

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
    if (key === 'tipoDeficiencia') {
      const categoria = identificarCategoria(value)
      if (categoria && categoria !== categoriaAtiva) {
        setCategoriaAtiva(categoria)
        setPainelAberto(true)
      }
    }
  }

  function handleToggleRecurso(recurso) {
    setRecursosSugeridos((atual) =>
      atual.includes(recurso) ? atual.filter((r) => r !== recurso) : [...atual, recurso],
    )
  }

  async function handleGerar() {
    if (!form.nome.trim()) {
      setError('Informe ao menos o nome do candidato para gerar o relatório.')
      return
    }
    if (!empresaId) {
      setError('Não foi possível identificar sua empresa. Recarregue a página e tente novamente.')
      return
    }
    const faltando = CAMPOS_ESSENCIAIS.filter((c) => !form[c.key]?.trim())
    if (faltando.length > 0) {
      const prosseguir = confirm(
        `Alguns campos essenciais ainda estão vazios: ${faltando.map((c) => c.label).join(', ')}.\n\nGerar o relatório mesmo assim?`,
      )
      if (!prosseguir) return
    }
    setError('')
    const texto = montarRelatorio({ ...form, recursosSugeridos })
    setRelatorio(texto)
    setEditMode(false)
    try {
      const saved = await saveReport(
        {
          candidato: form.nome || 'Candidato sem nome',
          cargo: form.cargo,
          tipoDeficiencia: form.tipoDeficiencia,
          observacoesCondicao: form.observacoesCondicao,
          rotina: form.rotina,
          historico: form.historico,
          necessidades: form.necessidades,
          expectativas: form.expectativas,
          observacoesErgonomicas: form.observacoesErgonomicas,
          notasLivres: form.notasLivres,
          recursosSugeridos,
          conteudo: texto,
        },
        empresaId,
        colaboradorIdParaSalvar,
      )
      setCurrentReportId(saved.id)
      setColaboradorIdParaSalvar(null)
      setHistorico((h) => [saved, ...h])
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setSucesso(true)
      setTimeout(() => setSucesso(false), 4000)
    } catch {
      setError('Não foi possível salvar o relatório agora. Tente novamente.')
    }
  }

  function handleNovoRelatorio() {
    setForm(initialForm)
    setRelatorio('')
    setCurrentReportId(null)
    setColaboradorIdParaSalvar(null)
    setEditMode(false)
    setEditDraft('')
    setRecursosSugeridos([])
    setCategoriaAtiva(null)
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /** Pré-preenche o formulário a partir de um relatório anterior — usado tanto para
   * "revisão anual com alteração" (reaproveita o mesmo colaborador) quanto para "duplicar"
   * (cria um colaborador novo a partir do modelo). */
  function preencherFormularioApartirDe(item, { reaproveitarColaborador }) {
    setForm({
      ...initialForm,
      nome: item.candidato,
      cargo: item.cargo || '',
      tipoDeficiencia: item.tipoDeficiencia || '',
      observacoesCondicao: item.observacoesCondicao || '',
      rotina: item.rotina || '',
      historico: item.historico || '',
      necessidades: item.necessidades || '',
      expectativas: item.expectativas || '',
      observacoesErgonomicas: item.observacoesErgonomicas || '',
      notasLivres: item.notasLivres || '',
    })
    setRecursosSugeridos(item.recursosSugeridos || [])
    setCategoriaAtiva(identificarCategoria(item.tipoDeficiencia || ''))
    setRelatorio('')
    setCurrentReportId(null)
    setColaboradorIdParaSalvar(reaproveitarColaborador ? item.colaboradorId : null)
    setEditMode(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleDuplicar(item) {
    preencherFormularioApartirDe(item, { reaproveitarColaborador: false })
  }

  function handleIniciarRevisao(item) {
    setRevisaoModal({ colaboradorId: item.colaboradorId, nome: item.candidato, item })
  }

  function handleRevisaoComAlteracao() {
    if (!revisaoModal) return
    preencherFormularioApartirDe(revisaoModal.item, { reaproveitarColaborador: true })
    setRevisaoModal(null)
  }

  async function handleRevisaoSemAlteracao() {
    if (!revisaoModal || !empresaId) return
    setRevisaoSalvando(true)
    try {
      const registrada = await registrarRevisaoConfirmada({
        colaboradorId: revisaoModal.colaboradorId,
        empresaId,
      })
      setHistorico((h) => [registrada, ...h])
      setRevisaoModal(null)
    } catch {
      setError('Não foi possível registrar a revisão agora. Tente novamente.')
    } finally {
      setRevisaoSalvando(false)
    }
  }

  function handleInserirSugestao(campo) {
    const sugestao = getSugestaoRedacao(categoriaAtiva, campo)
    if (!sugestao) return
    setForm((f) => ({
      ...f,
      [campo]: f[campo]?.trim() ? `${f[campo]}\n${sugestao}` : sugestao,
    }))
  }

  function handleCopiar() {
    navigator.clipboard.writeText(relatorio)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  function handleEditar() {
    setEditDraft(relatorio)
    setEditMode(true)
  }

  async function handleSalvarEdicao() {
    setRelatorio(editDraft)
    setEditMode(false)
    if (currentReportId) {
      try {
        const updated = await updateReport(currentReportId, {
          conteudo: editDraft,
          candidato: form.nome || 'Candidato sem nome',
          cargo: form.cargo,
          tipoDeficiencia: form.tipoDeficiencia,
          observacoesCondicao: form.observacoesCondicao,
          recursosSugeridos,
        })
        setHistorico((h) => h.map((r) => (r.id === updated.id ? updated : r)))
      } catch {
        setError('Não foi possível salvar a edição agora. Tente novamente.')
        return
      }
    }
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2000)
  }

  function handleBaixarPdf() {
    baixarRelatorioPDF(
      reportToPdfPayload({
        candidato: form.nome,
        cargo: form.cargo,
        empresa: form.empresa,
        tipoDeficiencia: form.tipoDeficiencia,
        observacoesCondicao: form.observacoesCondicao,
        conteudo: relatorio,
      }),
    )
  }

  function handleAbrirHistorico(item, entrarEmEdicao = false) {
    setForm((f) => ({
      ...f,
      nome: item.candidato,
      cargo: item.cargo || '',
      tipoDeficiencia: item.tipoDeficiencia || '',
      observacoesCondicao: item.observacoesCondicao || '',
      rotina: item.rotina || '',
      historico: item.historico || '',
      necessidades: item.necessidades || '',
      expectativas: item.expectativas || '',
      observacoesErgonomicas: item.observacoesErgonomicas || '',
      notasLivres: item.notasLivres || '',
    }))
    setRecursosSugeridos(item.recursosSugeridos || [])
    setCategoriaAtiva(identificarCategoria(item.tipoDeficiencia || ''))
    setRelatorio(item.conteudo)
    setCurrentReportId(item.id)
    if (entrarEmEdicao) {
      setEditDraft(item.conteudo)
      setEditMode(true)
    } else {
      setEditMode(false)
    }
  }

  function handleBaixarHistoricoPdf(item) {
    baixarRelatorioPDF(reportToPdfPayload(item))
  }

  async function handleExcluirHistorico(id) {
    if (!confirm('Excluir este relatório do histórico? Esta ação não pode ser desfeita.')) return
    try {
      await deleteReport(id)
    } catch {
      setError('Não foi possível excluir o relatório agora. Tente novamente.')
      return
    }
    setHistorico((h) => h.filter((r) => r.id !== id))
    if (currentReportId === id) {
      setRelatorio('')
      setCurrentReportId(null)
      setEditMode(false)
    }
  }

  const camposPreenchidos = useMemo(
    () => blocos.reduce((soma, b) => soma + b.campos.filter((c) => form[c.key]?.trim()).length, 0),
    [form],
  )
  const progresso = Math.round((camposPreenchidos / TOTAL_CAMPOS) * 100)

  const historicoFiltrado = useMemo(() => {
    const q = busca.trim().toLowerCase()
    if (!q) return historico
    return historico.filter(
      (r) =>
        (r.candidato || '').toLowerCase().includes(q) ||
        (r.cargo || '').toLowerCase().includes(q),
    )
  }, [historico, busca])

  return (
    <div>
      {sucesso && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-signal-200 bg-signal-50 px-5 py-4 text-sm font-semibold text-signal-800">
          ✅ Relatório gerado com sucesso! Veja o resultado ao lado, edite se precisar e baixe o PDF.
        </div>
      )}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-signal-600">
            IncluiPro Avalia
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-indigo-800">
            Novo Relatório Técnico de Inclusão
          </h1>
          <p className="mt-2 max-w-2xl text-graphite-500">
            Preencha as anotações da entrevista por blocos e monte o relatório estruturado com a
            metodologia IncluiPro — consulte recursos e ajustes sugeridos por tipo de deficiência e
            edite o texto livremente antes de baixar o PDF.
          </p>
        </div>
        <button
          onClick={() => setPainelAberto(true)}
          className="shrink-0 rounded-full border border-volt-400 bg-volt-50 px-4 py-2.5 text-sm font-semibold text-volt-700 hover:border-volt-500 hover:bg-volt-100"
        >
          🔎 Consulta Rápida de Recursos
        </button>
      </div>

      <div className="mb-8 rounded-2xl border border-mist-300 bg-white p-5 shadow-card">
        <div className="flex items-center justify-between gap-3 text-sm">
          <p className="font-semibold text-graphite-900">Progresso do preenchimento</p>
          <p className="text-graphite-500">
            {camposPreenchidos} de {TOTAL_CAMPOS} campos · {progresso}%
          </p>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-mist-200">
          <div
            className="h-full rounded-full bg-signal-500 transition-all duration-500 ease-out"
            style={{ width: `${progresso}%` }}
          />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-6">
          {blocos.map((bloco, i) => {
            const completo = bloco.campos.every((c) => form[c.key]?.trim())
            return (
            <div key={bloco.titulo} className="rounded-2xl border border-mist-300 bg-white p-6 shadow-card">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    completo ? 'bg-signal-600 text-white' : 'bg-signal-50 text-signal-700'
                  }`}
                >
                  {completo ? (
                    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
                      <path d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5a1 1 0 111.4-1.4l3.9 3.9 6.7-6.7a1 1 0 011.4 0z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      {bloco.icone}
                    </svg>
                  )}
                </span>
                <h2 className="font-display text-lg font-semibold text-indigo-800">
                  <span className="mr-1.5 text-graphite-300">{i + 1}.</span>
                  {bloco.titulo}
                </h2>
              </div>
              <div className="mt-4 space-y-4">
                {bloco.campos.map((campo) => (
                  <div key={campo.key}>
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-sm font-medium text-graphite-700">{campo.label}</label>
                      {(campo.key === 'necessidades' || campo.key === 'observacoesErgonomicas') &&
                        categoriaAtiva &&
                        getSugestaoRedacao(categoriaAtiva, campo.key) && (
                          <button
                            type="button"
                            onClick={() => handleInserirSugestao(campo.key)}
                            className="shrink-0 text-xs font-semibold text-volt-700 hover:text-volt-800"
                          >
                            ✨ Usar sugestão
                          </button>
                        )}
                    </div>
                    {campo.type === 'textarea' ? (
                      <textarea
                        rows={3}
                        value={form[campo.key]}
                        onChange={(e) => update(campo.key, e.target.value)}
                        className="mt-2 w-full rounded-xl border border-mist-400 px-4 py-3 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
                      />
                    ) : (
                      <input
                        value={form[campo.key]}
                        onChange={(e) => update(campo.key, e.target.value)}
                        className="mt-2 w-full rounded-xl border border-mist-400 px-4 py-3 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
                      />
                    )}
                  </div>
                ))}
              </div>
              {bloco.titulo === 'Deficiência' && recursosSugeridos.length > 0 && (
                <div className="mt-4 rounded-xl border border-signal-200 bg-signal-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-signal-700">
                    Recursos selecionados na Consulta Rápida
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-graphite-700">
                    {recursosSugeridos.map((r) => (
                      <li key={r}>• {r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            )
          })}

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          <Button as="button" onClick={handleGerar} className="w-full justify-center" size="lg">
            Gerar Relatório
          </Button>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-mist-300 bg-white p-6 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg font-semibold text-indigo-800">
                Relatório gerado
              </h2>
              {relatorio && !editMode && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleCopiar}
                    className="rounded-full border border-mist-400 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:border-signal-400"
                  >
                    {copiado ? 'Copiado!' : 'Copiar'}
                  </button>
                  <button
                    onClick={handleEditar}
                    className="rounded-full border border-mist-400 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:border-signal-400"
                  >
                    ✏️ Editar Relatório
                  </button>
                  <button
                    onClick={handleBaixarPdf}
                    className="rounded-full bg-signal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-signal-700"
                  >
                    📄 Baixar Relatório em PDF
                  </button>
                  <button
                    onClick={handleNovoRelatorio}
                    className="rounded-full border border-mist-400 px-3 py-1.5 text-xs font-semibold text-graphite-700 hover:border-signal-400"
                  >
                    🆕 Gerar Novo Relatório
                  </button>
                </div>
              )}
              {editMode && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setEditMode(false)}
                    className="rounded-full border border-mist-400 px-3 py-1.5 text-xs font-semibold text-graphite-700 hover:border-mist-500"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSalvarEdicao}
                    className="rounded-full bg-indigo-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-800"
                  >
                    {salvo ? 'Salvo!' : '💾 Salvar Alterações'}
                  </button>
                </div>
              )}
            </div>

            <div className="mt-4">
              {!relatorio && (
                <p className="rounded-xl bg-mist-200 p-5 text-sm text-graphite-500">
                  Preencha o formulário e clique em "Gerar Relatório" para ver o resultado aqui.
                </p>
              )}
              {relatorio && !editMode && (
                <div className="prose-report max-h-[600px] overflow-y-auto">
                  <ReactMarkdown>{relatorio}</ReactMarkdown>
                </div>
              )}
              {editMode && (
                <div>
                  <textarea
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                    rows={20}
                    className="w-full rounded-xl border border-signal-400 bg-mist-50 p-4 font-mono text-xs leading-relaxed outline-none focus:ring-2 focus:ring-signal-100"
                  />
                  <p className="mt-2 text-xs text-graphite-300">
                    Edição livre em Markdown (## define o título de cada seção). Clique em
                    "Salvar Alterações" para aplicar.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-mist-300 bg-white p-6 shadow-card">
            <h2 className="font-display text-lg font-semibold text-indigo-800">
              ✅ O que não pode faltar
            </h2>
            <ul className="mt-3 space-y-2">
              {CAMPOS_ESSENCIAIS.map((campo) => {
                const preenchido = Boolean(form[campo.key]?.trim())
                return (
                  <li key={campo.key} className="flex items-center gap-2.5 text-sm">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        preenchido ? 'bg-signal-600 text-white' : 'border border-mist-400 text-transparent'
                      }`}
                    >
                      <svg viewBox="0 0 20 20" className="h-3 w-3" fill="currentColor">
                        <path d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5a1 1 0 111.4-1.4l3.9 3.9 6.7-6.7a1 1 0 011.4 0z" />
                      </svg>
                    </span>
                    <span className={preenchido ? 'text-graphite-500 line-through' : 'text-graphite-900'}>
                      {campo.label}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="rounded-2xl border border-mist-300 bg-white p-6 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-semibold text-indigo-800">
                📂 Meus Relatórios
              </h2>
            </div>
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por candidato ou cargo…"
              className="mt-3 w-full rounded-xl border border-mist-400 px-4 py-2.5 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
            />

            {historicoCarregando ? (
              <p className="mt-4 text-sm text-graphite-500">Carregando relatórios…</p>
            ) : historicoFiltrado.length === 0 ? (
              <p className="mt-4 text-sm text-graphite-500">
                {historico.length === 0
                  ? 'Nenhum relatório gerado ainda nesta conta.'
                  : 'Nenhum relatório encontrado para essa busca.'}
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-mist-300">
                {historicoFiltrado.map((item) => (
                  <li key={item.id} className="py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-graphite-900">
                        {item.candidato} {item.editado && <span className="text-graphite-300">· editado</span>}
                        {item.tipo === 'revisao_confirmada' && (
                          <span className="ml-1.5 rounded-full bg-mist-300 px-2 py-0.5 text-[10px] font-semibold text-graphite-700">
                            revisão confirmada
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-graphite-300">
                        {item.cargo || 'Cargo não informado'} ·{' '}
                        {new Date(item.updatedAt || item.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold">
                      <button onClick={() => handleAbrirHistorico(item, false)} className="text-indigo-700 hover:text-indigo-900">
                        📂 Abrir
                      </button>
                      <button onClick={() => handleAbrirHistorico(item, true)} className="text-indigo-700 hover:text-indigo-900">
                        ✏️ Editar
                      </button>
                      <button onClick={() => handleIniciarRevisao(item)} className="text-volt-700 hover:text-volt-800">
                        🔁 Revisão anual
                      </button>
                      <button onClick={() => handleDuplicar(item)} className="text-graphite-700 hover:text-graphite-900">
                        📋 Duplicar
                      </button>
                      <button onClick={() => handleBaixarHistoricoPdf(item)} className="text-signal-700 hover:text-signal-800">
                        📥 Baixar PDF
                      </button>
                      <button onClick={() => handleExcluirHistorico(item.id)} className="text-red-500 hover:text-red-700">
                        🗑️ Excluir
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-xs text-graphite-300">
              Seus relatórios ficam salvos com segurança na nuvem — acesse de qualquer
              computador com o login da sua empresa. Você também pode exportar uma cópia extra
              em{' '}
              <Link to="/app/conta" className="font-semibold text-graphite-500 hover:text-signal-700">
                Minha conta
              </Link>
              , se quiser.
            </p>
          </div>
        </div>
      </div>

      <ConsultaRapida
        open={painelAberto}
        onClose={() => setPainelAberto(false)}
        categoriaAtiva={categoriaAtiva}
        onSelectCategoria={setCategoriaAtiva}
        recursosSelecionados={recursosSugeridos}
        onToggleRecurso={handleToggleRecurso}
      />

      {revisaoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-graphite-900/50 px-5">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-pop">
            <h2 className="font-display text-lg font-semibold text-indigo-800">Revisão anual</h2>
            <p className="mt-2 text-sm text-graphite-700">
              Algo mudou desde a última avaliação de <strong>{revisaoModal.nome}</strong>?
            </p>
            <div className="mt-6 flex flex-col gap-2.5">
              <Button as="button" onClick={handleRevisaoComAlteracao} className="w-full justify-center">
                Sim, algo mudou — abrir avaliação completa
              </Button>
              <Button
                as="button"
                variant="ghost"
                disabled={revisaoSalvando}
                onClick={handleRevisaoSemAlteracao}
                className="w-full justify-center"
              >
                {revisaoSalvando ? 'Registrando…' : 'Não, confirmar sem alterações'}
              </Button>
              <button
                onClick={() => setRevisaoModal(null)}
                className="mt-1 text-sm font-semibold text-graphite-500 hover:text-graphite-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
