import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { TabelaContainer, Th, Td, StatusPonto, EstadoVazio, useOrdenacao } from '../../components/ui/Table.jsx'
import {
  getColaboradores,
  criarColaborador,
  atualizarColaborador,
  excluirColaborador,
  contarVinculosColaborador,
} from '../../lib/colaboradores.js'

const FORM_INICIAL = {
  nome: '',
  cargo: '',
  tipoDeficiencia: '',
  dataAdmissao: '',
}

export function Colaboradores() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [colaboradores, setColaboradores] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null) // colaborador sendo editado, ou null pra criar
  const [form, setForm] = useState(FORM_INICIAL)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(null) // { colaborador, vinculos } | null

  useEffect(() => {
    if (!user?.empresaId) return
    let ativo = true
    setCarregando(true)
    getColaboradores(user.empresaId)
      .then((dados) => {
        if (ativo) setColaboradores(dados)
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })
    return () => {
      ativo = false
    }
  }, [user?.empresaId])

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    if (!q) return colaboradores
    return colaboradores.filter(
      (c) =>
        (c.nome || '').toLowerCase().includes(q) ||
        (c.cargo || '').toLowerCase().includes(q) ||
        (c.tipo_deficiencia || '').toLowerCase().includes(q),
    )
  }, [colaboradores, busca])

  const { ordenados, coluna, direcao, alternar } = useOrdenacao(filtrados, 'nome')

  function abrirNovo() {
    setEditando(null)
    setForm(FORM_INICIAL)
    setErro('')
    setModalAberto(true)
  }

  function abrirEdicao(c) {
    setEditando(c)
    setForm({
      nome: c.nome || '',
      cargo: c.cargo || '',
      tipoDeficiencia: c.tipo_deficiencia || '',
      dataAdmissao: c.data_admissao || '',
    })
    setErro('')
    setModalAberto(true)
  }

  async function handleSalvar(e) {
    e.preventDefault()
    if (!form.nome.trim()) {
      setErro('Informe o nome do colaborador.')
      return
    }
    setSalvando(true)
    setErro('')
    try {
      if (editando) {
        const atualizado = await atualizarColaborador(editando.id, {
          ...form,
          contaCota: editando.conta_cota,
          dataDesligamento: editando.data_desligamento,
        })
        setColaboradores((cols) => cols.map((c) => (c.id === atualizado.id ? atualizado : c)))
      } else {
        const criado = await criarColaborador({ empresaId: user.empresaId, ...form })
        setColaboradores((cols) => [...cols, criado])
      }
      setModalAberto(false)
    } catch {
      setErro('Não foi possível salvar agora. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  async function handlePedirExclusao(c) {
    const vinculos = await contarVinculosColaborador(c.id).catch(() => null)
    setConfirmandoExclusao({ colaborador: c, vinculos })
  }

  async function handleConfirmarExclusao() {
    if (!confirmandoExclusao) return
    const { colaborador } = confirmandoExclusao
    try {
      await excluirColaborador(colaborador.id, user.empresaId)
      setColaboradores((cols) => cols.filter((c) => c.id !== colaborador.id))
    } catch {
      setErro('Não foi possível excluir agora. Tente novamente.')
    } finally {
      setConfirmandoExclusao(null)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-indigo-900">Colaboradores</h1>
          <p className="mt-1 text-sm text-graphite-500">
            Cadastro da empresa — é a partir daqui que se cria uma avaliação, uma adaptação ou um documento.
          </p>
        </div>
        <Button shape="crm" as="button" onClick={abrirNovo}>
          + Novo colaborador
        </Button>
      </div>

      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por nome, cargo ou tipo de deficiência…"
        className="mb-4 w-full max-w-md rounded-md border border-mist-400 px-4 py-2.5 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
      />

      {carregando ? (
        <p className="text-sm text-graphite-500">Carregando…</p>
      ) : colaboradores.length === 0 ? (
        <EstadoVazio
          titulo="Nenhum colaborador cadastrado ainda"
          descricao="Cadastre os colaboradores da empresa aqui — é o ponto de partida para gerar avaliações, registrar adaptações e organizar documentos."
          acao={
            <Button shape="crm" as="button" onClick={abrirNovo}>
              Cadastrar o primeiro colaborador
            </Button>
          }
        />
      ) : ordenados.length === 0 ? (
        <p className="text-sm text-graphite-500">Nenhum colaborador encontrado para essa busca.</p>
      ) : (
        <TabelaContainer>
          <thead>
            <tr>
              <Th campo="nome" colunaAtiva={coluna} direcao={direcao} onOrdenar={alternar}>Nome</Th>
              <Th campo="cargo" colunaAtiva={coluna} direcao={direcao} onOrdenar={alternar}>Cargo</Th>
              <Th campo="tipo_deficiencia" colunaAtiva={coluna} direcao={direcao} onOrdenar={alternar}>Tipo de deficiência</Th>
              <Th>Status</Th>
              <Th align="right">Ações</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-mist-200">
            {ordenados.map((c) => (
              <tr key={c.id} className="hover:bg-mist-50">
                <Td>
                  <button
                    onClick={() => navigate(`/app/colaboradores/${c.id}`)}
                    className="text-left font-medium text-indigo-800 hover:text-signal-700 hover:underline"
                  >
                    {c.nome}
                  </button>
                </Td>
                <Td>{c.cargo || <span className="text-graphite-300">—</span>}</Td>
                <Td>{c.tipo_deficiencia || <span className="text-graphite-300">—</span>}</Td>
                <Td>
                  {c.data_desligamento ? (
                    <StatusPonto cor="neutro">Desligado</StatusPonto>
                  ) : (
                    <StatusPonto cor="signal">Ativo</StatusPonto>
                  )}
                </Td>
                <Td align="right">
                  <span className="inline-flex gap-3 text-xs font-semibold">
                    <button onClick={() => abrirEdicao(c)} className="text-indigo-700 hover:text-indigo-900">
                      Editar
                    </button>
                    <button onClick={() => handlePedirExclusao(c)} className="text-red-500 hover:text-red-700">
                      Excluir
                    </button>
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </TabelaContainer>
      )}

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-graphite-900/50 px-5">
          <form
            onSubmit={handleSalvar}
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-pop"
          >
            <h2 className="font-display text-lg font-semibold text-indigo-800">
              {editando ? 'Editar colaborador' : 'Novo colaborador'}
            </h2>
            <div className="mt-4 space-y-4">
              <label className="block text-sm">
                <span className="font-semibold text-graphite-700">Nome</span>
                <input
                  autoFocus
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                  className="mt-1.5 w-full rounded-md border border-mist-400 px-3 py-2 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
                />
              </label>
              <label className="block text-sm">
                <span className="font-semibold text-graphite-700">Cargo</span>
                <input
                  value={form.cargo}
                  onChange={(e) => setForm((f) => ({ ...f, cargo: e.target.value }))}
                  className="mt-1.5 w-full rounded-md border border-mist-400 px-3 py-2 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
                />
              </label>
              <label className="block text-sm">
                <span className="font-semibold text-graphite-700">Tipo de deficiência</span>
                <input
                  value={form.tipoDeficiencia}
                  onChange={(e) => setForm((f) => ({ ...f, tipoDeficiencia: e.target.value }))}
                  className="mt-1.5 w-full rounded-md border border-mist-400 px-3 py-2 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
                />
              </label>
              <label className="block text-sm">
                <span className="font-semibold text-graphite-700">Data de admissão</span>
                <input
                  type="date"
                  value={form.dataAdmissao}
                  onChange={(e) => setForm((f) => ({ ...f, dataAdmissao: e.target.value }))}
                  className="mt-1.5 w-full rounded-md border border-mist-400 px-3 py-2 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
                />
              </label>
            </div>
            {erro && <p className="mt-3 text-sm text-red-600">{erro}</p>}
            <div className="mt-5 flex gap-2.5">
              <Button shape="crm" as="button" type="submit" disabled={salvando}>
                {salvando ? 'Salvando…' : 'Salvar'}
              </Button>
              <Button shape="crm" as="button" type="button" variant="ghost" onClick={() => setModalAberto(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {confirmandoExclusao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-graphite-900/50 px-5">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-pop">
            <h2 className="font-display text-lg font-semibold text-indigo-800">
              Excluir {confirmandoExclusao.colaborador.nome}?
            </h2>
            <p className="mt-2 text-sm text-graphite-700">
              Esta ação remove o colaborador e não pode ser desfeita. Junto com ele, serão excluídos
              permanentemente:
            </p>
            <ul className="mt-3 space-y-1 text-sm text-graphite-700">
              <li>
                • {confirmandoExclusao.vinculos?.avaliacoes ?? '—'} avaliação(ões) / relatório(s)
              </li>
              <li>• {confirmandoExclusao.vinculos?.documentos ?? '—'} documento(s)</li>
              <li>• {confirmandoExclusao.vinculos?.solicitacoes ?? '—'} solicitação(ões) de adaptação</li>
            </ul>
            <div className="mt-6 flex gap-2.5">
              <Button shape="crm" as="button" variant="danger" onClick={handleConfirmarExclusao}>
                Excluir definitivamente
              </Button>
              <Button shape="crm" as="button" variant="ghost" onClick={() => setConfirmandoExclusao(null)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
