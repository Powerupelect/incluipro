import { Button } from '../components/ui/Button.jsx'

const produtos = [
  {
    nome: 'IncluiPro Avalia',
    tag: 'Avaliação social com IA',
    accent: 'signal',
    descricao:
      'Ferramenta com IA que transforma as anotações de uma entrevista de avaliação social em um relatório final estruturado e profissional, pronto para compor o processo de contratação.',
    recursos: [
      'Formulário guiado por blocos: identificação, rotina e autonomia, histórico profissional, necessidades específicas, expectativas e observações ergonômicas.',
      'Geração do relatório final em segundos, com seções padronizadas (Resumo Executivo, Parecer Final, entre outras).',
      'Histórico de relatórios gerados, organizado por candidato.',
      'Exportação em texto/Markdown, com PDF e Word como próximos passos.',
    ],
  },
  {
    nome: 'IncluiPro Lidera',
    tag: 'Capacitação de lideranças',
    accent: 'volt',
    descricao:
      'Biblioteca de kits de treinamento em slides, prontos para uso, para capacitar líderes na gestão de equipes inclusivas — sem depender de consultoria externa a cada novo tema.',
    recursos: [
      'Kits organizados por tema: fundamentos, comunicação, dia a dia e casos práticos.',
      'Download imediato para uso em reuniões e treinamentos internos.',
      'Conteúdo atualizado conforme a metodologia evolui.',
      'Pensado para líderes de primeira e segunda linha, sem exigir conhecimento prévio.',
    ],
  },
]

export function Produtos() {
  return (
    <div>
      <section className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-signal-600">Produtos</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-indigo-800 sm:text-4xl">
          Uma plataforma, dois pilares da inclusão
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-graphite-500">
          IncluiPro Avalia estrutura a avaliação de candidatos. IncluiPro Lidera prepara quem vai
          gerir o dia a dia. Juntos, sustentam um processo de inclusão que não depende de boa
          vontade individual.
        </p>
      </section>

      <section className="mx-auto max-w-6xl space-y-8 px-5 pb-16 sm:px-8">
        {produtos.map((p) => (
          <div
            key={p.nome}
            className="grid gap-8 rounded-2xl border border-mist-300 bg-white p-8 shadow-card md:grid-cols-[1fr_1.2fr] md:p-10"
          >
            <div>
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                  p.accent === 'signal' ? 'bg-signal-50 text-signal-700' : 'bg-volt-50 text-volt-700'
                }`}
              >
                {p.tag}
              </span>
              <h2 className="mt-4 font-display text-2xl font-semibold text-indigo-800">
                {p.nome}
              </h2>
              <p className="mt-3 leading-relaxed text-graphite-500">{p.descricao}</p>
            </div>
            <ul className="space-y-3 self-center">
              {p.recursos.map((r) => (
                <li key={r} className="flex items-start gap-3 text-sm text-graphite-700">
                  <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-signal-600" fill="currentColor">
                    <path d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5a1 1 0 111.4-1.4l3.9 3.9 6.7-6.7a1 1 0 011.4 0z" />
                  </svg>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Planos */}
      <section className="bg-indigo-800 py-20">
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-signal-300">Plano</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-white">
            Um plano mensal, os dois produtos incluídos
          </h2>
          <p className="mt-3 text-indigo-200">
            Sem taxas escondidas, sem contratos anuais. Cancele quando quiser.
          </p>

          <div className="mx-auto mt-10 max-w-md rounded-3xl border border-white/10 bg-white/[0.06] p-9 text-left backdrop-blur">
            <p className="font-display text-lg font-semibold text-white">Plano Mensal IncluiPro</p>
            <p className="mt-2 flex items-baseline gap-1">
              <span className="font-display text-4xl font-semibold text-white">
                Sob consulta
              </span>
            </p>
            <p className="mt-1 text-sm text-indigo-300">por empresa, cobrança mensal</p>

            <ul className="mt-6 space-y-3 border-t border-white/10 pt-6">
              {[
                'Acesso completo ao IncluiPro Avalia',
                'Acesso completo à biblioteca do IncluiPro Lidera',
                'Relatórios ilimitados gerados por IA',
                'Histórico de relatórios por candidato',
                'Suporte da equipe IncluiPro',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-indigo-100">
                  <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-signal-300" fill="currentColor">
                    <path d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5a1 1 0 111.4-1.4l3.9 3.9 6.7-6.7a1 1 0 011.4 0z" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            <Button to="/cadastro" className="mt-8 w-full justify-center" size="lg">
              Assinar agora
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
