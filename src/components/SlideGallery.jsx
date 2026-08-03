import { useEffect, useState } from 'react'

const SLIDES = [
  {
    src: '/previews/gallery/capa-fundamentos.png',
    categoria: 'Capa',
    titulo: 'Fundamentos da Inclusão',
    kit: 'Fundamentos de Inclusão',
  },
  {
    src: '/previews/gallery/objetivos-inclusao.png',
    categoria: 'Objetivos',
    titulo: 'O que é inclusão?',
    kit: 'Fundamentos de Inclusão',
  },
  {
    src: '/previews/gallery/legislacao.png',
    categoria: 'Legislação',
    titulo: 'Lei de Cotas e obrigações legais',
    kit: 'Fundamentos de Inclusão',
  },
  {
    src: '/previews/gallery/comunicacao-postura.png',
    categoria: 'Comunicação',
    titulo: 'Diga assim, evite assim',
    kit: 'Comunicação e Postura',
  },
  {
    src: '/previews/gallery/casos-praticos.png',
    categoria: 'Casos Práticos',
    titulo: 'Ajuda em excesso, sem pedir',
    kit: 'Casos Práticos',
  },
  {
    src: '/previews/gallery/plano-de-acao.png',
    categoria: 'Plano de Ação',
    titulo: 'Plano de Acomodação Individual',
    kit: 'Gestão do Dia a Dia',
  },
  {
    src: '/previews/gallery/checklist.png',
    categoria: 'Checklist',
    titulo: 'A checklist mensal do gestor inclusivo',
    kit: 'Gestão do Dia a Dia',
  },
]

export function SlideGallery() {
  const [ativo, setAtivo] = useState(null)

  useEffect(() => {
    if (ativo === null) return
    function onKey(e) {
      if (e.key === 'Escape') setAtivo(null)
      if (e.key === 'ArrowRight') setAtivo((i) => (i + 1) % SLIDES.length)
      if (e.key === 'ArrowLeft') setAtivo((i) => (i - 1 + SLIDES.length) % SLIDES.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ativo])

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            onClick={() => setAtivo(i)}
            className="group relative overflow-hidden rounded-xl border border-mist-300 bg-white text-left shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-pop focus:outline-none focus:ring-2 focus:ring-signal-400"
          >
            <div className="aspect-[16/9] overflow-hidden bg-mist-200">
              <img
                src={slide.src}
                alt={`Slide de exemplo — ${slide.categoria}: ${slide.titulo}`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-indigo-900/85 to-transparent p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-signal-300">
                {slide.categoria}
              </p>
              <p className="truncate text-xs font-medium text-white">{slide.titulo}</p>
            </div>
          </button>
        ))}
      </div>

      {ativo !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/80 p-4 backdrop-blur-sm"
          onClick={() => setAtivo(null)}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={SLIDES[ativo].src}
              alt={`Slide ampliado — ${SLIDES[ativo].categoria}: ${SLIDES[ativo].titulo}`}
              className="w-full"
            />
            <button
              onClick={() => setAtivo(null)}
              aria-label="Fechar"
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-graphite-700 shadow-card hover:bg-white hover:text-signal-600"
            >
              ✕
            </button>
            <div className="flex items-center gap-3 border-t border-mist-300 bg-white px-5 py-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-signal-600">
                  {SLIDES[ativo].categoria} · {SLIDES[ativo].kit}
                </p>
                <p className="text-sm font-medium text-graphite-900">{SLIDES[ativo].titulo}</p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setAtivo((i) => (i - 1 + SLIDES.length) % SLIDES.length)
              }}
              aria-label="Slide anterior"
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-indigo-800 shadow-card hover:bg-white"
            >
              ‹
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setAtivo((i) => (i + 1) % SLIDES.length)
              }}
              aria-label="Próximo slide"
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-indigo-800 shadow-card hover:bg-white"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </>
  )
}
