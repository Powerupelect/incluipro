import { useRef, useState } from 'react'
import { Button } from './ui/Button.jsx'
import {
  gerarModeloCsv,
  parseCsv,
  validarLinhasColaboradores,
  importarColaboradores,
} from '../lib/csvImport.js'

/** Modal de importação de colaboradores por CSV — usado em Colaboradores e em Avaliações,
 * já que uma empresa pode cadastrar o quadro de colaboradores antes de gerar qualquer
 * avaliação (colaborador não depende de ter uma avaliação para existir). */
export function ImportarColaboradoresModal({ open, onClose, empresaId, onImportado }) {
  const [previaImportacao, setPreviaImportacao] = useState(null)
  const [importandoCsv, setImportandoCsv] = useState(false)
  const [resultadoImportacao, setResultadoImportacao] = useState(null)
  const csvInputRef = useRef(null)

  if (!open) return null

  function handleBaixarModeloCsv() {
    const blob = new Blob([gerarModeloCsv()], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'incluipro-modelo-colaboradores.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function handleSelecionarCsv(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const linhas = parseCsv(String(reader.result))
      setPreviaImportacao(validarLinhasColaboradores(linhas))
      setResultadoImportacao(null)
    }
    reader.readAsText(file)
  }

  async function handleConfirmarImportacaoCsv() {
    if (!previaImportacao?.validas?.length || !empresaId) return
    setImportandoCsv(true)
    try {
      const resultado = await importarColaboradores(previaImportacao.validas, empresaId)
      setResultadoImportacao(resultado)
      setPreviaImportacao(null)
      if (resultado.colaboradoresCriados.length > 0) onImportado?.(resultado.colaboradoresCriados)
    } catch {
      setResultadoImportacao({ importados: 0, falhas: [{ linha: 0, motivo: 'Erro inesperado na importação.' }], colaboradoresCriados: [] })
    } finally {
      setImportandoCsv(false)
      if (csvInputRef.current) csvInputRef.current.value = ''
    }
  }

  function handleFechar() {
    setPreviaImportacao(null)
    setResultadoImportacao(null)
    if (csvInputRef.current) csvInputRef.current.value = ''
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-graphite-900/50 px-5">
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-pop">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold text-indigo-800">
            Importar colaboradores por CSV
          </h2>
          <button onClick={handleFechar} className="text-graphite-400 hover:text-graphite-700">
            Fechar
          </button>
        </div>

        {!previaImportacao && !resultadoImportacao && (
          <>
            <p className="mt-2 text-sm text-graphite-500">
              Colunas esperadas: nome (obrigatório), cargo, tipo_deficiencia,
              observacoes_condicao, unidade. Os colaboradores são criados diretamente — não é
              preciso ter uma avaliação para cada um.
            </p>
            <button
              onClick={handleBaixarModeloCsv}
              className="mt-3 text-sm font-semibold text-signal-700 hover:text-signal-800"
            >
              Baixar planilha modelo
            </button>
            <div className="mt-4">
              <input ref={csvInputRef} type="file" accept=".csv,text/csv" onChange={handleSelecionarCsv} />
            </div>
          </>
        )}

        {previaImportacao && (
          <div className="mt-4">
            <p className="text-sm font-semibold text-graphite-900">
              Pré-visualização: {previaImportacao.validas.length} linha
              {previaImportacao.validas.length !== 1 ? 's' : ''} pronta
              {previaImportacao.validas.length !== 1 ? 's' : ''} para importar
              {previaImportacao.erros.length > 0 &&
                `, ${previaImportacao.erros.length} com erro`}
              .
            </p>

            {previaImportacao.validas.length > 0 && (
              <div className="mt-3 max-h-64 overflow-y-auto rounded-md border border-mist-300">
                <table className="w-full text-left text-xs">
                  <thead className="bg-mist-100 text-graphite-500">
                    <tr>
                      <th className="px-3 py-2">Linha</th>
                      <th className="px-3 py-2">Nome</th>
                      <th className="px-3 py-2">Cargo</th>
                      <th className="px-3 py-2">Tipo de deficiência</th>
                      <th className="px-3 py-2">Unidade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-mist-200">
                    {previaImportacao.validas.map((v) => (
                      <tr key={v.linha}>
                        <td className="px-3 py-2 text-graphite-400">{v.linha}</td>
                        <td className="px-3 py-2 text-graphite-900">{v.dados.nome}</td>
                        <td className="px-3 py-2 text-graphite-700">{v.dados.cargo}</td>
                        <td className="px-3 py-2 text-graphite-700">{v.dados.tipoDeficiencia}</td>
                        <td className="px-3 py-2 text-graphite-700">{v.dados.unidadeNome}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {previaImportacao.erros.length > 0 && (
              <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {previaImportacao.erros.map((e, i) => (
                  <p key={i}>Linha {e.linha}: {e.motivo}</p>
                ))}
              </div>
            )}

            <div className="mt-4 flex gap-2.5">
              <Button
                shape="crm"
                as="button"
                onClick={handleConfirmarImportacaoCsv}
                disabled={importandoCsv || previaImportacao.validas.length === 0}
              >
                {importandoCsv ? 'Importando…' : `Importar ${previaImportacao.validas.length} colaborador(es)`}
              </Button>
              <Button shape="crm" as="button" variant="ghost" onClick={handleFechar}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {resultadoImportacao && (
          <div className="mt-4">
            <p className="text-sm font-semibold text-signal-700">
              {resultadoImportacao.importados} colaborador(es) importado(s).
            </p>
            {resultadoImportacao.falhas.length > 0 && (
              <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {resultadoImportacao.falhas.map((f, i) => (
                  <p key={i}>Linha {f.linha}: {f.motivo}</p>
                ))}
              </div>
            )}
            <Button shape="crm" as="button" className="mt-4" onClick={handleFechar}>
              Fechar
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
