import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../lib/auth.jsx'
import { checkAccess } from '../../lib/api.js'
import { Button } from '../../components/ui/Button.jsx'
import { PLANO_LABEL } from '../../lib/plano.js'
import { exportBackup, importBackup } from '../../lib/backup.js'

export function Conta() {
  const { user } = useAuth()
  const [acesso, setAcesso] = useState(null)
  const [erro, setErro] = useState('')
  const fileInputRef = useRef(null)
  const [arquivoSelecionado, setArquivoSelecionado] = useState(null)
  const [importState, setImportState] = useState(null) // null | 'confirm' | 'done'
  const [erroImport, setErroImport] = useState('')

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
