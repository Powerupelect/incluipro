import { useEffect, useRef, useState } from 'react'

/** Galeria horizontal de imagens com lightbox — mesmo padrão de interação do SlideGallery.jsx
 * (usado na Home), generalizado pra aceitar qualquer conjunto de imagens com legenda. */
export function GaleriaHorizontal({ itens }) {
  const [ativo, setAtivo] = useState(null)
  const trilhoRef = useRef(null)
  const [podeRolarEsquerda, setPodeRolarEsquerda] = useState(false)
  const [podeRolarDireita, setPodeRolarDireita] = useState(false)

  useEffect(() => {
    if (ativo === null) return
    function onKey(e) {
      if (e.key === 'Escape') setAtivo(null)
      if (e.key === 'ArrowRight') setAtivo((i) => (i + 1) % itens.length)
      if (e.key === 'ArrowLeft') setAtivo((i) => (i - 1 + itens.length) % itens.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ativo, itens.length])

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

  if (itens.length === 1) {
    const item = itens[0]
    return (
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
        <img src={item.src} alt={item.alt} width={1280} height={800} className="w-full" />
        {item.legenda && (
          <p className="border-t border-white/10 px-5 py-3 text-sm text-indigo-200">{item.legenda}</p>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <div
        ref={trilhoRef}
        className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2"
      >
        {itens.map((item, i) => (
          <button
            key={item.src}
            onClick={() => setAtivo(i)}
            className="group relative w-80 shrink-0 snap-start overflow-hidden rounded-xl border border-white/10 bg-white/5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-white/25 focus:outline-none focus:ring-2 focus:ring-signal-400 sm:w-96"
          >
            <div className="aspect-[16/10] overflow-hidden bg-indigo-950">
              <img
                src={item.src}
                alt={item.alt}
                className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            {item.legenda && (
              <div className="border-t border-white/10 px-4 py-3">
                <p className="truncate text-sm text-indigo-200">{item.legenda}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {podeRolarEsquerda && (
        <button
          onClick={() => rolar(-1)}
          aria-label="Ver anteriores"
          className="absolute -left-5 top-[38%] hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-indigo-900 text-xl text-white shadow-pop hover:bg-indigo-800 sm:flex"
        >
          ‹
        </button>
      )}
      {podeRolarDireita && (
        <button
          onClick={() => rolar(1)}
          aria-label="Ver mais"
          className="absolute -right-5 top-[38%] hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-indigo-900 text-xl text-white shadow-pop hover:bg-indigo-800 sm:flex"
        >
          ›
        </button>
      )}

      {ativo !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/90 p-4 backdrop-blur-sm"
          onClick={() => setAtivo(null)}
        >
          <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-pop" onClick={(e) => e.stopPropagation()}>
            <img src={itens[ativo].src} alt={itens[ativo].alt} className="w-full" />
            {itens[ativo].legenda && (
              <div className="border-t border-mist-300 bg-white px-6 py-4">
                <p className="text-base font-medium text-graphite-900">{itens[ativo].legenda}</p>
              </div>
            )}
            <button
              onClick={() => setAtivo(null)}
              aria-label="Fechar"
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-graphite-700 shadow-card hover:bg-white hover:text-signal-600"
            >
              ✕
            </button>
            {itens.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setAtivo((i) => (i - 1 + itens.length) % itens.length)
                  }}
                  aria-label="Anterior"
                  className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-indigo-800 shadow-card hover:bg-white"
                >
                  ‹
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setAtivo((i) => (i + 1) % itens.length)
                  }}
                  aria-label="Próximo"
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-indigo-800 shadow-card hover:bg-white"
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
