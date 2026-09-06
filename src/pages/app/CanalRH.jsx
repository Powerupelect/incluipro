import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../lib/auth.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { TabelaContainer, Th, Td, StatusPonto, EstadoVazio, useOrdenacao } from '../../components/ui/Table.jsx'
import { getEmpresa } from '../../lib/empresa.js'
import { getColaboradoresAtivos } from '../../lib/solicitacoesAcessibilidade.js'
import {
  TIPOS_CANAL,
  STATUS_CANAL_FLUXO,
  STATUS_CANAL_LABEL,
  STATUS_CANAL_PONTO_COR,
  getSolicitacoesCanal,
  atualizarStatusCanal,
  promoverParaSolicitacao,
  gerarESalvarIdentificadorPublico,
} from '../../lib/canalColaborador.js'

const tipoLabel = (id) => TIPOS_CANAL.find((t) => t.id === id)?.label || id

export function CanalRH() {
  const { user } = useAuth()
  const [empresa, setEmpresa] = useState(null)
  const [solicitacoes, setSolicitacoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [detalhe, setDetalhe] = useState(null)
  const [linkCopiado, setLinkCopiado] = useState(false)
  const [gerandoLink, setGerandoLink] = useState(false)

  useEffect(() => {
    if (!user?.empresaId) return
    let ativo = true
    setCarregando(true)
    Promise.all([getEmpresa(user.empresaId), getSolicitacoesCanal(user.empresaId)])
      .then(([emp, sols]) => {
        if (!ativo) return
        setEmpresa(emp)
        setSolicitacoes(sols)
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })
    return () => {
      ativo = false
    }
  }, [user?.empresaId])

  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase()
    if (!q) return solicitacoes
    return solicitacoes.filter(
      (s) =>
        (s.nome_informado || '').toLowerCase().includes(q) ||
        tipoLabel(s.tipo).toLowerCase().includes(q) ||
        (STATUS_CANAL_LABEL[s.status] || '').toLowerCase().includes(q),
    )
  }, [solicitacoes, busca])

  const { ordenados, coluna, direcao, alternar } = useOrdenacao(filtradas, 'criada_em', 'desc')

  const linkPublico = empresa?.identificador_publico
    ? `${window.location.origin}/solicitar/${empresa.identificador_publico}`
    : ''

  async function handleCopiarLink() {
    try {
      await navigator.clipboard.writeText(linkPublico)
      setLinkCopiado(true)
      setTimeout(() => setLinkCopiado(false), 2000)
    } catch {
      // silencioso — usuário pode selecionar e copiar manualmente
    }
  }

  async function handleGerarLink() {
    setGerandoLink(true)
    try {
      const atualizada = await gerarESalvarIdentificadorPublico(user.empresaId, empresa?.nome)
      setEmpresa(atualizada)
    } finally {
      setGerandoLink(false)
    }
  }

  async function atualizar(id, patchFn) {
    const atualizada = await patchFn()
    setSolicitacoes((s) => s.map((x) => (x.id === id ? atualizada : x)))
    setDetalhe((d) => (d?.id === id ? atualizada : d))
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-indigo-900">Canal do Colaborador</h1>
        <p className="mt-2 max-w-2xl text-sm text-graphite-500">
          Um link público, sem necessidade de login, para o colaborador registrar diretamente um
          pedido de acessibilidade. Visível apenas para admin, RH e gestores.
        </p>
      </div>

      <div className="mb-8 rounded-lg border border-mist-300 bg-white p-5">
        <p className="text-sm font-semibold text-graphite-700">Link para compartilhar com os colaboradores</p>
        <p className="mt-1 text-sm text-graphite-500">
          Divulgue por e-mail interno, mural ou intranet. A plataforma não envia nada automaticamente.
        </p>
        {linkPublico ? (
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            <input
              readOnly
              value={linkPublico}
              onFocus={(e) => e.target.select()}
              className="min-w-0 flex-1 rounded-md border border-mist-400 bg-mist-50 px-3 py-2 text-sm text-graphite-700"
            />
            <Button shape="crm" as="button" size="sm" onClick={handleCopiarLink}>
              {linkCopiado ? 'Copiado!' : 'Copiar link'}
            </Button>
          </div>
        ) : (
          !carregando && (
            <Button shape="crm" as="button" size="sm" className="mt-3" disabled={gerandoLink} onClick={handleGerarLink}>
              {gerandoLink ? 'Gerando…' : 'Gerar link do canal'}
            </Button>
          )
        )}
      </div>

      {!carregando && solicitacoes.length > 0 && (
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome, tipo ou status…"
          className="mb-4 w-full max-w-md rounded-md border border-mist-400 px-4 py-2.5 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
        />
      )}

      {carregando ? (
        <p className="text-sm text-graphite-500">Carregando…</p>
      ) : solicitacoes.length === 0 ? (
        <EstadoVazio
          titulo="Nenhuma solicitação recebida pelo canal ainda"
          descricao="Assim que um colaborador registrar um pedido pelo link acima, ele aparece aqui."
        />
      ) : ordenados.length === 0 ? (
        <p className="text-sm text-graphite-500">Nenhuma solicitação encontrada para essa busca.</p>
      ) : (
        <TabelaContainer>
          <thead>
            <tr>
              <Th campo="protocolo" colunaAtiva={coluna} direcao={direcao} onOrdenar={alternar}>Protocolo</Th>
              <Th campo="nome_informado" colunaAtiva={coluna} direcao={direcao} onOrdenar={alternar}>Nome</Th>
              <Th>Tipo</Th>
              <Th campo="criada_em" colunaAtiva={coluna} direcao={direcao} onOrdenar={alternar}>Data</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-mist-200">
            {ordenados.map((s) => (
              <tr key={s.id} className="hover:bg-mist-50">
                <Td>
                  <button
                    onClick={() => setDetalhe(s)}
                    className="text-left font-medium text-indigo-800 hover:text-signal-700 hover:underline"
                  >
                    {s.protocolo}
                  </button>
                </Td>
                <Td>{s.nome_informado}</Td>
                <Td>{tipoLabel(s.tipo)}</Td>
                <Td>{new Date(s.criada_em).toLocaleDateString('pt-BR')}</Td>
                <Td>
                  <StatusPonto cor={STATUS_CANAL_PONTO_COR[s.status]}>
                    {STATUS_CANAL_LABEL[s.status]}
                  </StatusPonto>
                </Td>
              </tr>
            ))}
          </tbody>
        </TabelaContainer>
      )}

      {detalhe && (
        <DetalheCanalModal
          solicitacao={detalhe}
          empresaId={user.empresaId}
          onFechar={() => setDetalhe(null)}
          onAtualizar={atualizar}
        />
      )}
    </div>
  )
}

function DetalheCanalModal({ solicitacao: s, empresaId, onFechar, onAtualizar }) {
  const [observacao, setObservacao] = useState(s.observacao_interna || '')
  const [salvandoObservacao, setSalvandoObservacao] = useState(false)
  const [promovendo, setPromovendo] = useState(false)
  const [colaboradorId, setColaboradorId] = useState('')
  const [colaboradores, setColaboradores] = useState([])
  const proximoIndex = STATUS_CANAL_FLUXO.indexOf(s.status)
  const proximoStatus =
    proximoIndex >= 0 && proximoIndex < STATUS_CANAL_FLUXO.length - 1 ? STATUS_CANAL_FLUXO[proximoIndex + 1] : null
  const podePromover = ['aprovada', 'concluida'].includes(s.status) && !s.solicitacao_acessibilidade_id

  useEffect(() => {
    if (podePromover) {
      getColaboradoresAtivos(empresaId).then(setColaboradores)
    }
  }, [podePromover, empresaId])

  async function handleAvancar(novoStatus, extra) {
    await onAtualizar(s.id, () => atualizarStatusCanal(s.id, { status: novoStatus, ...extra }))
  }

  async function handleSalvarObservacao(e) {
    e.preventDefault()
    setSalvandoObservacao(true)
    try {
      await onAtualizar(s.id, () => atualizarStatusCanal(s.id, { observacaoInterna: observacao }))
    } finally {
      setSalvandoObservacao(false)
    }
  }

  async function handlePromover() {
    if (!colaboradorId) return
    setPromovendo(true)
    try {
      await promoverParaSolicitacao(s.id, { empresaId, colaboradorId, tipo: s.tipo, descricao: s.descricao })
      await onAtualizar(s.id, () => atualizarStatusCanal(s.id, {}))
    } finally {
      setPromovendo(false)
    }
  }

  function handleDescartar() {
    if (!confirm('Descartar esta solicitação? Ela deixa de contar nas estatísticas do canal.')) return
    onAtualizar(s.id, () => atualizarStatusCanal(s.id, { status: 'descartada' }))
    onFechar()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-graphite-900/50 px-5 py-8">
      <div className="max-h-full w-full max-w-lg overflow-auto rounded-lg bg-white p-6 shadow-pop">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-indigo-800">{s.protocolo}</h2>
            <p className="mt-0.5 text-sm text-graphite-500">
              {tipoLabel(s.tipo)} · recebida em {new Date(s.criada_em).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <StatusPonto cor={STATUS_CANAL_PONTO_COR[s.status]}>{STATUS_CANAL_LABEL[s.status]}</StatusPonto>
        </div>

        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="font-semibold text-graphite-700">Nome informado</dt>
            <dd className="text-graphite-700">{s.nome_informado}</dd>
          </div>
          <div>
            <dt className="font-semibold text-graphite-700">Descrição do pedido</dt>
            <dd className="whitespace-pre-wrap text-graphite-700">{s.descricao}</dd>
          </div>
        </dl>

        {s.status === 'recusada' && s.motivo_recusa && (
          <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            Motivo da recusa: {s.motivo_recusa}
          </p>
        )}

        {!['recusada', 'descartada', 'concluida'].includes(s.status) && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-mist-200 pt-4">
            {proximoStatus && (
              <Button shape="crm" as="button" size="sm" onClick={() => handleAvancar(proximoStatus)}>
                Avançar para "{STATUS_CANAL_LABEL[proximoStatus]}"
              </Button>
            )}
            <Button
              shape="crm"
              as="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                const motivo = prompt('Motivo da recusa (obrigatório):')
                if (!motivo || !motivo.trim()) return
                handleAvancar('recusada', { motivoRecusa: motivo.trim() })
              }}
            >
              Recusar
            </Button>
            <Button shape="crm" as="button" size="sm" variant="ghost" onClick={handleDescartar}>
              Descartar
            </Button>
          </div>
        )}

        {podePromover && (
          <div className="mt-4 border-t border-mist-200 pt-4">
            <p className="text-sm font-semibold text-graphite-700">Converter em registro de Solicitações</p>
            <p className="mt-1 text-sm text-graphite-500">
              Vincule este pedido a um colaborador cadastrado para acompanhar prazo e responsável em
              Solicitações, mantendo o vínculo com este protocolo.
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2.5">
              <select
                value={colaboradorId}
                onChange={(e) => setColaboradorId(e.target.value)}
                className="min-w-0 flex-1 rounded-md border border-mist-400 px-3 py-2 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
              >
                <option value="">Selecione o colaborador…</option>
                {colaboradores.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
              <Button shape="crm" as="button" size="sm" disabled={!colaboradorId || promovendo} onClick={handlePromover}>
                {promovendo ? 'Convertendo…' : 'Converter'}
              </Button>
            </div>
          </div>
        )}
        {s.solicitacao_acessibilidade_id && (
          <p className="mt-4 border-t border-mist-200 pt-4 text-sm text-graphite-500">
            Já convertido em um registro de Solicitações.
          </p>
        )}

        <form onSubmit={handleSalvarObservacao} className="mt-4 border-t border-mist-200 pt-4">
          <label className="block text-sm">
            <span className="font-semibold text-graphite-700">Observação interna</span>
            <span className="block text-xs text-graphite-400">Nunca é exibida na consulta pública do colaborador.</span>
            <textarea
              rows={3}
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-mist-400 px-3 py-2 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
            />
          </label>
          <Button shape="crm" as="button" type="submit" size="sm" className="mt-2.5" disabled={salvandoObservacao}>
            {salvandoObservacao ? 'Salvando…' : 'Salvar observação'}
          </Button>
        </form>

        <div className="mt-5 border-t border-mist-200 pt-4">
          <Button shape="crm" as="button" variant="ghost" onClick={onFechar}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  )
}
