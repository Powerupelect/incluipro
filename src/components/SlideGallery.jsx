import { useEffect, useRef, useState } from 'react'

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
  const trilhoRef = useRef(null)
  const [podeRolarEsquerda, setPodeRolarEsquerda] = useState(false)
  const [podeRolarDireita, setPodeRolarDireita] = useState(false)

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

  useEffect(() => {
    const el = trilhoRef.current
    if (!el) return
    function atualizarSetas() {
      setPodeRolarEsquerda(el.scrollLeft > 4)
      setPodeRolarDireita(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
    }
    atualizarSetas()
    el.addEventListener('scroll', atualizarSetas, { passive: true })
    window.addEventListener('resize', atualizarSetas)
    return () => {
      el.removeEventListener('scroll', atualizarSetas)
      window.removeEventListener('resize', atualizarSetas)
    }
  }, [])

  function rolar(direcao) {
    const el = trilhoRef.current
    if (!el) return
    el.scrollBy({ left: direcao * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <>
      <div className="relative">
        <div
          ref={trilhoRef}
          className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2"
        >
          {SLIDES.map((slide, i) => (
            <button
              key={slide.src}
              onClick={() => setAtivo(i)}
              className="group relative w-72 shrink-0 snap-start overflow-hidden rounded-xl border border-mist-300 bg-white text-left shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-pop focus:outline-none focus:ring-2 focus:ring-signal-400 sm:w-80"
            >
              <div className="aspect-[16/9] overflow-hidden bg-mist-200">
                <img
                  src={slide.src}
                  alt={`Slide de exemplo — ${slide.categoria}: ${slide.titulo}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-indigo-900/85 to-transparent p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-signal-300">
                  {slide.categoria}
                </p>
                <p className="truncate text-base font-medium text-white">{slide.titulo}</p>
              </div>
            </button>
          ))}
        </div>

        {podeRolarEsquerda && (
          <button
            onClick={() => rolar(-1)}
            aria-label="Ver slides anteriores"
            className="absolute -left-5 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-mist-300 bg-white text-xl text-indigo-800 shadow-pop hover:bg-mist-100 sm:flex"
          >
            ‹
          </button>
        )}
        {podeRolarDireita && (
          <button
            onClick={() => rolar(1)}
            aria-label="Ver mais slides"
            className="absolute -right-5 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-mist-300 bg-white text-xl text-indigo-800 shadow-pop hover:bg-mist-100 sm:flex"
          >
            ›
          </button>
        )}
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
            <div className="flex items-center gap-3 border-t border-mist-300 bg-white px-6 py-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-signal-600">
                  {SLIDES[ativo].categoria} · {SLIDES[ativo].kit}
                </p>
                <p className="text-lg font-medium text-graphite-900">{SLIDES[ativo].titulo}</p>
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
