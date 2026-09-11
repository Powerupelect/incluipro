import { Reveal } from './Reveal.jsx'

export function MomentoDossie() {
  return (
    <section className="bg-indigo-900 px-5 py-24 text-center sm:px-8 sm:py-32">
      <div className="mx-auto flex max-w-2xl flex-col items-center">
        <Reveal>
          <p className="text-xs font-medium tracking-[0.08em] text-signal-300">
            Dossiê de conformidade
          </p>
          <h2 className="mt-4 font-display text-3xl font-medium leading-tight text-white sm:text-4xl">
            Da papelada espalhada a um único dossiê organizado.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-indigo-200">
            A IncluiPro reúne avaliações, laudos e comprovantes que hoje vivem em pastas e
            e-mails separados — prontos para consulta e para a fiscalização, quando for preciso.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
