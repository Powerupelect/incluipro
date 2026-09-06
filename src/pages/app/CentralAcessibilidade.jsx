import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../lib/auth.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { EstadoVazio, StatusPonto } from '../../components/ui/Table.jsx'
import {
  TIPOS_SOLICITACAO,
  STATUS_FLUXO,
  STATUS_LABEL,
  STATUS_PONTO_COR,
  getColaboradoresAtivos,
  getSolicitacoes,
  criarSolicitacao,
  atualizarSolicitacao,
  avancarStatus,
  anexarComprovacao,
  urlAssinadaAnexo,
  calcularMetricas,
  excluirSolicitacao,
} from '../../lib/solicitacoesAcessibilidade.js'

const formatBRL = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const NOVA_INICIAL = {
  colaboradorId: '',
  tipo: TIPOS_SOLICITACAO[0].id,
  descricao: '',
  dataPedido: new Date().toISOString().slice(0, 10),
  solicitadoPor: '',
  valorRecurso: '',
}

export function CentralAcessibilidade() {
  const { user } = useAuth()
  const [colaboradores, setColaboradores] = useState([])
  const [solicitacoes, setSolicitacoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [formAberto, setFormAberto] = useState(false)
  const [nova, setNova] = useState(NOVA_INICIAL)
  const [salvando, setSalvando] = useState(false)
  const [busca, setBusca] = useState('')

  useEffect(() => {
    if (!user?.empresaId) return
    setCarregando(true)
    Promise.all([getColaboradoresAtivos(user.empresaId), getSolicitacoes(user.empresaId)])
      .then(([cols, sols]) => {
        setColaboradores(cols)
        setSolicitacoes(sols)
      })
      .finally(() => setCarregando(false))
  }, [user?.empresaId])

  const metricas = useMemo(() => calcularMetricas(solicitacoes), [solicitacoes])

  const solicitacoesFiltradas = useMemo(() => {
    const q = busca.trim().toLowerCase()
    if (!q) return solicitacoes
    return solicitacoes.filter(
      (s) =>
        (s.colaboradores?.nome || '').toLowerCase().includes(q) ||
        (TIPOS_SOLICITACAO.find((t) => t.id === s.tipo)?.label || '').toLowerCase().includes(q) ||
        (STATUS_LABEL[s.status] || '').toLowerCase().includes(q),
    )
  }, [solicitacoes, busca])

  async function handleExcluir(id) {
    if (!confirm('Excluir esta solicitação? Esta ação não pode ser desfeita.')) return
    try {
      await excluirSolicitacao(id)
      setSolicitacoes((s) => s.filter((x) => x.id !== id))
    } catch {
      // silencioso
    }
  }

  async function handleCriar(e) {
    e.preventDefault()
    if (!nova.colaboradorId || !nova.descricao.trim()) return
    setSalvando(true)
    try {
      const criada = await criarSolicitacao({
        empresaId: user.empresaId,
        ...nova,
        valorRecurso: nova.valorRecurso ? Number(nova.valorRecurso) : null,
      })
      setSolicitacoes((s) => [criada, ...s])
      setNova(NOVA_INICIAL)
      setFormAberto(false)
    } catch {
      // silencioso
    } finally {
      setSalvando(false)
    }
  }

  async function atualizar(id, patchFn) {
    const atual = solicitacoes.find((s) => s.id === id)
    if (!atual) return
    const atualizada = await patchFn(atual)
    setSolicitacoes((s) => s.map((x) => (x.id === id ? atualizada : x)))
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-indigo-900">Solicitações</h1>
          <p className="mt-2 max-w-2xl text-sm text-graphite-500">
            O RH registra o pedido feito pelo colaborador — conversa, e-mail, mensagem — e
            acompanha o fluxo até a conclusão. Visível apenas para admin, RH e gestores.
          </p>
          <p className="mt-1 text-xs text-graphite-400">
            Estas solicitações contêm dado sensível de saúde (LGPD art. 11) — ver{' '}
            <Link to="/privacidade" className="underline hover:text-graphite-600">Política de Privacidade</Link>.
          </p>
        </div>
        <Button shape="crm" as="button" onClick={() => setFormAberto((v) => !v)} size="lg">
          + Nova solicitação
        </Button>
      </div>

      <div className="mb-8 grid gap-5 sm:grid-cols-3">
        <div className="rounded-lg border border-mist-300 bg-white p-5">
          <p className="font-display text-2xl font-semibold text-indigo-800">
            {metricas.tempoMedioDias ?? '—'}{metricas.tempoMedioDias !== null && ' dias'}
          </p>
          <p className="text-sm text-graphite-500">tempo médio de atendimento</p>
        </div>
        <div className="rounded-lg border border-mist-300 bg-white p-5">
          <p className="font-display text-2xl font-semibold text-signal-700">
            {metricas.taxaAtendida ?? '—'}{metricas.taxaAtendida !== null && '%'}
          </p>
          <p className="text-sm text-graphite-500">taxa de solicitações atendidas</p>
        </div>
        <div className="rounded-lg border border-mist-300 bg-white p-5">
          <p className="text-sm font-semibold text-graphite-700">Tipos mais pedidos</p>
          {metricas.tiposMaisPedidos.length === 0 ? (
            <p className="mt-1 text-sm text-graphite-300">Sem dados ainda</p>
          ) : (
            <ul className="mt-1 space-y-0.5 text-sm text-graphite-500">
              {metricas.tiposMaisPedidos.slice(0, 3).map(({ tipo, quantidade }) => (
                <li key={tipo}>
                  {TIPOS_SOLICITACAO.find((t) => t.id === tipo)?.label || tipo} ({quantidade})
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {formAberto && (
        <form onSubmit={handleCriar} className="mb-8 rounded-lg border border-mist-300 bg-white p-6">
          <h2 className="font-display text-lg font-semibold text-indigo-800">Nova solicitação</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              <span className="font-semibold text-graphite-700">Colaborador</span>
              <select
                required
                value={nova.colaboradorId}
                onChange={(e) => setNova((n) => ({ ...n, colaboradorId: e.target.value }))}
                className="mt-1.5 w-full rounded-md border border-mist-400 px-3 py-2 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
              >
                <option value="">Selecione…</option>
                {colaboradores.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="font-semibold text-graphite-700">Tipo de pedido</span>
              <select
                value={nova.tipo}
                onChange={(e) => setNova((n) => ({ ...n, tipo: e.target.value }))}
                className="mt-1.5 w-full rounded-md border border-mist-400 px-3 py-2 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
              >
                {TIPOS_SOLICITACAO.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="font-semibold text-graphite-700">Descrição do pedido</span>
              <textarea
                required
                rows={3}
                value={nova.descricao}
                onChange={(e) => setNova((n) => ({ ...n, descricao: e.target.value }))}
                className="mt-1.5 w-full rounded-md border border-mist-400 px-4 py-2.5 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
              />
            </label>
            <label className="text-sm">
              <span className="font-semibold text-graphite-700">Data do pedido</span>
              <input
                type="date"
                value={nova.dataPedido}
                onChange={(e) => setNova((n) => ({ ...n, dataPedido: e.target.value }))}
                className="mt-1.5 w-full rounded-md border border-mist-400 px-4 py-2.5 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
              />
            </label>
            <label className="text-sm">
              <span className="font-semibold text-graphite-700">Quem solicitou</span>
              <input
                value={nova.solicitadoPor}
                onChange={(e) => setNova((n) => ({ ...n, solicitadoPor: e.target.value }))}
                placeholder="Nome de quem registrou o pedido"
                className="mt-1.5 w-full rounded-md border border-mist-400 px-4 py-2.5 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
              />
            </label>
            <label className="text-sm">
              <span className="font-semibold text-graphite-700">Valor do recurso (opcional)</span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={nova.valorRecurso}
                onChange={(e) => setNova((n) => ({ ...n, valorRecurso: e.target.value }))}
                placeholder="Ex: 850,00"
                className="mt-1.5 w-full rounded-md border border-mist-400 px-4 py-2.5 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
              />
            </label>
          </div>
          <div className="mt-5 flex gap-2.5">
            <Button shape="crm" as="button" type="submit" disabled={salvando}>
              {salvando ? 'Salvando…' : 'Registrar solicitação'}
            </Button>
            <Button shape="crm" as="button" type="button" variant="ghost" onClick={() => setFormAberto(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {!carregando && solicitacoes.length > 0 && (
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por colaborador, tipo ou status…"
          className="mb-5 w-full max-w-md rounded-md border border-mist-400 px-4 py-2.5 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
        />
      )}

      {carregando ? (
        <p className="text-sm text-graphite-500">Carregando…</p>
      ) : solicitacoes.length === 0 ? (
        <EstadoVazio
          titulo="Nenhuma solicitação registrada ainda"
          descricao="Registre aqui o pedido de adaptação feito pelo colaborador — conversa, e-mail ou mensagem — e acompanhe o fluxo até a conclusão."
          acao={<Button shape="crm" as="button" onClick={() => setFormAberto(true)}>Registrar a primeira solicitação</Button>}
        />
      ) : solicitacoesFiltradas.length === 0 ? (
        <p className="text-sm text-graphite-500">Nenhuma solicitação encontrada para essa busca.</p>
      ) : (
        <div className="space-y-4">
          {solicitacoesFiltradas.map((s) => (
            <SolicitacaoCard key={s.id} solicitacao={s} empresaId={user.empresaId} onAtualizar={atualizar} onExcluir={handleExcluir} />
          ))}
        </div>
      )}
    </div>
  )
}

function SolicitacaoCard({ solicitacao: s, empresaId, onAtualizar, onExcluir }) {
  const [responsavel, setResponsavel] = useState(s.responsavel || '')
  const [prazo, setPrazo] = useState(s.prazo || '')
  const [motivoRecusa, setMotivoRecusa] = useState(s.motivo_recusa || '')
  const [editando, setEditando] = useState(false)
  const [edicao, setEdicao] = useState({
    tipo: s.tipo,
    descricao: s.descricao,
    dataPedido: s.data_pedido,
    solicitadoPor: s.solicitado_por || '',
    valorRecurso: s.valor_recurso ?? '',
  })
  const [salvandoEdicao, setSalvandoEdicao] = useState(false)
  const proximoIndex = STATUS_FLUXO.indexOf(s.status)
  const proximoStatus = proximoIndex >= 0 && proximoIndex < STATUS_FLUXO.length - 1 ? STATUS_FLUXO[proximoIndex + 1] : null

  async function handleAvancar(novoStatus, extra) {
    await onAtualizar(s.id, () => avancarStatus(s.id, novoStatus, extra))
  }

  async function handleAnexo(e) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return
    await onAtualizar(s.id, () => anexarComprovacao(s.id, empresaId, s.colaborador_id, arquivo))
  }

  async function handleAbrirAnexo() {
    const url = await urlAssinadaAnexo(s.anexo_path).catch(() => null)
    if (url) window.open(url, '_blank', 'noopener')
  }

  async function handleSalvarEdicao(e) {
    e.preventDefault()
    setSalvandoEdicao(true)
    try {
      await onAtualizar(s.id, () =>
        atualizarSolicitacao(s.id, {
          ...edicao,
          valorRecurso: edicao.valorRecurso ? Number(edicao.valorRecurso) : null,
        }),
      )
      setEditando(false)
    } finally {
      setSalvandoEdicao(false)
    }
  }

  return (
    <div className="rounded-lg border border-mist-300 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-graphite-900">{s.colaboradores?.nome || 'Colaborador'}</p>
          {editando ? (
            <form onSubmit={handleSalvarEdicao} className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <span className="font-semibold text-graphite-700">Tipo de pedido</span>
                <select
                  value={edicao.tipo}
                  onChange={(e) => setEdicao((d) => ({ ...d, tipo: e.target.value }))}
                  className="mt-1.5 w-full rounded-md border border-mist-400 px-3 py-2 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
                >
                  {TIPOS_SOLICITACAO.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="font-semibold text-graphite-700">Data do pedido</span>
                <input
                  type="date"
                  value={edicao.dataPedido}
                  onChange={(e) => setEdicao((d) => ({ ...d, dataPedido: e.target.value }))}
                  className="mt-1.5 w-full rounded-md border border-mist-400 px-3 py-2 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
                />
              </label>
              <label className="text-sm sm:col-span-2">
                <span className="font-semibold text-graphite-700">Descrição do pedido</span>
                <textarea
                  required
                  rows={3}
                  value={edicao.descricao}
                  onChange={(e) => setEdicao((d) => ({ ...d, descricao: e.target.value }))}
                  className="mt-1.5 w-full rounded-md border border-mist-400 px-4 py-2.5 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
                />
              </label>
              <label className="text-sm">
                <span className="font-semibold text-graphite-700">Quem solicitou</span>
                <input
                  value={edicao.solicitadoPor}
                  onChange={(e) => setEdicao((d) => ({ ...d, solicitadoPor: e.target.value }))}
                  className="mt-1.5 w-full rounded-md border border-mist-400 px-4 py-2.5 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
                />
              </label>
              <label className="text-sm">
                <span className="font-semibold text-graphite-700">Valor do recurso (opcional)</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={edicao.valorRecurso}
                  onChange={(e) => setEdicao((d) => ({ ...d, valorRecurso: e.target.value }))}
                  className="mt-1.5 w-full rounded-md border border-mist-400 px-4 py-2.5 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
                />
              </label>
              <div className="flex gap-2.5 sm:col-span-2">
                <Button shape="crm" as="button" type="submit" size="sm" disabled={salvandoEdicao}>
                  {salvandoEdicao ? 'Salvando…' : 'Salvar alterações'}
                </Button>
                <Button shape="crm" as="button" type="button" variant="ghost" size="sm" onClick={() => setEditando(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          ) : (
            <>
              <p className="text-sm text-graphite-500">
                {TIPOS_SOLICITACAO.find((t) => t.id === s.tipo)?.label || s.tipo} · pedido em{' '}
                {new Date(s.data_pedido).toLocaleDateString('pt-BR')}
                {s.solicitado_por && ` · registrado por ${s.solicitado_por}`}
                {s.valor_recurso != null && ` · ${formatBRL(Number(s.valor_recurso))}`}
              </p>
              <p className="mt-2 text-sm text-graphite-700">{s.descricao}</p>
            </>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <StatusPonto cor={STATUS_PONTO_COR[s.status]}>{STATUS_LABEL[s.status]}</StatusPonto>
          {!editando && (
            <span className="flex gap-3 text-xs font-semibold">
              <button onClick={() => setEditando(true)} className="text-indigo-700 hover:text-indigo-900">
                Editar
              </button>
              <button onClick={() => onExcluir(s.id)} className="text-red-500 hover:text-red-700">
                Excluir
              </button>
            </span>
          )}
        </div>
      </div>

      {s.status === 'recusado' && s.motivo_recusa && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">Motivo da recusa: {s.motivo_recusa}</p>
      )}

      <div className="mt-4 grid gap-3 border-t border-mist-200 pt-4 sm:grid-cols-2">
        <label className="text-sm sm:col-span-2">
          <span className="font-semibold text-graphite-700">Anexo de comprovação</span>
          <input type="file" onChange={handleAnexo} className="mt-1.5 w-full text-sm" />
        </label>
        {s.anexo_path && (
          <button onClick={handleAbrirAnexo} className="text-left text-sm font-semibold text-signal-600 hover:text-signal-700 sm:col-span-2">
            Abrir anexo enviado
          </button>
        )}

        {s.status !== 'concluido' && s.status !== 'recusado' && (
          <>
            <label className="text-sm">
              <span className="font-semibold text-graphite-700">Responsável</span>
              <input
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-mist-400 px-3 py-2 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
              />
            </label>
            <label className="text-sm">
              <span className="font-semibold text-graphite-700">Prazo</span>
              <input
                type="date"
                value={prazo}
                onChange={(e) => setPrazo(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-mist-400 px-3 py-2 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
              />
            </label>

            <div className="flex flex-wrap gap-2 sm:col-span-2">
              {proximoStatus && (
                <Button shape="crm"
                  as="button"
                  size="sm"
                  onClick={() => handleAvancar(proximoStatus, { responsavel, prazo })}
                >
                  Avançar para "{STATUS_LABEL[proximoStatus]}"
                </Button>
              )}
              <Button shape="crm"
                as="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  const motivo = prompt('Motivo da recusa:', motivoRecusa)
                  if (motivo === null) return
                  setMotivoRecusa(motivo)
                  handleAvancar('recusado', { motivoRecusa: motivo })
                }}
              >
                Recusar
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
