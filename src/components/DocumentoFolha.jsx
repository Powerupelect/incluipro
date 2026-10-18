/** Prévia de documento como folha de papel: páginas empilhadas atrás, final esmaecido
 * (deixa claro que é só o começo) e botão para abrir a amostra completa. */
export function DocumentoFolha({ src, alt, largura, altura, onAbrir }) {
  return (
    <div className="relative mx-auto max-w-[520px] px-3 pb-4 pt-3 sm:px-6">
      <div className="absolute inset-x-8 top-0 bottom-6 rotate-[-2.5deg] rounded-md bg-white/10" aria-hidden="true" />
      <div className="absolute inset-x-6 top-1 bottom-5 rotate-[1.5deg] rounded-md bg-white/20" aria-hidden="true" />
      <button
        type="button"
        onClick={onAbrir}
        className="group relative block w-full overflow-hidden rounded-md bg-white text-left shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] ring-1 ring-black/5 transition-transform duration-300 hover:-translate-y-1"
        aria-label="Abrir amostra completa do Plano de Integração e Rotina Inclusiva"
      >
        <div className="relative max-h-[520px] overflow-hidden px-6 pt-7 sm:px-10 sm:pt-10">
          <img src={src} alt={alt} width={largura} height={altura} loading="lazy" decoding="async" className="w-full" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white via-white/90 to-transparent" />
        </div>
        <div className="relative flex items-center justify-between gap-3 border-t border-mist-200 bg-mist-50 px-6 py-3.5 sm:px-10">
          <span className="hidden whitespace-nowrap text-xs font-medium text-graphite-500 xl:inline">Amostra com dados fictícios</span>
          <span className="mx-auto inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-signal-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors group-hover:bg-signal-500 xl:mx-0">
            Ver documento completo
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
          </span>
        </div>
      </button>
    </div>
  )
}
