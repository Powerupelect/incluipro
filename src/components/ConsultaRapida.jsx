import { TIPOS_DEFICIENCIA } from '../lib/accessibilityResources.js'

export function ConsultaRapida({
  open,
  onClose,
  categoriaAtiva,
  onSelectCategoria,
  recursosSelecionados,
  onToggleRecurso,
}) {
  const tipo = TIPOS_DEFICIENCIA.find((t) => t.id === categoriaAtiva) || TIPOS_DEFICIENCIA[0]

  return (
    <>
      {open && (
        <button
          aria-label="Fechar Consulta Rápida"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-graphite-900/40 backdrop-blur-[1px]"
        />
      )}

      <aside
        className={`fixed right-0 top-0 z-50 flex h-svh w-full max-w-sm transform flex-col border-l border-mist-300 bg-white shadow-pop transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-mist-300 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-volt-600">
              Consulta Rápida
            </p>
            <h2 className="font-display text-lg font-semibold text-indigo-800">
              Recursos de acessibilidade
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-mist-400 text-graphite-500 hover:border-signal-400 hover:text-signal-600"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-mist-300 px-5 py-3">
          {TIPOS_DEFICIENCIA.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelectCategoria(t.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                t.id === categoriaAtiva
                  ? 'border-signal-600 bg-signal-600 text-white'
                  : 'border-mist-400 text-graphite-700 hover:border-signal-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <p className="text-sm font-semibold text-graphite-900">
            Recursos e ajustes sugeridos — {tipo.label}
          </p>
          <ul className="mt-3 space-y-2.5">
            {tipo.recursos.map((recurso) => {
              const selecionado = recursosSelecionados.includes(recurso)
              return (
                <li
                  key={recurso}
                  className={`flex items-start justify-between gap-3 rounded-xl border p-3.5 text-sm ${
                    selecionado ? 'border-signal-300 bg-signal-50' : 'border-mist-300'
                  }`}
                >
                  <span className="text-graphite-700">{recurso}</span>
                  <button
                    onClick={() => onToggleRecurso(recurso)}
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      selecionado
                        ? 'bg-signal-600 text-white'
                        : 'border border-mist-400 text-indigo-700 hover:border-signal-400'
                    }`}
                  >
                    {selecionado ? '✓ Adicionado' : '+ Adicionar'}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="border-t border-mist-300 bg-mist-100 px-5 py-4">
          <p className="text-xs leading-relaxed text-graphite-500">
            <strong className="text-graphite-700">Aviso:</strong> lista de referência geral.
            Confirme sempre com o candidato suas necessidades reais antes de finalizar o
            relatório.
          </p>
        </div>
      </aside>
    </>
  )
}
