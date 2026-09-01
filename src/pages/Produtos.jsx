import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button.jsx'

const produtos = [
  {
    nome: 'IncluiPro Avalia',
    tag: 'Relatórios Técnicos de Inclusão',
    accent: 'signal',
    descricao:
      'Metodologia estruturada que transforma as anotações de uma entrevista em um Relatório Técnico de Inclusão profissional, pronto para compor o processo de contratação — com uma Consulta Rápida de recursos e ajustes sugeridos por tipo de deficiência.',
    recursos: [
      'Reduz o tempo do RH em cada avaliação — formulário guiado por blocos substitui anotações soltas e retrabalho.',
      'Relatório técnico pronto em minutos, no modelo oficial IncluiPro (Rotina e Autonomia, Observações Ergonômicas e Ambientais, Parecer e Recomendações).',
      'Recomendações certas na hora certa: Consulta Rápida sugere ajustes por tipo de deficiência (visual, física, auditiva, intelectual, cognitiva/neurodivergente, múltipla).',
      'Edição livre do texto antes de finalizar — sua equipe mantém o controle editorial completo.',
      'Histórico organizado e pronto para consulta — documentação rastreável para auditorias e fiscalizações da Lei de Cotas.',
    ],
  },
  {
    nome: 'IncluiPro Lidera',
    tag: 'Capacitação de lideranças',
    accent: 'volt',
    descricao:
      'Biblioteca de kits de treinamento em slides, prontos para uso, para capacitar líderes na gestão de equipes inclusivas — sem depender de consultoria externa a cada novo tema.',
    recursos: [
      'Reduz turnover e afastamentos evitáveis — líderes preparados para gerir equipes inclusivas desde o primeiro dia.',
      'Pronto para usar hoje: kits organizados por tema (fundamentos, comunicação e postura, gestão do dia a dia, casos práticos), sem esperar cronograma de consultoria.',
      'Conteúdo atualizado continuamente, sem custo adicional — sua assinatura sempre acompanha a metodologia mais recente.',
      'Funciona para qualquer nível de liderança, sem exigir conhecimento prévio em diversidade e inclusão.',
    ],
  },
  {
    nome: 'Kit Personalizado',
    tag: 'Sob consulta',
    accent: 'amber',
    descricao:
      'Quando os kits padrão não cobrem um cenário específico da sua empresa, desenvolvemos um kit de treinamento sob medida — mesmo padrão visual, conteúdo alinhado à sua realidade.',
    recursos: [
      'Conteúdo desenvolvido para o seu setor e cultura interna.',
      'Mesmo padrão visual e qualidade dos kits do IncluiPro Lidera.',
      'Orçamento e prazo definidos conforme o escopo solicitado.',
      'Fale com a equipe IncluiPro para levantar o escopo do seu kit.',
    ],
  },
]

export function Produtos() {
  return (
    <div>
      <section className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-signal-600">Produtos</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-indigo-800 sm:text-4xl">
          Uma plataforma, três formas de estruturar a inclusão
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-graphite-500">
          IncluiPro Avalia estrutura a avaliação de candidatos. IncluiPro Lidera prepara quem vai
          gerir o dia a dia. E quando isso não é suficiente, o Kit Personalizado cobre o restante.
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
                  p.accent === 'signal'
                    ? 'bg-signal-50 text-signal-700'
                    : p.accent === 'volt'
                      ? 'bg-volt-50 text-volt-700'
                      : 'bg-amber-50 text-amber-700'
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

      {/* Acesso */}
      <section className="bg-indigo-800 py-20">
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-signal-300">Acesso</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-white">
            Um plano único, com tudo incluso
          </h2>
          <p className="mt-3 text-indigo-200">
            Produto único, sem travamento de recurso por plano. O que varia é o preço, por faixa
            de funcionários.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-md px-5 sm:px-8">
          <div className="rounded-3xl border border-volt-300/40 bg-white/[0.08] p-8 text-left ring-2 ring-volt-300/30 backdrop-blur">
            <span className="inline-block rounded-full bg-volt-500/20 px-3 py-1 text-xs font-semibold text-volt-200">
              Plano Principal
            </span>
            <p className="mt-3 font-display text-lg font-semibold text-white">Plano Empresarial</p>
            <p className="mt-2 font-display text-xl font-semibold text-white">
              Planos conforme o porte da empresa
            </p>
            <p className="mt-1 text-sm text-indigo-300">tudo incluso, sem taxas extras</p>

            <ul className="mt-6 space-y-2.5 border-t border-white/10 pt-6">
              {[
                'IncluiPro Avalia e IncluiPro Lidera completos',
                'Atualizações constantes e novos treinamentos',
                'Atualizações legais e melhorias contínuas',
                'Suporte por e-mail em até 1 dia útil',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-indigo-100">
                  <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-signal-300" fill="currentColor">
                    <path d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5a1 1 0 111.4-1.4l3.9 3.9 6.7-6.7a1 1 0 011.4 0z" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            <Button
              href="mailto:contato@incluipro.com?subject=Solicita%C3%A7%C3%A3o%20de%20Proposta%20-%20Plano%20Empresarial"
              className="mt-6 w-full justify-center"
              size="lg"
            >
              Solicitar proposta
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-indigo-300">
            Múltiplas unidades ou operação de grande porte?{' '}
            <a
              href="mailto:contato@incluipro.com?subject=Contato%20Enterprise"
              className="font-semibold text-white hover:text-signal-300"
            >
              Falar com consultor
            </a>
            .
          </p>
        </div>

        <p className="mt-8 text-center text-sm text-indigo-300">
          Já pagou?{' '}
          <Link to="/assinatura" className="font-semibold text-white hover:text-signal-300">
            Verifique seu acesso aqui
          </Link>
          .
        </p>
      </section>
    </div>
  )
}
