import { useState } from 'react'

export function FaqAccordion({ items }) {
  const [aberto, setAberto] = useState(0)

  return (
    <div className="divide-y divide-mist-300 rounded-2xl border border-mist-300 bg-white shadow-card">
      {items.map((item, i) => {
        const isOpen = aberto === i
        return (
          <div key={item.pergunta}>
            <button
              onClick={() => setAberto(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              aria-expanded={isOpen}
            >
              <span className="font-display text-[15px] font-semibold text-indigo-800">
                {item.pergunta}
              </span>
              <svg
                viewBox="0 0 20 20"
                className={`h-5 w-5 shrink-0 text-graphite-400 transition-transform duration-300 ${
                  isOpen ? 'rotate-45' : ''
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="M10 4v12M4 10h12" />
              </svg>
            </button>
            <div
              className={`grid transition-all duration-300 ease-out ${
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-5 text-sm leading-relaxed text-graphite-600">
                  {item.resposta}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
