export function LegalDoc({ titulo, atualizadoEm, aviso, children }) {
  return (
    <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-signal-600">Documento legal</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-indigo-800">{titulo}</h1>
      <p className="mt-2 text-sm text-graphite-400">Última atualização: {atualizadoEm}</p>
      {aviso && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          {aviso}
        </div>
      )}
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-graphite-700">{children}</div>
    </section>
  )
}

export function Secao({ titulo, children }) {
  return (
    <div>
      <h2 className="font-display text-lg font-semibold text-indigo-800">{titulo}</h2>
      <div className="mt-2 space-y-2">{children}</div>
    </div>
  )
}
