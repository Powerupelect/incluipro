import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../lib/auth.jsx'
import { TabelaContainer, Th, Td, StatusPonto, EstadoVazio, useOrdenacao } from '../../components/ui/Table.jsx'
import { getSolicitacoes, TIPOS_SOLICITACAO } from '../../lib/solicitacoesAcessibilidade.js'

/** Adaptações = solicitações que já chegaram a "concluído" — o que está de fato em vigor
 * para o colaborador hoje. Mesma tabela de dados de Solicitações, só que filtrada e sem o
 * fluxo de status (aqui é só o que já está pronto). */
export function Adaptacoes() {
  const { user } = useAuth()
  const [solicitacoes, setSolicitacoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')

  useEffect(() => {
    if (!user?.empresaId) return
    let ativo = true
    setCarregando(true)
    getSolicitacoes(user.empresaId)
      .then((dados) => {
        if (ativo) setSolicitacoes(dados)
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })
    return () => {
      ativo = false
    }
  }, [user?.empresaId])

  const adaptacoes = useMemo(() => {
    const hoje = new Date().toISOString().slice(0, 10)
    return solicitacoes
      .filter((s) => s.status === 'concluido')
      .map((s) => ({
        ...s,
        colaboradorNome: s.colaboradores?.nome || 'Colaborador',
        tipoLabel: TIPOS_SOLICITACAO.find((t) => t.id === s.tipo)?.label || s.tipo,
        prazoVencido: Boolean(s.prazo && s.prazo < hoje),
      }))
  }, [solicitacoes])

  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase()
    if (!q) return adaptacoes
    return adaptacoes.filter(
      (a) => a.colaboradorNome.toLowerCase().includes(q) || a.tipoLabel.toLowerCase().includes(q),
    )
  }, [adaptacoes, busca])

  const { ordenados, coluna, direcao, alternar } = useOrdenacao(filtradas, 'colaboradorNome')

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-indigo-900">Adaptações</h1>
        <p className="mt-1 text-sm text-graphite-500">
          Ajustes de acessibilidade já concluídos e em vigor — para acompanhar, abrir um novo pedido em Solicitações.
        </p>
      </div>

      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por colaborador ou tipo…"
        className="mb-4 w-full max-w-md rounded-xl border border-mist-400 px-4 py-2.5 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100"
      />

      {carregando ? (
        <p className="text-sm text-graphite-500">Carregando…</p>
      ) : adaptacoes.length === 0 ? (
        <EstadoVazio
          titulo="Nenhuma adaptação em vigor ainda"
          descricao="Assim que uma solicitação de adaptação for concluída em Solicitações, ela aparece aqui como um ajuste ativo do colaborador."
        />
      ) : ordenados.length === 0 ? (
        <p className="text-sm text-graphite-500">Nenhuma adaptação encontrada para essa busca.</p>
      ) : (
        <TabelaContainer>
          <thead>
            <tr>
              <Th campo="colaboradorNome" colunaAtiva={coluna} direcao={direcao} onOrdenar={alternar}>Colaborador</Th>
              <Th campo="tipoLabel" colunaAtiva={coluna} direcao={direcao} onOrdenar={alternar}>Tipo</Th>
              <Th campo="atualizado_em" colunaAtiva={coluna} direcao={direcao} onOrdenar={alternar}>Concluída em</Th>
              <Th>Revisão</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-mist-200">
            {ordenados.map((a) => (
              <tr key={a.id} className="hover:bg-mist-50">
                <Td>{a.colaboradorNome}</Td>
                <Td>{a.tipoLabel}</Td>
                <Td>{new Date(a.atualizado_em).toLocaleDateString('pt-BR')}</Td>
                <Td>
                  {!a.prazo ? (
                    <span className="text-graphite-300">—</span>
                  ) : a.prazoVencido ? (
                    <StatusPonto cor="red">Vencida em {new Date(a.prazo).toLocaleDateString('pt-BR')}</StatusPonto>
                  ) : (
                    <StatusPonto cor="signal">Prevista para {new Date(a.prazo).toLocaleDateString('pt-BR')}</StatusPonto>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </TabelaContainer>
      )}
    </div>
  )
}
