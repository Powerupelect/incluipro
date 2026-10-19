import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { TabelaContainer, Th, Td, StatusPonto, EstadoVazio, useOrdenacao } from '../../components/ui/Table.jsx'
import { ImportarColaboradoresModal } from '../../components/ImportarColaboradoresModal.jsx'
import {
  getColaboradores,
  criarColaborador,
  atualizarColaborador,
  excluirColaborador,
  contarVinculosColaborador,
  registrarDesligamento,
  reverterDesligamento,
  TIPOS_DESLIGAMENTO,
  rotuloDesligamento,
} from '../../lib/colaboradores.js'

const hojeLocal = () => new Date().toLocaleDateString('sv')
const formatarData = (iso) => (iso ? new Date(`${iso}T12:00`).toLocaleDateString('pt-BR') : '')
const CAMPO =
  'mt-1.5 w-full rounded-md border border-mist-400 px-3 py-2 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100'

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
  const [importModalAberto, setImportModalAberto] = useState(false)
  const [destaqueId, setDestaqueId] = useState(null)
  const linhasRef = useRef({})
  const [filtroStatus, setFiltroStatus] = useState('ativos')
  const [saida, setSaida] = useState(null) // colaborador cuja saída está sendo registrada
  const [formSaida, setFormSaida] = useState({ data: '', tipo: '', motivo: '' })
  const [salvandoSaida, setSalvandoSaida] = useState(false)
  const [erroSaida, setErroSaida] = useState('')

  useEffect(() => {
    if (!destaqueId) return
    linhasRef.current[destaqueId]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    const timeout = setTimeout(() => setDestaqueId(null), 2500)
    return () => clearTimeout(timeout)
  }, [destaqueId])

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

  const contagem = useMemo(
    () => ({
      ativos: colaboradores.filter((c) => !c.data_desligamento).length,
      desligados: colaboradores.filter((c) => c.data_desligamento).length,
      todos: colaboradores.length,
    }),
    [colaboradores],
  )

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    const porStatus = colaboradores.filter((c) =>
      filtroStatus === 'ativos' ? !c.data_desligamento : filtroStatus === 'desligados' ? c.data_desligamento : true,
    )
    if (!q) return porStatus
    return porStatus.filter(
      (c) =>
        (c.nome || '').toLowerCase().includes(q) ||
        (c.cargo || '').toLowerCase().includes(q) ||
        (c.tipo_deficiencia || '').toLowerCase().includes(q),
    )
  }, [colaboradores, busca, filtroStatus])

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
    if (!form.tipoDeficiencia.trim()) {
      setErro('Informe o tipo de deficiência — ele conta na cota de PCD.')
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
        setDestaqueId(atualizado.id)
      } else {
        const criado = await criarColaborador({ empresaId: user.empresaId, ...form })
        setColaboradores((cols) => [...cols, criado])
        setDestaqueId(criado.id)
      }
      setModalAberto(false)
    } catch {
      setErro('Não foi possível salvar agora. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  function abrirSaida(c) {
    setConfirmandoExclusao(null)
    setSaida(c)
    setFormSaida({ data: hojeLocal(), tipo: '', motivo: '' })
    setErroSaida('')
  }

  async function handleRegistrarSaida(e) {
    e.preventDefault()
    if (!formSaida.data) return setErroSaida('Informe a data da saída.')
    if (formSaida.data > hojeLocal()) return setErroSaida('A data da saída não pode ser no futuro.')
    if (saida.data_admissao && formSaida.data < saida.data_admissao) {
      return setErroSaida('A data da saída não pode ser anterior à admissão.')
    }
    if (!formSaida.tipo) return setErroSaida('Selecione o tipo de saída.')
    setSalvandoSaida(true)
    setErroSaida('')
    try {
      const atualizado = await registrarDesligamento(saida.id, formSaida)
      setColaboradores((cols) => cols.map((c) => (c.id === atualizado.id ? atualizado : c)))
      setSaida(null)
    } catch {
      setErroSaida('Não foi possível registrar agora. Tente novamente.')
    } finally {
      setSalvandoSaida(false)
    }
  }

  async function handleReverterSaida(c) {
    if (!window.confirm(`Desfazer a saída de ${c.nome}? A pessoa volta a contar na cota.`)) return
    try {
      const atualizado = await reverterDesligamento(c.id)
      setColaboradores((cols) => cols.map((x) => (x.id === atualizado.id ? atualizado : x)))
      setDestaqueId(atualizado.id)
    } catch {
      setErro('Não foi possível desfazer agora. Tente novamente.')
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
            {carregando
              ? 'Cadastro da empresa.'
              : `${colaboradores.length} colaborador${colaboradores.length !== 1 ? 'es' : ''} cadastrado${colaboradores.length !== 1 ? 's' : ''}.`}
            {' '}É a partir daqui que se cria uma avaliação, uma adaptação ou um documento.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button shape="crm" as="button" variant="ghost" onClick={() => setImportModalAberto(true)}>
            Importar por CSV
          </Button>
          <Button shape="crm" as="button" onClick={abrirNovo}>
            + Novo colaborador
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome, cargo ou tipo de deficiência…"
          className="w-full max-w-md rounded-md border border-mist-400 px-4 py-2.5 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
        />
        <div className="inline-flex rounded-md border border-mist-400 bg-white p-0.5 text-sm" role="tablist" aria-label="Filtrar por situação">
          {[
            ['ativos', 'Ativos'],
            ['desligados', 'Desligados'],
            ['todos', 'Todos'],
          ].map(([id, rotulo]) => (
            <button
              key={id}
              role="tab"
              aria-selected={filtroStatus === id}
              onClick={() => setFiltroStatus(id)}
              className={`rounded px-3 py-1.5 font-medium transition-colors ${filtroStatus === id ? 'bg-indigo-900 text-white' : 'text-graphite-500 hover:text-indigo-900'}`}
            >
              {rotulo} <span className={`tabular-nums ${filtroStatus === id ? 'text-white/70' : 'text-graphite-400'}`}>{contagem[id]}</span>
            </button>
          ))}
        </div>
      </div>

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
        <p className="text-sm text-graphite-500">
          {busca.trim()
            ? 'Nenhum colaborador encontrado para essa busca.'
            : filtroStatus === 'desligados'
              ? 'Nenhuma saída registrada.'
              : 'Nenhum colaborador ativo.'}
        </p>
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
              <tr
                key={c.id}
                ref={(el) => {
                  linhasRef.current[c.id] = el
                }}
                className={`hover:bg-mist-50 ${c.id === destaqueId ? 'bg-signal-50 transition-colors duration-[2000ms]' : 'transition-colors duration-[2000ms]'}`}
              >
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
                    <div>
                      <StatusPonto cor="neutro">Desligado em {formatarData(c.data_desligamento)}</StatusPonto>
                      {c.tipo_desligamento && (
                        <p className="mt-0.5 pl-4 text-xs text-graphite-400" title={c.motivo_desligamento || undefined}>
                          {rotuloDesligamento(c.tipo_desligamento)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <StatusPonto cor="signal">Ativo</StatusPonto>
                  )}
                </Td>
                <Td align="right">
                  <span className="inline-flex gap-3 text-xs font-semibold">
                    <button onClick={() => abrirEdicao(c)} className="text-indigo-700 hover:text-indigo-900">
                      Editar
                    </button>
                    {c.data_desligamento ? (
                      <button onClick={() => handleReverterSaida(c)} className="text-graphite-500 hover:text-indigo-900">
                        Desfazer saída
                      </button>
                    ) : (
                      <button onClick={() => abrirSaida(c)} className="text-amber-700 hover:text-amber-900">
                        Registrar saída
                      </button>
                    )}
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
                  required
                  value={form.tipoDeficiencia}
                  onChange={(e) => setForm((f) => ({ ...f, tipoDeficiencia: e.target.value }))}
                  className="mt-1.5 w-full rounded-md border border-mist-400 px-3 py-2 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
                />
                <span className="mt-1 block text-xs text-graphite-400">
                  Obrigatório — colaboradores cadastrados aqui contam na cota de PCD.
                </span>
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
              <Button shape="crm" as="button" type="button" variant="ghost" disabled={salvando} onClick={() => setModalAberto(false)}>
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
            </ul>
            {confirmandoExclusao.vinculos?.solicitacoes > 0 && (
              <p className="mt-3 text-sm text-graphite-700">
                As {confirmandoExclusao.vinculos.solicitacoes} solicitação(ões) de adaptação dele(a)
                não serão apagadas — ficam preservadas em Solicitações, só sem o vínculo com o
                colaborador.
              </p>
            )}
            {!confirmandoExclusao.colaborador.data_desligamento && (
              <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-graphite-700">
                A pessoa saiu da empresa? Prefira <strong>registrar a saída</strong>: ela deixa de contar
                na cota e o histórico fica guardado para auditorias.
                <button
                  type="button"
                  onClick={() => abrirSaida(confirmandoExclusao.colaborador)}
                  className="mt-2 block font-semibold text-amber-800 hover:text-amber-900"
                >
                  Registrar saída em vez de excluir →
                </button>
              </div>
            )}
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

      {saida && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-graphite-900/50 px-5">
          <form onSubmit={handleRegistrarSaida} className="w-full max-w-md rounded-lg bg-white p-6 shadow-pop">
            <h2 className="font-display text-lg font-semibold text-indigo-800">Registrar saída de {saida.nome}</h2>
            <p className="mt-1 text-sm text-graphite-500">
              A pessoa deixa de contar na cota, mas o histórico (avaliações, documentos e solicitações) continua
              guardado.
            </p>
            <div className="mt-4 space-y-4">
              <label className="block text-sm">
                <span className="font-semibold text-graphite-700">Data da saída</span>
                <input
                  type="date"
                  required
                  max={hojeLocal()}
                  min={saida.data_admissao || undefined}
                  value={formSaida.data}
                  onChange={(e) => setFormSaida((f) => ({ ...f, data: e.target.value }))}
                  className={CAMPO}
                />
              </label>
              <label className="block text-sm">
                <span className="font-semibold text-graphite-700">Tipo de saída</span>
                <select
                  required
                  value={formSaida.tipo}
                  onChange={(e) => setFormSaida((f) => ({ ...f, tipo: e.target.value }))}
                  className={`${CAMPO} bg-white`}
                >
                  <option value="">Selecione…</option>
                  {TIPOS_DESLIGAMENTO.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
              {TIPOS_DESLIGAMENTO.find((t) => t.id === formSaida.tipo)?.exigeSubstituto && (
                <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
                  <strong>Atenção à Lei 8.213/91, art. 93, §1º:</strong> a dispensa sem justa causa de pessoa com
                  deficiência (ou o término de contrato por prazo determinado acima de 90 dias) só pode ocorrer após a
                  contratação de outro profissional com deficiência ou reabilitado. O Painel vai lembrar disso.
                </p>
              )}
              <label className="block text-sm">
                <span className="font-semibold text-graphite-700">
                  Motivo <span className="font-normal text-graphite-400">(opcional)</span>
                </span>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={formSaida.motivo}
                  onChange={(e) => setFormSaida((f) => ({ ...f, motivo: e.target.value }))}
                  placeholder="Ex.: mudança de cidade, nova oportunidade…"
                  className={CAMPO}
                />
                <span className="mt-1 block text-xs text-graphite-400">
                  Evite dados de saúde ou detalhes pessoais desnecessários.
                </span>
              </label>
            </div>
            {erroSaida && <p className="mt-3 text-sm text-red-600">{erroSaida}</p>}
            <div className="mt-5 flex gap-2.5">
              <Button shape="crm" as="button" type="submit" disabled={salvandoSaida}>
                {salvandoSaida ? 'Registrando…' : 'Registrar saída'}
              </Button>
              <Button shape="crm" as="button" type="button" variant="ghost" disabled={salvandoSaida} onClick={() => setSaida(null)}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      <ImportarColaboradoresModal
        open={importModalAberto}
        onClose={() => setImportModalAberto(false)}
        empresaId={user?.empresaId}
        onImportado={(novos) => setColaboradores((cols) => [...cols, ...novos])}
      />
    </div>
  )
}
