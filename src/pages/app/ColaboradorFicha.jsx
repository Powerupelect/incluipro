import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../lib/auth.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { EstadoVazio } from '../../components/ui/Table.jsx'
import { getColaborador, excluirColaborador, contarVinculosColaborador } from '../../lib/colaboradores.js'
import { getReportsByColaborador } from '../../lib/reports.js'
import { getDocumentosPorColaborador } from '../../lib/documentos.js'
import { getSolicitacoesPorColaborador, TIPOS_SOLICITACAO, STATUS_LABEL } from '../../lib/solicitacoesAcessibilidade.js'
import { TIPOS_DOCUMENTO } from '../../lib/documentos.js'

function dataOrdenavel(item) {
  return new Date(item.data).getTime()
}

export function ColaboradorFicha() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [colaborador, setColaborador] = useState(null)
  const [avaliacoes, setAvaliacoes] = useState([])
  const [documentos, setDocumentos] = useState([])
  const [solicitacoes, setSolicitacoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(null)
  const [vinculos, setVinculos] = useState(null)

  useEffect(() => {
    let ativo = true
    setCarregando(true)
    Promise.all([
      getColaborador(id),
      getReportsByColaborador(id),
      getDocumentosPorColaborador(id),
      getSolicitacoesPorColaborador(id),
    ])
      .then(([col, avals, docs, sols]) => {
        if (!ativo) return
        setColaborador(col)
        setAvaliacoes(avals)
        setDocumentos(docs)
        setSolicitacoes(sols)
      })
      .catch(() => {
        if (ativo) setErro('Não foi possível carregar este colaborador agora.')
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })
    return () => {
      ativo = false
    }
  }, [id])

  const linhaDoTempo = useMemo(() => {
    const itens = [
      ...avaliacoes.map((a) => ({
        tipo: 'avaliacao',
        data: a.createdAt,
        titulo: a.tipo === 'revisao_confirmada' ? 'Revisão anual confirmada' : 'Avaliação registrada',
        subtitulo: a.editado ? 'editado' : null,
      })),
      ...documentos.map((d) => ({
        tipo: 'documento',
        data: d.criado_em,
        titulo: `Documento: ${TIPOS_DOCUMENTO.find((t) => t.id === d.tipo)?.label || d.tipo}`,
        subtitulo: d.descreve_barreira_funcional ? null : 'sem descrição de barreira funcional',
      })),
      ...solicitacoes.map((s) => ({
        tipo: 'solicitacao',
        data: s.criado_em,
        titulo: `Solicitação: ${TIPOS_SOLICITACAO.find((t) => t.id === s.tipo)?.label || s.tipo}`,
        subtitulo: STATUS_LABEL[s.status],
      })),
    ]
    return itens.sort((a, b) => dataOrdenavel(b) - dataOrdenavel(a))
  }, [avaliacoes, documentos, solicitacoes])

  async function handlePedirExclusao() {
    const v = await contarVinculosColaborador(id).catch(() => null)
    setVinculos(v)
    setConfirmandoExclusao(true)
  }

  async function handleConfirmarExclusao() {
    try {
      await excluirColaborador(id, user.empresaId)
      navigate('/app/colaboradores')
    } catch {
      setErro('Não foi possível excluir agora. Tente novamente.')
      setConfirmandoExclusao(false)
    }
  }

  if (carregando) {
    return <p className="text-sm text-graphite-500">Carregando…</p>
  }

  if (!colaborador) {
    return (
      <EstadoVazio
        titulo="Colaborador não encontrado"
        descricao="Ele pode ter sido excluído, ou o link não é mais válido."
        acao={<Link to="/app/colaboradores" className="text-sm font-semibold text-indigo-700 hover:text-signal-700">← Voltar para Colaboradores</Link>}
      />
    )
  }

  return (
    <div>
      <Link to="/app/colaboradores" className="text-sm font-semibold text-graphite-500 hover:text-signal-700">
        ← Colaboradores
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-indigo-900">{colaborador.nome}</h1>
          <p className="mt-1 text-sm text-graphite-500">
            {colaborador.cargo || 'Cargo não informado'}
            {colaborador.tipo_deficiencia && ` · ${colaborador.tipo_deficiencia}`}
            {colaborador.data_desligamento && ' · desligado'}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button shape="crm" to="/app/avalia" variant="ghost" size="sm">Nova avaliação</Button>
          <Button shape="crm" as="button" variant="danger" size="sm" onClick={handlePedirExclusao}>
            Excluir colaborador
          </Button>
        </div>
      </div>

      {colaborador.observacoes_condicao && (
        <div className="mt-6 rounded-lg border border-mist-300 bg-white p-5 text-sm text-graphite-700">
          <p className="font-semibold text-graphite-900">Observações sobre a condição</p>
          <p className="mt-1 leading-relaxed">{colaborador.observacoes_condicao}</p>
        </div>
      )}

      {erro && <p className="mt-4 text-sm text-red-600">{erro}</p>}

      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-indigo-800">Linha do tempo</h2>
        {linhaDoTempo.length === 0 ? (
          <div className="mt-3">
            <EstadoVazio
              titulo="Nada registrado ainda para este colaborador"
              descricao="Avaliações, documentos e solicitações de adaptação aparecem aqui assim que forem criados."
            />
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-mist-200 rounded-lg border border-mist-300 bg-white">
            {linhaDoTempo.map((item, i) => (
              <li key={i} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-graphite-900">{item.titulo}</p>
                  {item.subtitulo && <p className="text-xs text-graphite-400">{item.subtitulo}</p>}
                </div>
                <span className="shrink-0 text-xs text-graphite-400">
                  {item.data ? new Date(item.data).toLocaleDateString('pt-BR') : '—'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {confirmandoExclusao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-graphite-900/50 px-5">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-pop">
            <h2 className="font-display text-lg font-semibold text-indigo-800">
              Excluir {colaborador.nome}?
            </h2>
            <p className="mt-2 text-sm text-graphite-700">
              Esta ação remove o colaborador e não pode ser desfeita. Junto com ele, serão excluídos
              permanentemente:
            </p>
            <ul className="mt-3 space-y-1 text-sm text-graphite-700">
              <li>• {vinculos?.avaliacoes ?? '—'} avaliação(ões) / relatório(s)</li>
              <li>• {vinculos?.documentos ?? '—'} documento(s)</li>
              <li>• {vinculos?.solicitacoes ?? '—'} solicitação(ões) de adaptação</li>
            </ul>
            <div className="mt-6 flex gap-2.5">
              <Button shape="crm" as="button" variant="danger" onClick={handleConfirmarExclusao}>
                Excluir definitivamente
              </Button>
              <Button shape="crm" as="button" variant="ghost" onClick={() => setConfirmandoExclusao(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
