import { useEffect, useRef, useState } from 'react'

// Seis documentos dispersos que convergem para uma pilha central enquanto a seção
// escurece — conta a transição de "processos manuais espalhados" para "dossiê único".
// Fundo e documentos usam animation-timeline: view() quando o navegador suporta
// (reversível ao rolar de volta, o que é aceitável para o visual). O texto usa um
// disparo único via IntersectionObserver — ele não deve repetir ao rolar de volta.
const DOCUMENTOS = [
  { tx: -220, ty: -90, rot: -14, label: 'Avaliação', accent: '#12a594' },
  { tx: 200, ty: -70, rot: 10, label: 'Laudo médico', accent: '#1e2a4a' },
  { tx: -180, ty: 60, rot: 8, label: 'Comprovante', accent: '#12a594' },
  { tx: 190, ty: 90, rot: -9, label: 'CID', accent: '#1e2a4a' },
  { tx: -80, ty: -130, rot: 5, label: 'Relatório', accent: '#12a594' },
  { tx: 90, ty: 120, rot: -6, label: 'Comprovante', accent: '#1e2a4a' },
]

export function MomentoDossie() {
  const sectionRef = useRef(null)
  const [suportaViewTimeline, setSuportaViewTimeline] = useState(true)
  const [visualAtivo, setVisualAtivo] = useState(false)
  const [textoRevelado, setTextoRevelado] = useState(false)

  useEffect(() => {
    const suporta =
      typeof CSS !== 'undefined' && CSS.supports && CSS.supports('animation-timeline: view()')
    setSuportaViewTimeline(Boolean(suporta))

    const node = sectionRef.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      setVisualAtivo(true)
      setTextoRevelado(true)
      return
    }

    // Texto: dispara uma vez, nunca reverte.
    const observerTexto = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTextoRevelado(true)
          observerTexto.disconnect()
        }
      },
      { threshold: 0.5 },
    )
    observerTexto.observe(node)

    // Visual (fundo + documentos): só usado como fallback quando não há suporte nativo.
    let observerVisual
    if (!suporta) {
      observerVisual = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisualAtivo(true)
            observerVisual.disconnect()
          }
        },
        { threshold: 0.35 },
      )
      observerVisual.observe(node)
    }

    return () => {
      observerTexto.disconnect()
      observerVisual?.disconnect()
    }
  }, [])

  const classeSecao = suportaViewTimeline
    ? 'momento-nativo'
    : `momento-fallback ${visualAtivo ? 'ativo' : ''}`

  return (
    <section
      ref={sectionRef}
      aria-label="Transição: de documentos dispersos a um dossiê de conformidade único"
      className={`momento-secao relative overflow-hidden px-5 py-24 sm:px-8 sm:py-32 ${classeSecao}`}
    >
      <div className="relative mx-auto flex max-w-5xl flex-col items-center">
        <div className="momento-pilha relative hidden h-64 w-full max-w-md sm:flex sm:h-72" aria-hidden="true">
          {DOCUMENTOS.map((doc, i) => (
            <div
              key={i}
              className="momento-doc absolute inset-x-16 top-1/2 h-40 -translate-y-1/2 overflow-hidden rounded-lg border border-mist-300 bg-white shadow-xl"
              style={{
                '--doc-tx': `${doc.tx}px`,
                '--doc-ty': `${doc.ty}px`,
                '--doc-rot': `${doc.rot}deg`,
                zIndex: i,
              }}
            >
              <div className="h-2" style={{ backgroundColor: doc.accent }} />
              <div className="flex items-center gap-2 px-4 pt-3.5">
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke={doc.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 3h9l3 3v15a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z" />
                  <path d="M15 3v3h3" />
                </svg>
                <p className="truncate text-xs font-semibold" style={{ color: doc.accent }}>{doc.label}</p>
              </div>
              <div className="mx-4 mt-3.5 h-1.5 w-2/3 rounded-full bg-mist-200" />
              <div className="mx-4 mt-2 h-1.5 w-1/2 rounded-full bg-mist-200" />
              <div className="mx-4 mt-2 h-1.5 w-5/6 rounded-full bg-mist-200" />
              <div className="mx-4 mt-2 h-1.5 w-2/5 rounded-full bg-mist-200" />
            </div>
          ))}
        </div>

        {/* Conteúdo textual — sempre presente no DOM, mesmo antes da animação disparar. */}
        <div className={`momento-texto-grupo relative mt-10 flex flex-col items-center transition-all duration-700 ease-out sm:mt-14 ${textoRevelado ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          <p className="text-xs font-medium tracking-[0.08em] text-signal-300">
            Dossiê de conformidade · agosto de 2026
          </p>
          <h2 className="mt-4 max-w-2xl text-center font-display text-3xl font-medium leading-tight text-white sm:text-4xl">
            Da papelada espalhada a um único dossiê organizado.
          </h2>
          <p className="mt-4 max-w-xl text-center text-[15px] leading-relaxed text-indigo-200">
            A IncluiPro reúne avaliações, laudos e comprovantes que hoje vivem em pastas e
            e-mails separados — prontos para consulta e para a fiscalização, quando for preciso.
          </p>
        </div>
      </div>
    </section>
  )
}
