const kits = [
  {
    tema: 'Fundamentos de Inclusão',
    descricao: 'O básico que toda liderança precisa saber sobre inclusão de PCD no trabalho.',
    slides: 18,
    accent: 'signal',
  },
  {
    tema: 'Comunicação e Postura',
    descricao: 'Como se comunicar de forma respeitosa e eficaz com colaboradores PCD.',
    slides: 14,
    accent: 'volt',
  },
  {
    tema: 'Gestão do Dia a Dia',
    descricao: 'Rotinas, adaptações e acompanhamento de desempenho de equipes inclusivas.',
    slides: 22,
    accent: 'amber',
  },
  {
    tema: 'Casos Práticos',
    descricao: 'Situações reais e como líderes devem agir diante de cada uma delas.',
    slides: 16,
    accent: 'signal',
  },
]

const accentStyles = {
  signal: 'bg-signal-50 text-signal-700',
  volt: 'bg-volt-50 text-volt-700',
  amber: 'bg-amber-50 text-amber-700',
}

function handleDownload(tema) {
  // TODO: conectar com armazenamento real dos arquivos (ex: S3, Supabase Storage).
  const blob = new Blob(
    [`Kit de treinamento: ${tema}\n\nEste é um arquivo placeholder do IncluiPro Lidera.`],
    { type: 'text/plain' },
  )
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `kit-${tema.toLowerCase().replace(/\s+/g, '-')}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

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
          <div key={kit.tema} className="flex flex-col rounded-2xl border border-mist-300 bg-white p-6 shadow-card">
            <span className={`inline-block w-fit rounded-full px-3 py-1 text-xs font-semibold ${accentStyles[kit.accent]}`}>
              {kit.slides} slides
            </span>
            <h2 className="mt-4 font-display text-xl font-semibold text-indigo-800">
              {kit.tema}
            </h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-graphite-500">
              {kit.descricao}
            </p>
            <button
              onClick={() => handleDownload(kit.tema)}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-800"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 3v10m0 0l-3.5-3.5M10 13l3.5-3.5M4 16h12" />
              </svg>
              Baixar kit
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
