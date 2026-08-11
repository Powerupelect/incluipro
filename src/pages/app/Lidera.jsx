import { kits, accentStyles } from '../../lib/kits.js'

export function Lidera() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-volt-600">
          IncluiPro Lidera
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-indigo-800">
          Kits de treinamento para lideranças
        </h1>
        <p className="mt-2 max-w-2xl text-graphite-500">
          Baixe os kits em slides, organizados por tema, e use nas suas reuniões e capacitações
          internas.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {kits.map((kit) => (
          <div key={kit.tema} className="relative flex flex-col rounded-2xl border border-mist-300 bg-white p-6 shadow-card">
            {kit.novo && (
              <span className="absolute right-4 top-4 rounded-full bg-signal-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                Novo
              </span>
            )}
            <span className={`inline-block w-fit rounded-full px-3 py-1 text-xs font-semibold ${accentStyles[kit.accent]}`}>
              {kit.slides} slides
            </span>
            <h2 className="mt-4 font-display text-xl font-semibold text-indigo-800">
              {kit.tema}
            </h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-graphite-500">
              {kit.descricao}
            </p>
            <a
              href={kit.arquivo}
              download
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-800"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 3v10m0 0l-3.5-3.5M10 13l3.5-3.5M4 16h12" />
              </svg>
              Baixar PDF
            </a>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-start gap-4 rounded-2xl border border-volt-200 bg-volt-50 p-6">
        <svg viewBox="0 0 24 24" className="mt-0.5 h-6 w-6 shrink-0 text-volt-600" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z" />
        </svg>
        <div>
          <p className="font-display text-base font-semibold text-indigo-800">
            Precisa de um kit sob medida?
          </p>
          <p className="mt-1 text-sm text-graphite-700">
            Também desenvolvemos <strong>Kit Personalizado</strong>, com conteúdo específico para
            a realidade da sua empresa, sob consulta e orçamento. Fale com a equipe IncluiPro
            para solicitar.
          </p>
        </div>
      </div>
    </div>
  )
}
