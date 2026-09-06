import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../lib/auth.jsx'
import { getReports } from '../../lib/reports.js'
import { getEmpresa, contarPcdAtivos } from '../../lib/empresa.js'
import { kits } from '../../lib/kits.js'
import { Button } from '../../components/ui/Button.jsx'
import { PainelCota } from '../../components/PainelCota.jsx'
import { getDocumentos } from '../../lib/documentos.js'
import { getSolicitacoes } from '../../lib/solicitacoesAcessibilidade.js'
import { StatusPonto, EstadoVazio } from '../../components/ui/Table.jsx'

function calcularPendencias(documentos, solicitacoes) {
  const hoje = new Date().toISOString().slice(0, 10)
  const pendencias = []

  const laudosSemBarreira = documentos.filter((d) => d.tipo === 'laudo' && !d.descreve_barreira_funcional)
  if (laudosSemBarreira.length > 0) {
    pendencias.push({
      cor: 'amber',
      texto: `${laudosSemBarreira.length} laudo${laudosSemBarreira.length !== 1 ? 's' : ''} sem descrição de barreira funcional`,
      link: '/app/documentos',
    })
  }

  const adaptacoesVencidas = solicitacoes.filter(
    (s) => s.prazo && s.prazo < hoje && s.status !== 'concluido' && s.status !== 'recusado',
  )
  if (adaptacoesVencidas.length > 0) {
    pendencias.push({
      cor: 'red',
      texto: `${adaptacoesVencidas.length} solicitação${adaptacoesVencidas.length !== 1 ? 'ões' : ''} de adaptação com prazo vencido`,
      link: '/app/solicitacoes',
    })
  }

  const documentosVencidos = documentos.filter((d) => d.data_validade && d.data_validade < hoje)
  if (documentosVencidos.length > 0) {
    pendencias.push({
      cor: 'amber',
      texto: `${documentosVencidos.length} documento${documentosVencidos.length !== 1 ? 's' : ''} vencido${documentosVencidos.length !== 1 ? 's' : ''}`,
      link: '/app/documentos',
    })
  }

  return pendencias
}

export function Dashboard() {
  const { user } = useAuth()
  const [historico, setHistorico] = useState([])
  const [empresa, setEmpresa] = useState(null)
  const [pcdAtivos, setPcdAtivos] = useState(0)
  const [pendencias, setPendencias] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!user?.empresaId) return
    let ativo = true
    setCarregando(true)
    Promise.all([
      getReports(user.empresaId),
      getEmpresa(user.empresaId),
      contarPcdAtivos(user.empresaId),
      getDocumentos(user.empresaId),
      getSolicitacoes(user.empresaId),
    ])
      .then(([relatorios, empresaData, count, documentos, solicitacoes]) => {
        if (!ativo) return
        setHistorico(relatorios)
        setEmpresa(empresaData)
        setPcdAtivos(count)
        setPendencias(calcularPendencias(documentos, solicitacoes))
      })
      .catch(() => {})
      .finally(() => {
        if (ativo) setCarregando(false)
      })
    return () => {
      ativo = false
    }
  }, [user?.empresaId])

  const recentes = historico.slice(0, 5)
  const novosKits = kits.filter((k) => k.novo)

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold text-indigo-900">Painel</h1>
        <Button to="/app/avalia" size="lg">+ Nova avaliação</Button>
      </div>

      {carregando ? (
        <p className="text-sm text-graphite-500">Carregando…</p>
      ) : (
        <>
          <PainelCota empresa={empresa} pcdAtivos={pcdAtivos} />

          <div className="mt-6 rounded-2xl border border-mist-300 bg-white p-6">
            <h2 className="text-base font-semibold text-graphite-900">Pendências</h2>
            {pendencias && pendencias.length > 0 ? (
              <ul className="mt-3 space-y-2.5">
                {pendencias.map((p, i) => (
                  <li key={i}>
                    {p.link ? (
                      <Link to={p.link} className="hover:underline">
                        <StatusPonto cor={p.cor}>{p.texto}</StatusPonto>
                      </Link>
                    ) : (
                      <StatusPonto cor={p.cor}>{p.texto}</StatusPonto>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-graphite-500">Nenhuma pendência identificada no momento.</p>
            )}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-2xl border border-mist-300 bg-white p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-graphite-900">Avaliações recentes</h2>
                <Link to="/app/avalia" className="text-xs font-semibold text-indigo-700 hover:text-signal-600">
                  Ver todas →
                </Link>
              </div>

              {recentes.length === 0 ? (
                <div className="mt-4">
                  <EstadoVazio
                    titulo="Nenhuma avaliação gerada ainda"
                    descricao="Comece uma nova avaliação para ver o resumo aqui."
                    acao={<Button to="/app/avalia" size="sm">Começar agora</Button>}
                  />
                </div>
              ) : (
                <ul className="mt-4 divide-y divide-mist-200">
                  {recentes.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-graphite-900">
                          {item.candidato}
                        </p>
                        <p className="truncate text-xs text-graphite-400">
                          {item.cargo || 'Cargo não informado'} ·{' '}
                          {new Date(item.updatedAt || item.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Link
                        to="/app/avalia"
                        className="shrink-0 text-xs font-semibold text-indigo-700 hover:text-signal-600"
                      >
                        Abrir
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-mist-300 bg-white p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-graphite-900">Treinamentos</h2>
                <Link to="/app/lidera" className="text-xs font-semibold text-indigo-700 hover:text-signal-600">
                  Ver todos →
                </Link>
              </div>
              <ul className="mt-4 space-y-3">
                {kits.map((kit) => (
                  <li key={kit.tema} className="flex items-center justify-between gap-3 rounded-xl border border-mist-200 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-graphite-900">{kit.tema}</p>
                      <p className="text-xs text-graphite-400">{kit.slides} slides</p>
                    </div>
                    {kit.novo && (
                      <span className="shrink-0 rounded-full bg-signal-600 px-2.5 py-1 text-[10px] font-bold text-white">
                        Novo
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              {novosKits.length > 0 && (
                <p className="mt-3 text-xs text-graphite-400">{novosKits.length} kit(s) novo(s) na biblioteca.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
