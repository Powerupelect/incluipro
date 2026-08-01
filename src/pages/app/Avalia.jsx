import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Button } from '../../components/ui/Button.jsx'
import { gerarRelatorio } from '../../lib/anthropic.js'
import { getApiKey } from '../../lib/apiKey.js'
import { getReports, saveReport, deleteReport } from '../../lib/reports.js'

const blocos = [
  {
    titulo: 'Identificação',
    campos: [
      { key: 'nome', label: 'Nome do candidato', type: 'text' },
      { key: 'cargo', label: 'Cargo pretendido', type: 'text' },
      { key: 'empresa', label: 'Empresa', type: 'text' },
    ],
  },
  {
    titulo: 'Rotina e autonomia',
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
    campos: [
      { key: 'historico', label: 'Experiências anteriores relevantes', type: 'textarea' },
    ],
  },
  {
    titulo: 'Necessidades específicas no trabalho',
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
    campos: [
      { key: 'expectativas', label: 'O que o candidato espera da vaga e da empresa', type: 'textarea' },
    ],
  },
  {
    titulo: 'Observações ergonômicas/ambientais',
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
    campos: [{ key: 'notasLivres', label: 'Outras observações do avaliador', type: 'textarea' }],
  },
]

const initialForm = {
  nome: '',
  cargo: '',
  empresa: '',
  rotina: '',
  historico: '',
  necessidades: '',
  expectativas: '',
  observacoesErgonomicas: '',
  notasLivres: '',
}

export function Avalia() {
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [relatorio, setRelatorio] = useState('')
  const [copiado, setCopiado] = useState(false)
  const [historico, setHistorico] = useState(() => getReports())

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleGerar() {
    setError('')
    setLoading(true)
    try {
      const apiKey = getApiKey()
      const texto = await gerarRelatorio(form, apiKey)
      setRelatorio(texto)
      const saved = saveReport({
        candidato: form.nome || 'Candidato sem nome',
        cargo: form.cargo,
        empresa: form.empresa,
        conteudo: texto,
      })
      setHistorico((h) => [saved, ...h])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleCopiar() {
    navigator.clipboard.writeText(relatorio)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  function handleExportar() {
    // TODO: exportação para PDF/Word — por enquanto, exporta como arquivo Markdown/texto.
    const blob = new Blob([relatorio], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-${(form.nome || 'candidato').toLowerCase().replace(/\s+/g, '-')}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleAbrirHistorico(item) {
    setRelatorio(item.conteudo)
    setForm((f) => ({ ...f, nome: item.candidato, cargo: item.cargo, empresa: item.empresa }))
  }

  function handleExcluirHistorico(id) {
    deleteReport(id)
    setHistorico((h) => h.filter((r) => r.id !== id))
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-signal-600">
          IncluiPro Avalia
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-indigo-800">
          Nova avaliação social
        </h1>
        <p className="mt-2 max-w-2xl text-graphite-500">
          Preencha as anotações da entrevista por blocos. Ao final, gere o relatório estruturado
          com IA.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-6">
          {blocos.map((bloco) => (
            <div key={bloco.titulo} className="rounded-2xl border border-mist-300 bg-white p-6 shadow-card">
              <h2 className="font-display text-lg font-semibold text-indigo-800">
                {bloco.titulo}
              </h2>
              <div className="mt-4 space-y-4">
                {bloco.campos.map((campo) => (
                  <div key={campo.key}>
                    <label className="text-sm font-medium text-graphite-700">{campo.label}</label>
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
            </div>
          ))}

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          <Button as="button" onClick={handleGerar} disabled={loading} className="w-full justify-center" size="lg">
            {loading ? 'Gerando relatório…' : 'Gerar relatório com IA'}
          </Button>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-mist-300 bg-white p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-indigo-800">
                Relatório gerado
              </h2>
              {relatorio && (
                <div className="flex gap-2">
                  <button
                    onClick={handleCopiar}
                    className="rounded-full border border-mist-400 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:border-signal-400"
                  >
                    {copiado ? 'Copiado!' : 'Copiar'}
                  </button>
                  <button
                    onClick={handleExportar}
                    className="rounded-full border border-mist-400 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:border-signal-400"
                  >
                    Exportar (.md)
                  </button>
                </div>
              )}
            </div>

            <div className="mt-4 max-h-[600px] overflow-y-auto">
              {!relatorio && !loading && (
                <p className="rounded-xl bg-mist-200 p-5 text-sm text-graphite-500">
                  Preencha o formulário e clique em "Gerar relatório com IA" para ver o resultado
                  aqui.
                </p>
              )}
              {loading && (
                <p className="rounded-xl bg-mist-200 p-5 text-sm text-graphite-500">
                  Analisando as anotações e estruturando o relatório…
                </p>
              )}
              {relatorio && (
                <div className="prose-report">
                  <ReactMarkdown>{relatorio}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-mist-300 bg-white p-6 shadow-card">
            <h2 className="font-display text-lg font-semibold text-indigo-800">
              Histórico de relatórios
            </h2>
            {historico.length === 0 ? (
              <p className="mt-3 text-sm text-graphite-500">
                Nenhum relatório gerado ainda nesta conta.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-mist-300">
                {historico.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                    <button
                      onClick={() => handleAbrirHistorico(item)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="truncate text-sm font-medium text-graphite-900">
                        {item.candidato}
                      </p>
                      <p className="truncate text-xs text-graphite-300">
                        {item.cargo || 'Cargo não informado'} ·{' '}
                        {new Date(item.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </button>
                    <button
                      onClick={() => handleExcluirHistorico(item.id)}
                      className="shrink-0 text-xs font-semibold text-red-500 hover:text-red-700"
                    >
                      Excluir
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs text-graphite-300">
              Histórico salvo neste navegador. {/* TODO: persistir em banco de dados real. */}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
