import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../lib/auth.jsx'
import { checkAccess } from '../../lib/api.js'
import { Button } from '../../components/ui/Button.jsx'
import { PLANO_LABEL } from '../../lib/plano.js'
import { exportBackup, importBackup } from '../../lib/backup.js'
import { getEmpresa, atualizarDadosCota, getUnidades, criarUnidade, removerUnidade } from '../../lib/empresa.js'
import { getMembros, convidarMembro, removerMembro, PAPEL_LABEL } from '../../lib/membros.js'
import { exportarTudoJson, exportarColaboradoresCsv } from '../../lib/exportacaoTotal.js'
import { montarDadosDossie } from '../../lib/dossie.js'
import { gerarDossieTecnicoPDF, gerarResumoExecutivoPDF } from '../../lib/pdfDossie.js'

export function Conta() {
  const { user } = useAuth()
  const [acesso, setAcesso] = useState(null)
  const [erro, setErro] = useState('')
  const fileInputRef = useRef(null)
  const [arquivoSelecionado, setArquivoSelecionado] = useState(null)
  const [importState, setImportState] = useState(null) // null | 'confirm' | 'done'
  const [erroImport, setErroImport] = useState('')

  const [dadosCota, setDadosCota] = useState({ totalFuncionarios: '', aprendizes: '', aposentadosInvalidez: '' })
  const [salvandoCota, setSalvandoCota] = useState(false)
  const [cotaSalva, setCotaSalva] = useState(false)
  const [erroCota, setErroCota] = useState('')

  const [unidades, setUnidades] = useState([])
  const [novaUnidade, setNovaUnidade] = useState('')
  const [salvandoUnidade, setSalvandoUnidade] = useState(false)

  const [membros, setMembros] = useState([])
  const [convite, setConvite] = useState({ email: '', papel: 'rh', unidadeId: '' })
  const [convidando, setConvidando] = useState(false)
  const [erroConvite, setErroConvite] = useState('')

  const [exportando, setExportando] = useState(false)
  const [gerandoDossie, setGerandoDossie] = useState(false)
  const [gerandoResumo, setGerandoResumo] = useState(false)
  const [erroDossie, setErroDossie] = useState('')

  const ehAdmin = user?.papel === 'admin'

  useEffect(() => {
    if (!user?.empresaId) return
    getUnidades(user.empresaId).then(setUnidades).catch(() => {})
    getMembros(user.empresaId).then(setMembros).catch(() => {})
  }, [user?.empresaId])

  async function handleCriarUnidade(e) {
    e.preventDefault()
    if (!novaUnidade.trim()) return
    setSalvandoUnidade(true)
    try {
      const criada = await criarUnidade({ empresaId: user.empresaId, nome: novaUnidade.trim() })
      setUnidades((u) => [...u, criada].sort((a, b) => a.nome.localeCompare(b.nome)))
      setNovaUnidade('')
    } catch {
      // silencioso — a unidade só não aparece na lista
    } finally {
      setSalvandoUnidade(false)
    }
  }

  async function handleRemoverUnidade(id) {
    if (!confirm('Remover esta unidade? Colaboradores vinculados ficam sem unidade.')) return
    try {
      await removerUnidade(id)
      setUnidades((u) => u.filter((x) => x.id !== id))
    } catch {
      // silencioso
    }
  }

  async function handleConvidar(e) {
    e.preventDefault()
    setErroConvite('')
    if (!convite.email.trim()) return
    setConvidando(true)
    try {
      await convidarMembro({
        empresaId: user.empresaId,
        email: convite.email,
        papel: convite.papel,
        unidadeId: convite.unidadeId || null,
      })
      const atualizados = await getMembros(user.empresaId)
      setMembros(atualizados)
      setConvite({ email: '', papel: 'rh', unidadeId: '' })
    } catch (err) {
      setErroConvite(err.message || 'Não foi possível convidar agora.')
    } finally {
      setConvidando(false)
    }
  }

  async function handleRemoverMembro(id) {
    if (!confirm('Remover o acesso desta pessoa à empresa?')) return
    try {
      await removerMembro(id)
      setMembros((m) => m.filter((x) => x.id !== id))
    } catch {
      // silencioso
    }
  }

  useEffect(() => {
    if (!user?.empresaId) return
    getEmpresa(user.empresaId)
      .then((empresa) => {
        if (!empresa) return
        setDadosCota({
          totalFuncionarios: empresa.total_funcionarios || '',
          aprendizes: empresa.aprendizes || '',
          aposentadosInvalidez: empresa.aposentados_invalidez || '',
        })
      })
      .catch(() => {})
  }, [user?.empresaId])

  async function handleSalvarCota(e) {
    e.preventDefault()
    setErroCota('')
    setSalvandoCota(true)
    try {
      await atualizarDadosCota(user.empresaId, {
        totalFuncionarios: Number(dadosCota.totalFuncionarios) || 0,
        aprendizes: Number(dadosCota.aprendizes) || 0,
        aposentadosInvalidez: Number(dadosCota.aposentadosInvalidez) || 0,
      })
      setCotaSalva(true)
      setTimeout(() => setCotaSalva(false), 2500)
    } catch {
      setErroCota('Não foi possível salvar agora. Tente novamente.')
    } finally {
      setSalvandoCota(false)
    }
  }

  function handleSelecionarArquivo(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setArquivoSelecionado(file)
    setImportState('confirm')
    setErroImport('')
  }

  async function handleConfirmarImport() {
    try {
      await importBackup(arquivoSelecionado, user?.empresaId)
      setImportState('done')
    } catch (err) {
      setErroImport(err.message)
      setImportState(null)
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function handleCancelarImport() {
    setImportState(null)
    setArquivoSelecionado(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  useEffect(() => {
    if (!user?.email) return
    checkAccess(user.email)
      .then(setAcesso)
      .catch(() => setErro('Não foi possível carregar os dados da assinatura agora.'))
  }, [user?.email])

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-signal-600">
          Minha conta
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-indigo-800">
          Dados da empresa e assinatura
        </h1>
      </div>

      <div className="rounded-2xl border border-mist-300 bg-white p-6 shadow-card sm:p-8">
        <h2 className="font-display text-lg font-semibold text-indigo-800">Empresa</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-graphite-300">
              Nome da empresa
            </dt>
            <dd className="mt-1 text-sm text-graphite-900">{user?.companyName}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-graphite-300">
              E-mail responsável
            </dt>
            <dd className="mt-1 text-sm text-graphite-900">{user?.email}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-mist-300 bg-white p-6 shadow-card sm:p-8">
        <h2 className="font-display text-lg font-semibold text-indigo-800">Quadro de funcionários</h2>
        <p className="mt-1 text-sm text-graphite-500">
          Usado para calcular a cota de PCD da empresa (Lei 8.213/1991). A cota é global — some
          matriz e filiais.
        </p>
        <form onSubmit={handleSalvarCota} className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="text-sm">
            <span className="font-semibold text-graphite-700">Total de funcionários (CLT)</span>
            <input
              type="number"
              min="0"
              value={dadosCota.totalFuncionarios}
              onChange={(e) => setDadosCota((d) => ({ ...d, totalFuncionarios: e.target.value }))}
              className="mt-1.5 w-full rounded-xl border border-mist-400 px-4 py-2.5 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
            />
          </label>
          <label className="text-sm">
            <span className="font-semibold text-graphite-700">Aprendizes</span>
            <input
              type="number"
              min="0"
              value={dadosCota.aprendizes}
              onChange={(e) => setDadosCota((d) => ({ ...d, aprendizes: e.target.value }))}
              className="mt-1.5 w-full rounded-xl border border-mist-400 px-4 py-2.5 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
            />
          </label>
          <label className="text-sm">
            <span className="font-semibold text-graphite-700">Aposentados por invalidez</span>
            <input
              type="number"
              min="0"
              value={dadosCota.aposentadosInvalidez}
              onChange={(e) => setDadosCota((d) => ({ ...d, aposentadosInvalidez: e.target.value }))}
              className="mt-1.5 w-full rounded-xl border border-mist-400 px-4 py-2.5 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
            />
          </label>
          <div className="flex items-center gap-3 sm:col-span-3">
            <Button as="button" type="submit" size="sm" disabled={salvandoCota}>
              {salvandoCota ? 'Salvando…' : 'Salvar'}
            </Button>
            {cotaSalva && <span className="text-sm font-semibold text-signal-700">✅ Salvo</span>}
            {erroCota && <span className="text-sm text-red-600">{erroCota}</span>}
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-mist-300 bg-white p-6 shadow-card sm:p-8">
        <h2 className="font-display text-lg font-semibold text-indigo-800">Unidades</h2>
        <p className="mt-1 text-sm text-graphite-500">
          A cota é global (matriz + filiais) — unidades servem para organizar e filtrar, não
          para calcular a cota separadamente.
        </p>
        {unidades.length > 0 && (
          <ul className="mt-4 divide-y divide-mist-200">
            {unidades.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="text-graphite-900">{u.nome}</span>
                {ehAdmin && (
                  <button
                    onClick={() => handleRemoverUnidade(u.id)}
                    className="text-xs font-semibold text-red-500 hover:text-red-700"
                  >
                    Remover
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        {ehAdmin && (
          <form onSubmit={handleCriarUnidade} className="mt-4 flex gap-2.5">
            <input
              value={novaUnidade}
              onChange={(e) => setNovaUnidade(e.target.value)}
              placeholder="Nome da unidade (ex: Filial São Paulo)"
              className="flex-1 rounded-xl border border-mist-400 px-4 py-2.5 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
            />
            <Button as="button" type="submit" size="sm" disabled={salvandoUnidade}>
              {salvandoUnidade ? 'Salvando…' : 'Adicionar'}
            </Button>
          </form>
        )}
      </div>

      <div className="rounded-2xl border border-mist-300 bg-white p-6 shadow-card sm:p-8">
        <h2 className="font-display text-lg font-semibold text-indigo-800">Equipe</h2>
        <p className="mt-1 text-sm text-graphite-500">
          Papéis de acesso: admin (tudo, inclusive convidar), RH (cria e edita tudo), gestor
          (apenas a própria unidade) e leitura (visualizar e baixar).
        </p>
        {membros.length > 0 && (
          <ul className="mt-4 divide-y divide-mist-200">
            {membros.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <div className="min-w-0">
                  <p className="truncate text-graphite-900">
                    {m.nome || m.email} {m.pendente && <span className="text-xs text-amber-600">(convite pendente)</span>}
                  </p>
                  <p className="text-xs text-graphite-400">{PAPEL_LABEL[m.papel] || m.papel}</p>
                </div>
                {ehAdmin && (
                  <button
                    onClick={() => handleRemoverMembro(m.id)}
                    className="shrink-0 text-xs font-semibold text-red-500 hover:text-red-700"
                  >
                    Remover
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        {ehAdmin && (
          <form onSubmit={handleConvidar} className="mt-4 flex flex-col gap-2.5 sm:flex-row">
            {erroConvite && <p className="text-sm text-red-600 sm:hidden">{erroConvite}</p>}
            <input
              type="email"
              value={convite.email}
              onChange={(e) => setConvite((c) => ({ ...c, email: e.target.value }))}
              placeholder="e-mail@empresa.com.br"
              className="flex-1 rounded-xl border border-mist-400 px-4 py-2.5 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
            />
            <select
              value={convite.papel}
              onChange={(e) => setConvite((c) => ({ ...c, papel: e.target.value }))}
              className="rounded-xl border border-mist-400 px-4 py-2.5 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
            >
              <option value="admin">Admin</option>
              <option value="rh">RH</option>
              <option value="gestor">Gestor</option>
              <option value="leitura">Leitura</option>
            </select>
            {convite.papel === 'gestor' && (
              <select
                value={convite.unidadeId}
                onChange={(e) => setConvite((c) => ({ ...c, unidadeId: e.target.value }))}
                className="rounded-xl border border-mist-400 px-4 py-2.5 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
              >
                <option value="">Selecione a unidade</option>
                {unidades.map((u) => (
                  <option key={u.id} value={u.id}>{u.nome}</option>
                ))}
              </select>
            )}
            <Button as="button" type="submit" size="sm" disabled={convidando}>
              {convidando ? 'Convidando…' : 'Convidar'}
            </Button>
          </form>
        )}
        {erroConvite && <p className="mt-2 hidden text-sm text-red-600 sm:block">{erroConvite}</p>}
      </div>

      <div className="rounded-2xl border border-mist-300 bg-white p-6 shadow-card sm:p-8">
        <h2 className="font-display text-lg font-semibold text-indigo-800">Documentos de saída</h2>
        <p className="mt-1 text-sm text-graphite-500">
          Dois documentos para públicos distintos: o dossiê técnico traz evidência verificável
          para a fiscalização (sem enfeite), e o resumo executivo é uma página para a diretoria.
          Seções sem dado registrado no sistema aparecem marcadas para preenchimento manual.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            as="button"
            type="button"
            variant="ghost"
            size="sm"
            disabled={gerandoDossie}
            onClick={async () => {
              setErroDossie('')
              setGerandoDossie(true)
              try {
                const dados = await montarDadosDossie(user.empresaId)
                await gerarDossieTecnicoPDF(dados)
              } catch {
                setErroDossie('Não foi possível gerar o dossiê agora. Tente novamente.')
              } finally {
                setGerandoDossie(false)
              }
            }}
          >
            {gerandoDossie ? 'Gerando…' : 'Baixar dossiê técnico'}
          </Button>
          <Button
            as="button"
            type="button"
            variant="ghost"
            size="sm"
            disabled={gerandoResumo}
            onClick={async () => {
              setErroDossie('')
              setGerandoResumo(true)
              try {
                const dados = await montarDadosDossie(user.empresaId)
                gerarResumoExecutivoPDF(dados)
              } catch {
                setErroDossie('Não foi possível gerar o resumo agora. Tente novamente.')
              } finally {
                setGerandoResumo(false)
              }
            }}
          >
            {gerandoResumo ? 'Gerando…' : 'Baixar resumo executivo'}
          </Button>
        </div>
        {erroDossie && <p className="mt-3 text-sm text-red-600">{erroDossie}</p>}
      </div>

      <div className="rounded-2xl border border-mist-300 bg-white p-6 shadow-card sm:p-8">
        <h2 className="font-display text-lg font-semibold text-indigo-800">Exportação total</h2>
        <p className="mt-1 text-sm text-graphite-500">
          Exporte todos os dados da empresa a qualquer momento — sem aprisionamento.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            as="button"
            type="button"
            variant="ghost"
            size="sm"
            disabled={exportando}
            onClick={async () => {
              setExportando(true)
              try {
                await exportarTudoJson(user.empresaId)
              } finally {
                setExportando(false)
              }
            }}
          >
            Exportar tudo (JSON)
          </Button>
          <Button
            as="button"
            type="button"
            variant="ghost"
            size="sm"
            disabled={exportando}
            onClick={async () => {
              setExportando(true)
              try {
                await exportarColaboradoresCsv(user.empresaId)
              } finally {
                setExportando(false)
              }
            }}
          >
            Exportar colaboradores (CSV)
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-mist-300 bg-white p-6 shadow-card sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-indigo-800">Plano atual</h2>
            <p className="mt-1 text-sm text-graphite-500">
              {acesso?.admin
                ? 'Acesso administrativo'
                : acesso?.plano
                  ? PLANO_LABEL[acesso.plano] || acesso.plano
                  : 'Carregando…'}
            </p>
          </div>
          {acesso?.liberado ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-signal-50 px-4 py-2 text-xs font-semibold text-signal-700">
              ✅ Acesso ativo
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700">
              Verificando assinatura…
            </span>
          )}
        </div>
        {erro && <p className="mt-4 text-xs text-red-600">{erro}</p>}
        <p className="mt-4 text-xs text-graphite-300">
          Pagamento processado com segurança pela Hotmart. Precisa trocar de plano ou renovar?
        </p>
        <Button to="/assinatura" variant="ghost" size="sm" className="mt-3">
          Ver plano
        </Button>
      </div>

      <div className="rounded-2xl border border-mist-300 bg-white p-6 shadow-card sm:p-8">
        <h2 className="font-display text-lg font-semibold text-indigo-800">Backup de dados</h2>
        <p className="mt-1 text-sm text-graphite-500">
          Seus relatórios já ficam salvos com segurança na IncluiPro. Este backup é uma cópia
          extra em JSON — útil para levar seus dados para outro lugar, se precisar.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            as="button"
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => exportBackup(user?.empresaId)}
          >
            Exportar backup
          </Button>
          <Button
            as="button"
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            Importar backup
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleSelecionarArquivo}
          />
        </div>

        {importState === 'confirm' && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-semibold">
              Isso vai adicionar os relatórios do arquivo importado aos que você já tem (pode
              gerar duplicados se importar o mesmo arquivo mais de uma vez). Confirma?
            </p>
            <div className="mt-3 flex gap-2">
              <Button as="button" type="button" size="sm" onClick={handleConfirmarImport}>
                Confirmar importação
              </Button>
              <Button as="button" type="button" variant="ghost" size="sm" onClick={handleCancelarImport}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {importState === 'done' && (
          <p className="mt-4 text-sm font-semibold text-signal-700">
            ✅ Backup importado. Atualize a página para ver os dados restaurados.
          </p>
        )}

        {erroImport && <p className="mt-4 text-sm text-red-600">{erroImport}</p>}
      </div>

      <div className="rounded-2xl border border-mist-300 bg-white p-6 shadow-card sm:p-8">
        <h2 className="font-display text-lg font-semibold text-indigo-800">Suporte</h2>
        <p className="mt-1 text-sm text-graphite-500">
          Dúvidas sobre sua conta, relatórios ou kits de treinamento? Fale com a gente em{' '}
          <a href="mailto:contato@incluipro.com" className="font-semibold text-signal-700 hover:text-signal-800">
            contato@incluipro.com
          </a>
          .
        </p>
      </div>
    </div>
  )
}
