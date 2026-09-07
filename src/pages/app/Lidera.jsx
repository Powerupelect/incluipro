import { kitsTematicos, kitsPorDeficiencia, accentStyles } from '../../lib/kits.js'

function GradeKits({ kits }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {kits.map((kit) => (
        <a
          key={kit.tema}
          href={kit.arquivo}
          download
          className="group relative flex flex-col rounded-lg border border-mist-300 bg-white p-6 transition-colors hover:border-signal-300"
        >
          {kit.novo && (
            <span className="absolute right-4 top-4 rounded bg-signal-600 px-2.5 py-1 text-[10px] font-bold text-white">
              Novo
            </span>
          )}
          <span className={`inline-block w-fit rounded-md px-3 py-1 text-xs font-semibold ${accentStyles[kit.accent]}`}>
            {kit.slides} slides
          </span>
          <h2 className="mt-4 font-display text-xl font-semibold text-indigo-800">
            {kit.tema}
          </h2>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-graphite-500">
            {kit.descricao}
          </p>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-700 group-hover:text-signal-700">
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 3v10m0 0l-3.5-3.5M10 13l3.5-3.5M4 16h12" />
            </svg>
            Baixar PDF
          </span>
        </a>
      ))}
    </div>
  )
}

export function Lidera() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-indigo-900">
          Treinamentos
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-graphite-500">
          Baixe os kits em slides, organizados por tema, e use nas suas reuniões e capacitações
          internas.
        </p>
      </div>

      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-graphite-400">
        Kits temáticos
      </h2>
      <GradeKits kits={kitsTematicos} />

      <h2 className="mb-4 mt-10 text-sm font-semibold uppercase tracking-wide text-graphite-400">
        Kits por tipo de deficiência
      </h2>
      <GradeKits kits={kitsPorDeficiencia} />

      <div className="mt-10 flex items-start gap-4 rounded-lg border border-mist-300 bg-mist-100 p-6">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-indigo-700 shadow-sm">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z" />
          </svg>
        </span>
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
