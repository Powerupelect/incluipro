import { useMemo, useState } from 'react'

/** Ordenação por clique no cabeçalho — compartilhada entre todas as tabelas da área logada,
 * pra manter o mesmo comportamento (clique alterna asc/desc, troca de coluna reinicia em asc). */
export function useOrdenacao(dados, colunaInicial, direcaoInicial = 'asc') {
  const [coluna, setColuna] = useState(colunaInicial)
  const [direcao, setDirecao] = useState(direcaoInicial)

  function alternar(campo) {
    if (campo === coluna) {
      setDirecao((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setColuna(campo)
      setDirecao('asc')
    }
  }

  const ordenados = useMemo(() => {
    if (!coluna) return dados
    const copia = [...dados]
    copia.sort((a, b) => {
      const va = a[coluna]
      const vb = b[coluna]
      if (va == null && vb == null) return 0
      if (va == null) return 1
      if (vb == null) return -1
      if (typeof va === 'number' && typeof vb === 'number') return direcao === 'asc' ? va - vb : vb - va
      return direcao === 'asc'
        ? String(va).localeCompare(String(vb), 'pt-BR')
        : String(vb).localeCompare(String(va), 'pt-BR')
    })
    return copia
  }, [dados, coluna, direcao])

  return { ordenados, coluna, direcao, alternar }
}

export function TabelaContainer({ children }) {
  return (
    <div className="max-h-[70vh] overflow-auto rounded-2xl border border-mist-300 bg-white">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  )
}

export function Th({ children, campo, colunaAtiva, direcao, onOrdenar, align = 'left', className = '' }) {
  const ativo = campo && campo === colunaAtiva
  return (
    <th
      className={`sticky top-0 z-10 whitespace-nowrap border-b border-mist-300 bg-mist-100 px-4 py-2.5 text-xs font-semibold text-graphite-500 ${
        align === 'right' ? 'text-right' : 'text-left'
      } ${campo ? 'cursor-pointer select-none hover:text-graphite-700' : ''} ${className}`}
      onClick={campo ? () => onOrdenar(campo) : undefined}
    >
      <span className={`inline-flex items-center gap-1 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
        {children}
        {ativo && <span aria-hidden="true" className="text-graphite-400">{direcao === 'asc' ? '↑' : '↓'}</span>}
      </span>
    </th>
  )
}

export function Td({ children, align = 'left', className = '' }) {
  return (
    <td
      className={`px-4 py-3 text-graphite-700 ${align === 'right' ? 'text-right tabular-nums' : 'text-left'} ${className}`}
    >
      {children}
    </td>
  )
}

/** Ponto colorido + texto — status nunca comunicado só por cor (WCAG 1.4.1). */
const PONTO_COR = {
  neutro: 'bg-graphite-300',
  signal: 'bg-signal-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
}

export function StatusPonto({ cor = 'neutro', children }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-graphite-700">
      <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${PONTO_COR[cor]}`} />
      {children}
    </span>
  )
}

export function EstadoVazio({ titulo, descricao, acao }) {
  return (
    <div className="rounded-2xl border border-dashed border-mist-400 bg-mist-100 px-6 py-12 text-center">
      <p className="font-display text-base font-semibold text-graphite-900">{titulo}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-graphite-500">{descricao}</p>
      {acao && <div className="mt-5">{acao}</div>}
    </div>
  )
}
