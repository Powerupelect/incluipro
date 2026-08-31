import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../lib/auth.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { getCargos, criarCargo, removerCargo } from '../../lib/cargos.js'
import { TIPOS_DEFICIENCIA } from '../../lib/accessibilityResources.js'
import { classificarCompatibilidade, STATUS_LABEL, STATUS_COR, DIMENSOES, NIVEIS_EXIGENCIA } from '../../lib/matrizCompatibilidade.js'

const CARGO_INICIAL = {
  nome: '',
  exigenciaVisao: 0,
  exigenciaAudicao: 0,
  exigenciaMobilidade: 0,
  exigenciaComunicacao: 0,
  exigenciaCognicao: 0,
  exigenciaEsforcoFisico: 0,
  exigenciaDeslocamento: 0,
  vagasAbertas: 0,
}

const CAMPO_POR_DIMENSAO = {
  visao: 'exigenciaVisao',
  audicao: 'exigenciaAudicao',
  mobilidade: 'exigenciaMobilidade',
  comunicacao: 'exigenciaComunicacao',
  cognicao: 'exigenciaCognicao',
  esforco_fisico: 'exigenciaEsforcoFisico',
  deslocamento: 'exigenciaDeslocamento',
}

export function MatrizCompatibilidade() {
  const { user } = useAuth()
  const [cargos, setCargos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [formAberto, setFormAberto] = useState(false)
  const [novoCargo, setNovoCargo] = useState(CARGO_INICIAL)
  const [salvando, setSalvando] = useState(false)
  const [celulaAberta, setCelulaAberta] = useState(null) // { cargoId, tipoId } | null

  useEffect(() => {
    if (!user?.empresaId) return
    setCarregando(true)
    getCargos(user.empresaId)
      .then(setCargos)
      .finally(() => setCarregando(false))
  }, [user?.empresaId])

  async function handleCriarCargo(e) {
    e.preventDefault()
    if (!novoCargo.nome.trim()) return
    setSalvando(true)
    try {
      const criado = await criarCargo(novoCargo, user.empresaId)
      setCargos((c) => [...c, criado].sort((a, b) => a.nome.localeCompare(b.nome)))
      setNovoCargo(CARGO_INICIAL)
      setFormAberto(false)
    } catch {
      // silencioso
    } finally {
      setSalvando(false)
    }
  }

  async function handleRemoverCargo(id) {
    if (!confirm('Remover este cargo da matriz?')) return
    await removerCargo(id).catch(() => {})
    setCargos((c) => c.filter((x) => x.id !== id))
  }

  const matriz = useMemo(
    () =>
      cargos.map((cargo) => ({
        cargo,
        classificacoes: TIPOS_DEFICIENCIA.map((tipo) => ({
          tipo,
          resultado: classificarCompatibilidade(cargo, tipo.id),
        })),
      })),
    [cargos],
  )

  const indicadores = useMemo(() => {
    let compativeis = 0
    let comAdaptacao = 0
    let vagasEmCargosCompativeis = 0
    for (const { cargo, classificacoes } of matriz) {
      const temCompativel = classificacoes.some((c) => c.resultado.status === 'compativel')
      compativeis += classificacoes.filter((c) => c.resultado.status === 'compativel').length
      comAdaptacao += classificacoes.filter((c) => c.resultado.status === 'requer_adaptacao').length
      if (temCompativel) vagasEmCargosCompativeis += cargo.vagas_abertas || 0
    }
    return { compativeis, comAdaptacao, vagasEmCargosCompativeis }
  }, [matriz])

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-signal-600">
            Matriz de compatibilidade
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-indigo-800">
            Cargo × tipo de deficiência
          </h1>
          <p className="mt-2 max-w-2xl text-graphite-500">
            Mapeie tecnicamente onde a inclusão cabe na sua empresa. Classificação de
            referência, calculada a partir do grau de exigência de cada cargo — não substitui
            avaliação técnica com a pessoa candidata.
          </p>
        </div>
        <Button as="button" onClick={() => setFormAberto((v) => !v)} size="lg">
          + Novo cargo
        </Button>
      </div>

      <div className="mb-8 grid gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-mist-300 bg-white p-5 shadow-card">
          <p className="font-display text-2xl font-semibold text-signal-700">{indicadores.compativeis}</p>
          <p className="text-sm text-graphite-500">combinações compatíveis sem ajuste</p>
        </div>
        <div className="rounded-2xl border border-mist-300 bg-white p-5 shadow-card">
          <p className="font-display text-2xl font-semibold text-amber-700">{indicadores.comAdaptacao}</p>
          <p className="text-sm text-graphite-500">combinações que requerem adaptação</p>
        </div>
        <div className="rounded-2xl border border-mist-300 bg-white p-5 shadow-card">
          <p className="font-display text-2xl font-semibold text-indigo-800">{indicadores.vagasEmCargosCompativeis}</p>
          <p className="text-sm text-graphite-500">vagas abertas em cargos compatíveis</p>
        </div>
      </div>

      {formAberto && (
        <form onSubmit={handleCriarCargo} className="mb-8 rounded-2xl border border-mist-300 bg-white p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold text-indigo-800">Novo cargo</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm sm:col-span-2">
              <span className="font-semibold text-graphite-700">Nome do cargo</span>
              <input
                required
                value={novoCargo.nome}
                onChange={(e) => setNovoCargo((c) => ({ ...c, nome: e.target.value }))}
                className="mt-1.5 w-full rounded-xl border border-mist-400 px-4 py-2.5 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
              />
            </label>
            <label className="text-sm">
              <span className="font-semibold text-graphite-700">Vagas em aberto</span>
              <input
                type="number"
                min="0"
                value={novoCargo.vagasAbertas}
                onChange={(e) => setNovoCargo((c) => ({ ...c, vagasAbertas: Number(e.target.value) }))}
                className="mt-1.5 w-full rounded-xl border border-mist-400 px-4 py-2.5 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
              />
            </label>
          </div>

          <p className="mt-5 text-sm font-semibold text-graphite-700">
            Grau de exigência de cada dimensão para este cargo
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DIMENSOES.map((dim) => {
              const campo = CAMPO_POR_DIMENSAO[dim.key]
              return (
                <label key={dim.key} className="text-sm">
                  <span className="text-graphite-700">{dim.label}</span>
                  <select
                    value={novoCargo[campo]}
                    onChange={(e) => setNovoCargo((c) => ({ ...c, [campo]: Number(e.target.value) }))}
                    className="mt-1.5 w-full rounded-xl border border-mist-400 px-3 py-2 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
                  >
                    {NIVEIS_EXIGENCIA.map((n) => (
                      <option key={n.valor} value={n.valor}>{n.label}</option>
                    ))}
                  </select>
                </label>
              )
            })}
          </div>

          <div className="mt-5 flex gap-2.5">
            <Button as="button" type="submit" disabled={salvando}>
              {salvando ? 'Salvando…' : 'Salvar cargo'}
            </Button>
            <Button as="button" type="button" variant="ghost" onClick={() => setFormAberto(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      <div className="rounded-2xl border border-mist-300 bg-white p-6 shadow-card">
        <h2 className="font-display text-lg font-semibold text-indigo-800">Matriz</h2>
        {carregando ? (
          <p className="mt-4 text-sm text-graphite-500">Carregando…</p>
        ) : cargos.length === 0 ? (
          <p className="mt-4 text-sm text-graphite-500">
            Nenhum cargo cadastrado ainda. Clique em "+ Novo cargo" para começar.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-graphite-500">Cargo</th>
                  {TIPOS_DEFICIENCIA.map((t) => (
                    <th key={t.id} className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-graphite-500">
                      {t.label}
                    </th>
                  ))}
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-mist-200">
                {matriz.map(({ cargo, classificacoes }) => (
                  <tr key={cargo.id}>
                    <td className="whitespace-nowrap px-3 py-2.5 font-medium text-graphite-900">{cargo.nome}</td>
                    {classificacoes.map(({ tipo, resultado }) => (
                      <td key={tipo.id} className="px-3 py-2.5">
                        <button
                          onClick={() =>
                            setCelulaAberta(
                              celulaAberta?.cargoId === cargo.id && celulaAberta?.tipoId === tipo.id
                                ? null
                                : { cargoId: cargo.id, tipoId: tipo.id },
                            )
                          }
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COR[resultado.status]}`}
                        >
                          {STATUS_LABEL[resultado.status]}
                        </button>
                        {celulaAberta?.cargoId === cargo.id && celulaAberta?.tipoId === tipo.id && (
                          <div className="mt-2 max-w-[200px] rounded-lg border border-mist-300 bg-mist-100 p-3 text-xs text-graphite-700">
                            {resultado.status === 'compativel' && <p>Sem restrições identificadas.</p>}
                            {resultado.status !== 'compativel' && resultado.dimensoesCriticas.length > 0 && (
                              <>
                                <p className="font-semibold">Dimensões críticas:</p>
                                <p>{resultado.dimensoesCriticas.map((d) => DIMENSOES.find((x) => x.key === d)?.label).join(', ')}</p>
                              </>
                            )}
                            {resultado.custoEstimado && (
                              <p className="mt-1">
                                Adaptação estimada: R$ {resultado.custoEstimado.min.toLocaleString('pt-BR')} a R${' '}
                                {resultado.custoEstimado.max.toLocaleString('pt-BR')}
                              </p>
                            )}
                          </div>
                        )}
                      </td>
                    ))}
                    <td className="px-3 py-2.5 text-right">
                      <button
                        onClick={() => handleRemoverCargo(cargo.id)}
                        className="text-xs font-semibold text-red-500 hover:text-red-700"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
