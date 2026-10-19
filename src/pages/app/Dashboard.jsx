import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../lib/auth.jsx'
import { getReports } from '../../lib/reports.js'
import { getEmpresa, getUnidades } from '../../lib/empresa.js'
import { kits } from '../../lib/kits.js'
import { Button } from '../../components/ui/Button.jsx'
import { PainelCota } from '../../components/PainelCota.jsx'
import { getDocumentos } from '../../lib/documentos.js'
import { getSolicitacoes } from '../../lib/solicitacoesAcessibilidade.js'
import { getSolicitacoesCanal } from '../../lib/canalColaborador.js'
import { EstadoVazio } from '../../components/ui/Table.jsx'
import { getColaboradores } from '../../lib/colaboradores.js'
import { montarPainel } from '../../lib/painelAnalitico.js'
import {
  Cartao,
  HeroCota,
  Indicador,
  EvolucaoQuadro,
  PerfilRosca,
  OperacaoSolicitacoes,
  Alertas,
  Retencao,
  PorUnidade,
} from '../../components/painel/PainelAnalitico.jsx'

const HOJE_FORMATADO = new Date().toLocaleDateString('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

function iniciais(nome) {
  const partes = (nome || '').trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

export function Dashboard() {
  const { user } = useAuth()
  const [bruto, setBruto] = useState(null)

  useEffect(() => {
    if (!user?.empresaId) return
    let ativo = true
    const id = user.empresaId
    Promise.all([
      getReports(id),
      getEmpresa(id),
      getDocumentos(id),
      getSolicitacoes(id),
      getSolicitacoesCanal(id),
      getColaboradores(id).catch(() => []),
      getUnidades(id).catch(() => []),
    ])
      .then(([avaliacoes, empresa, documentos, solicitacoesInternas, solicitacoesCanal, colaboradores, unidades]) => {
        if (ativo) setBruto({ avaliacoes, empresa, documentos, solicitacoesInternas, solicitacoesCanal, colaboradores, unidades })
      })
      .catch(() => {
        if (ativo) setBruto({ avaliacoes: [], empresa: null, documentos: [], solicitacoesInternas: [], solicitacoesCanal: [], colaboradores: [], unidades: [] })
      })
    return () => {
      ativo = false
    }
  }, [user?.empresaId])

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-indigo-900">Painel</h1>
          <p className="mt-1 text-sm capitalize text-graphite-500">
            {user?.companyName ? `${user.companyName} · ` : ''}
            {HOJE_FORMATADO}
          </p>
        </div>
        <Button shape="crm" to="/app/avalia" size="lg">+ Nova avaliação</Button>
      </div>

      {bruto ? <PainelConteudo bruto={bruto} nomeEmpresa={user?.companyName} /> : <EsqueletoPainel />}
    </div>
  )
}

function EsqueletoPainel() {
  return (
    <div className="animate-pulse space-y-6" aria-label="Carregando painel">
      <div className="h-56 rounded-lg bg-indigo-900/10" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-36 rounded-lg bg-white" />
        ))}
      </div>
      <div className="h-80 rounded-lg bg-white" />
    </div>
  )
}

/** Layout do painel a partir dos dados brutos — separado para poder ser exibido com dados de exemplo. */
export function PainelConteudo({ bruto, nomeEmpresa }) {
  const d = useMemo(() => montarPainel(bruto), [bruto])
  const recentes = bruto.avaliacoes.slice(0, 5)
  const novosKits = kits.filter((k) => k.novo)
  const kitsDestaque = [...novosKits, ...kits.filter((k) => !k.novo)].slice(0, 5)
  const cotaDevida = d.cota?.cotaDevida || 0

  return (
    <div className="space-y-6">
      <HeroCota dados={d} nomeEmpresa={nomeEmpresa} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Indicador
          icone="documento"
          titulo="Documentação em dia"
          valor={d.documentacao.pct !== null ? d.documentacao.pct : '—'}
          sufixo={d.documentacao.pct !== null ? '%' : ''}
          progresso={d.documentacao.pct}
          tom={d.documentacao.pct === null || d.documentacao.pct >= 80 ? 'signal' : d.documentacao.pct >= 50 ? 'amber' : 'red'}
          detalhe={`${d.documentacao.comLaudoValido} de ${d.documentacao.total} com laudo válido`}
          to="/app/documentos"
        />
        <Indicador
          icone="relogio"
          titulo="Laudos a vencer"
          valor={d.laudosVencendo}
          tom={d.laudosVencendo > 0 ? 'amber' : 'signal'}
          detalhe="nos próximos 90 dias"
          to="/app/documentos"
        />
        <Indicador
          icone="caixa"
          titulo="Solicitações abertas"
          valor={d.solicitacoes.abertas}
          tom={d.solicitacoes.prazosVencidos > 0 ? 'red' : d.solicitacoes.abertas > 0 ? 'amber' : 'signal'}
          detalhe={
            d.solicitacoes.tempoMedioDias !== null
              ? `atendimento médio em ${d.solicitacoes.tempoMedioDias} dia${d.solicitacoes.tempoMedioDias !== 1 ? 's' : ''}`
              : 'aguardando retorno do RH'
          }
          to="/app/solicitacoes"
        />
        <Indicador
          icone="plano"
          titulo="Planos de integração"
          valor={d.planos.pct !== null ? d.planos.pct : '—'}
          sufixo={d.planos.pct !== null ? '%' : ''}
          progresso={d.planos.pct}
          tom="indigo"
          detalhe={`${d.planos.com} de ${d.planos.total} colaboradores com plano`}
          to="/app/avalia"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.75fr_1fr]">
        <EvolucaoQuadro serie={d.serie} cota={cotaDevida} semDataAdmissao={d.semDataAdmissao} />
        <PerfilRosca perfil={d.perfil} total={d.ativos} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.75fr_1fr]">
        <OperacaoSolicitacoes solicitacoes={d.solicitacoes} />
        <Alertas alertas={d.alertas} />
      </div>

      <div className={`grid gap-6 ${d.porUnidade.length ? 'lg:grid-cols-3' : 'lg:grid-cols-[1fr_2fr]'}`}>
        <Retencao retencao={d.retencao} ativos={d.ativos} />
        {d.porUnidade.length > 0 && <PorUnidade porUnidade={d.porUnidade} />}
        <PainelCota empresa={bruto.empresa} pcdAtivos={d.ativos} apenasCalculo />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Cartao titulo="Avaliações recentes" acao={<Link to="/app/avalia" className="text-xs font-semibold text-indigo-700 hover:text-signal-600">Ver todas →</Link>}>
          {recentes.length === 0 ? (
            <div className="mt-4">
              <EstadoVazio
                titulo="Nenhuma avaliação gerada ainda"
                descricao="Comece uma nova avaliação para ver o resumo aqui."
                acao={<Button shape="crm" to="/app/avalia" size="sm">Começar agora</Button>}
              />
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-mist-200">
              {recentes.map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700">
                    {iniciais(item.candidato)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-graphite-900">{item.candidato}</p>
                    <p className="truncate text-xs text-graphite-400">
                      {item.cargo || 'Cargo não informado'} · {new Date(item.updatedAt || item.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Link to="/app/avalia" className="shrink-0 text-xs font-semibold text-indigo-700 hover:text-signal-600">
                    Abrir
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Cartao>

        <Cartao titulo="Treinamentos" acao={<Link to="/app/lidera" className="text-xs font-semibold text-indigo-700 hover:text-signal-600">Ver todos →</Link>}>
          <ul className="mt-4 space-y-2.5">
            {kitsDestaque.map((kit) => (
              <li key={kit.tema} className="flex items-center gap-3 rounded-md border border-mist-200 px-4 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-volt-50 text-volt-700">
                  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 6h16M4 6v12a1 1 0 001 1h6M4 6l2-3h12l2 3M14 19l3 2v-6.5M17 14.5l3-2" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-graphite-900">{kit.tema}</p>
                  <p className="text-xs text-graphite-400">{kit.slides} slides</p>
                </div>
                {kit.novo && <span className="shrink-0 rounded-full bg-signal-600 px-2.5 py-0.5 text-[10px] font-bold text-white">Novo</span>}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-graphite-400">
            {kits.length} kits na biblioteca{novosKits.length > 0 ? ` · ${novosKits.length} novos` : ''}
          </p>
        </Cartao>
      </div>
    </div>
  )
}
