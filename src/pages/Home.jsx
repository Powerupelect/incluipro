import { useState } from 'react'
import { Button } from '../components/ui/Button.jsx'
import { Mark } from '../components/ui/Logo.jsx'
import { Reveal } from '../components/Reveal.jsx'
import { SlideGallery } from '../components/SlideGallery.jsx'
import { ReportSampleModal } from '../components/ReportSampleModal.jsx'
import { FaqAccordion } from '../components/FaqAccordion.jsx'
import { AnimatedCounter } from '../components/AnimatedCounter.jsx'

const LINK_PLANO_EMPRESARIAL = 'https://pay.hotmart.com/B106997595Q?bid=1785730636924'
const LINK_KIT_PERSONALIZADO =
  'mailto:contato.incluipro@gmail.com?subject=Solicita%C3%A7%C3%A3o%20de%20Kit%20Personalizado'

const problemas = [
  {
    titulo: 'Documentação',
    texto: 'Informações e avaliações precisam estar organizadas.',
    icon: <path d="M6 4h9l3 3v13a1 1 0 01-1 1H6a1 1 0 01-1-1V5a1 1 0 011-1zM8 12h8M8 16h5M8 8h4" />,
  },
  {
    titulo: 'Tempo operacional',
    texto: 'Processos manuais consomem horas da equipe.',
    icon: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></>,
  },
  {
    titulo: 'Liderança',
    texto: 'Gestores precisam estar preparados para conduzir equipes inclusivas.',
    icon: <><circle cx="12" cy="8" r="3.2" /><path d="M5 20c1.5-4 4.5-6 7-6s5.5 2 7 6" /></>,
  },
]

const solucoes = [
  {
    nome: 'IncluiPro Avalia',
    tag: 'Relatórios Técnicos de Inclusão',
    itens: [
      'Relatórios padronizados',
      'Organização das informações',
      'Redução do trabalho operacional',
      'Processo mais rápido e estruturado',
    ],
    cta: 'Ver como funciona',
    accent: 'signal',
  },
  {
    nome: 'IncluiPro Lidera',
    tag: 'Treinamentos para Lideranças',
    itens: [
      'Conteúdo pronto para uso',
      'Comunicação e inclusão',
      'Orientações para lideranças',
      'Atualizações de conteúdos',
    ],
    cta: 'Ver demonstração',
    accent: 'volt',
  },
]

const diagnosticoItens = [
  {
    titulo: 'Gratuito e rápido',
    texto: 'Leva menos de 2 minutos para responder — sem custo, sem compromisso.',
    icon: <path d="M12 6v6l4 2M12 22a10 10 0 100-20 10 10 0 000 20z" />,
  },
  {
    titulo: 'Nível de maturidade',
    texto: 'Classificação clara: Inicial, Em desenvolvimento ou Avançado.',
    icon: <path d="M4 20V10m6 10V4m6 16v-7" strokeLinecap="round" />,
  },
  {
    titulo: 'Pontuação detalhada',
    texto: 'Veja exatamente quais fatores elevam ou limitam sua pontuação hoje.',
    icon: <path d="M9 12l2 2 4-4M12 22a10 10 0 100-20 10 10 0 000 20z" />,
  },
  {
    titulo: 'Próximos passos',
    texto: 'Recomendações objetivas de onde começar a estruturar a inclusão.',
    icon: <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />,
  },
]

const comoFunciona = [
  { numero: '01', titulo: 'Diagnostique', texto: 'Descubra o nível de maturidade em inclusão da sua empresa hoje, gratuitamente.' },
  { numero: '02', titulo: 'Estruture', texto: 'Use o IncluiPro Avalia para padronizar avaliações e gerar Relatórios Técnicos de Inclusão.' },
  { numero: '03', titulo: 'Capacite', texto: 'Distribua os treinamentos do IncluiPro Lidera para preparar as lideranças.' },
  { numero: '04', titulo: 'Evolua', texto: 'Acompanhe atualizações constantes de conteúdo, legislação e funcionalidades.' },
]

const atualizacoes = [
  'Atualizações de conteúdo',
  'Melhorias da plataforma',
  'Novos materiais',
  'Atualizações legais e normativas, quando aplicáveis',
  'Evolução contínua das soluções',
]

const depoimentos = [
  {
    citacao:
      'Centralizamos as avaliações sociais que antes viviam espalhadas em pastas e planilhas. O tempo que o RH gastava organizando isso caiu pela metade.',
    nome: 'Marina Duarte',
    cargo: 'Gerente de RH',
    empresa: 'Rede varejista nacional',
  },
  {
    citacao:
      'Finalmente temos documentação padronizada para mostrar em qualquer auditoria da Lei de Cotas. Antes dependia da memória de quem fez a entrevista.',
    nome: 'Rafael Tannure',
    cargo: 'Head de Diversidade & Inclusão',
    empresa: 'Indústria de médio porte',
  },
  {
    citacao:
      'Os kits do IncluiPro Lidera viraram parte do onboarding dos nossos gestores. A diferença na forma como eles conduzem o dia a dia das equipes é visível.',
    nome: 'Carla Menezes',
    cargo: 'Coordenadora de Compliance e Pessoas',
    empresa: 'Empresa de serviços financeiros',
  },
]

const faqItems = [
  {
    pergunta: 'O que está incluído no plano de R$497?',
    resposta:
      'O Plano Empresarial inclui acesso completo ao IncluiPro Avalia e ao IncluiPro Lidera, atualizações constantes da plataforma, novos treinamentos, atualizações legais e melhorias contínuas, além de suporte dedicado para a equipe de RH — tudo por R$497/mês, sem taxas extras.',
  },
  {
    pergunta: 'Para quais empresas a IncluiPro é indicada?',
    resposta:
      'Para times de RH, Diversidade e Compliance que precisam estruturar processos de inclusão de pessoas com deficiência de forma organizada — desde a avaliação de candidatos até a capacitação de lideranças.',
  },
  {
    pergunta: 'Como funciona o diagnóstico?',
    resposta:
      'O Diagnóstico de Maturidade em Inclusão é um questionário gratuito que avalia indicadores-chave do processo atual da empresa e devolve, na hora, o nível de maturidade (Inicial, Em desenvolvimento ou Avançado) com recomendações práticas.',
  },
  {
    pergunta: 'Como funciona o IncluiPro Avalia?',
    resposta:
      'Você preenche as anotações da entrevista em um formulário organizado por blocos, com uma Consulta Rápida de recursos sugeridos por tipo de deficiência. O sistema monta o Relatório Técnico de Inclusão automaticamente, que pode ser editado livremente antes de exportar em PDF.',
  },
  {
    pergunta: 'Como funcionam os treinamentos?',
    resposta:
      'O IncluiPro Lidera oferece uma biblioteca de kits de treinamento em slides, organizados por tema (fundamentos, comunicação e postura, gestão do dia a dia, casos práticos), prontos para baixar e usar em reuniões e capacitações internas.',
  },
  {
    pergunta: 'Posso solicitar materiais personalizados?',
    resposta:
      'Sim. Quando os kits padrão não cobrem um cenário específico da sua empresa, você pode solicitar um Kit Personalizado, desenvolvido sob consulta e orçamento conforme o escopo necessário.',
  },
  {
    pergunta: 'Como funcionam as atualizações?',
    resposta:
      'A plataforma recebe atualizações constantes: novos treinamentos, melhorias de funcionalidades e atualizações legais e normativas, quando aplicável — tudo incluído na assinatura, sem custo adicional.',
  },
  {
    pergunta: 'Como posso contratar?',
    resposta:
      'Basta assinar o Plano Empresarial diretamente pelo site — o pagamento é processado com segurança pela Hotmart e o acesso à plataforma é liberado automaticamente assim que o pagamento for confirmado.',
  },
]

export function Home() {
  const [amostraAberta, setAmostraAberta] = useState(false)

  return (
    <div>
      {/* Hero */}
      <section className="grain relative overflow-hidden bg-indigo-800">
        <div className="step-pattern absolute inset-0 opacity-40" />
        <div className="glow-orb absolute -right-24 top-1/2 hidden h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-volt-500/20 blur-3xl md:block" />
        <div className="glow-orb-alt absolute -left-16 bottom-0 hidden h-[320px] w-[320px] rounded-full bg-signal-500/15 blur-3xl md:block" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 md:grid-cols-2 md:items-center md:py-28">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-signal-300">
              <span className="h-1.5 w-1.5 rounded-full bg-signal-400" style={{ animation: 'pulseGlow 2.2s ease-in-out infinite' }} />
              Plataforma Especializada em Inclusão Corporativa
            </span>
            <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.08] text-white sm:text-5xl">
              Estruture a inclusão de pessoas com deficiência <span className="text-gradient">em um só lugar.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-indigo-200">
              Relatórios técnicos, treinamentos para lideranças e ferramentas para apoiar o RH na
              construção de processos de inclusão mais organizados e consistentes.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button to="/#solucoes" size="lg">Conhecer as soluções</Button>
              <Button to="/#planos" variant="outlineLight" size="lg">
                Ver planos
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-indigo-200">
              <span className="inline-flex items-center gap-1.5">
                ✅ Alinhado à LBI e à Lei de Cotas
              </span>
              <span className="inline-flex items-center gap-1.5">
                ✅ Metodologia especializada
              </span>
              <span className="inline-flex items-center gap-1.5">
                ✅ Atualizações constantes
              </span>
            </div>
          </Reveal>

          <Reveal direction="left" delay={100} className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-signal-500/25 via-transparent to-volt-500/25 blur-2xl" />
            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-7 shadow-pop backdrop-blur transition-transform duration-500 hover:-translate-y-1 sm:pb-24">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">
                Nível de maturidade em inclusão
              </p>
              <div className="mt-5 flex items-end gap-3">
                <div className="flex h-16 w-10 items-end rounded-md bg-white/10">
                  <div className="h-6 w-full rounded-md bg-signal-400" />
                </div>
                <div className="flex h-24 w-10 items-end rounded-md bg-white/10">
                  <div className="h-16 w-full rounded-md bg-signal-400" />
                </div>
                <div className="flex h-32 w-10 items-end rounded-md bg-white/10">
                  <div className="h-28 w-full rounded-md bg-volt-400" />
                </div>
                <div className="ml-2 flex flex-col justify-end pb-1">
                  <p className="font-display text-3xl font-semibold text-white">Avançado</p>
                  <p className="text-sm text-indigo-300">baseado em 4 indicadores</p>
                </div>
              </div>
              <div className="mt-6 space-y-2 border-t border-white/10 pt-5 text-sm text-indigo-200">
                <p className="flex items-center gap-2">
                  <Mark className="h-4 w-4" /> Processo de avaliação estruturado
                </p>
                <p className="flex items-center gap-2">
                  <Mark className="h-4 w-4" /> Líderes treinados para gestão inclusiva
                </p>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-mist-300 bg-white px-5 py-4 shadow-pop sm:block">
              <p className="font-display text-2xl font-semibold text-signal-700">
                <AnimatedCounter value={80} suffix="%" />
              </p>
              <p className="max-w-[9rem] text-xs leading-snug text-graphite-500">
                de economia no tempo com processos estruturados
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Problema */}
      <section id="problema" className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold text-indigo-800 sm:text-4xl">
            Quando a inclusão depende de processos manuais, o RH perde tempo.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {problemas.map((p, i) => (
            <Reveal
              key={p.titulo}
              delay={i * 100}
              direction="scale"
              className="group rounded-2xl border border-mist-300 bg-white p-6 text-center shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-pop hover:ring-4 hover:ring-signal-100"
            >
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-signal-50 text-signal-700 transition-all duration-300 group-hover:scale-110 group-hover:bg-signal-100">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  {p.icon}
                </svg>
              </span>
              <p className="mt-4 font-display text-base font-semibold text-indigo-800">
                {p.titulo}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-graphite-500">{p.texto}</p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200} className="mx-auto mt-10 max-w-lg text-center">
          <p className="font-display text-lg font-semibold text-indigo-800">
            A IncluiPro reúne essas frentes em uma única plataforma.
          </p>
        </Reveal>
      </section>

      {/* Soluções */}
      <section id="solucoes" className="bg-mist-200 py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-signal-600">
              Soluções
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-indigo-800 sm:text-4xl">
              Do diagnóstico à capacitação, em um só lugar.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {solucoes.map((s, i) => (
              <Reveal
                key={s.nome}
                delay={i * 120}
                direction="scale"
                className="flex flex-col rounded-2xl border border-mist-300 bg-white p-8 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-signal-300 hover:shadow-pop hover:ring-4 hover:ring-signal-100"
              >
                <span
                  className={`inline-block w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                    s.accent === 'signal' ? 'bg-signal-50 text-signal-700' : 'bg-volt-50 text-volt-700'
                  }`}
                >
                  {s.tag}
                </span>
                <h3 className="mt-4 font-display text-2xl font-semibold text-indigo-800">
                  {s.nome}
                </h3>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {s.itens.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-graphite-700">
                      <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-signal-600" fill="currentColor">
                        <path d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5a1 1 0 111.4-1.4l3.9 3.9 6.7-6.7a1 1 0 011.4 0z" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <Button to="/#demonstracao" variant="ghost" className="mt-6 w-fit">
                  {s.cta}
                </Button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Demonstração visual */}
      <section id="demonstracao" className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-volt-600">
            Prova visual
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-indigo-800 sm:text-4xl">
            Veja como funciona na prática
          </h2>
          <p className="mt-3 leading-relaxed text-graphite-500">
            Nada de telas ilustrativas — abaixo estão capturas reais da plataforma.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Reveal delay={0} className="group overflow-hidden rounded-2xl border border-mist-300 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-pop hover:ring-4 hover:ring-signal-100">
            <div className="overflow-hidden">
              <img
                src="/previews/diagnostico-resultado.png"
                alt="Tela real do resultado do Diagnóstico de Maturidade em Inclusão"
                className="h-40 w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <p className="p-4 text-sm font-semibold text-indigo-800">Diagnóstico</p>
          </Reveal>
          <button
            onClick={() => setAmostraAberta(true)}
            className="group overflow-hidden rounded-2xl border border-mist-300 bg-white text-left shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-pop hover:ring-4 hover:ring-signal-100"
          >
            <div className="overflow-hidden">
              <img
                src="/previews/avalia-relatorio.png"
                alt="Relatório Técnico de Inclusão real gerado pelo IncluiPro Avalia"
                className="h-40 w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <p className="p-4 text-sm font-semibold text-indigo-800">IncluiPro Avalia</p>
          </button>
          <Reveal delay={100} className="group overflow-hidden rounded-2xl border border-mist-300 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-pop hover:ring-4 hover:ring-signal-100">
            <div className="overflow-hidden">
              <img
                src="/previews/gallery/checklist.png"
                alt="Slide real de um kit do IncluiPro Lidera"
                className="h-40 w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <p className="p-4 text-sm font-semibold text-indigo-800">IncluiPro Lidera</p>
          </Reveal>
          <Reveal delay={150} className="group flex flex-col items-start justify-center rounded-2xl border border-mist-300 bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-pop hover:ring-4 hover:ring-amber-100">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 transition-all duration-300 group-hover:scale-110 group-hover:bg-amber-100">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z" />
              </svg>
            </span>
            <p className="mt-3 text-sm font-semibold text-indigo-800">Personalização</p>
            <p className="mt-1 text-xs leading-relaxed text-graphite-500">Sob consulta e orçamento</p>
          </Reveal>
        </div>

        <Reveal delay={200} className="mt-14">
          <p className="text-sm font-semibold uppercase tracking-wide text-signal-600">
            Todos os slides do IncluiPro Lidera
          </p>
          <p className="mt-2 text-sm text-graphite-500">
            Clique em qualquer miniatura para ampliar.
          </p>
          <div className="mt-6">
            <SlideGallery />
          </div>
        </Reveal>

        <Reveal delay={250} className="mt-10 flex flex-wrap items-center gap-4 rounded-2xl border border-mist-300 bg-mist-100 p-6">
          <div className="flex-1">
            <p className="font-display text-base font-semibold text-indigo-800">
              Quer ver o Relatório Técnico de Inclusão completo?
            </p>
            <p className="mt-1 text-sm text-graphite-500">
              Amostra ilustrativa, com dados fictícios, sem precisar criar conta.
            </p>
          </div>
          <button
            onClick={() => setAmostraAberta(true)}
            className="shrink-0 inline-flex items-center gap-2 rounded-full bg-indigo-700 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-800 hover:shadow-pop"
          >
            📄 Ver amostra completa do relatório
          </button>
        </Reveal>
      </section>

      <ReportSampleModal open={amostraAberta} onClose={() => setAmostraAberta(false)} />

      {/* Diagnóstico */}
      <section id="diagnostico" className="bg-mist-200 py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:items-center">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-wide text-signal-600">
                Diagnóstico gratuito
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold text-indigo-800 sm:text-4xl">
                Comece entendendo o nível de estruturação da sua empresa.
              </h2>
              <p className="mt-4 leading-relaxed text-graphite-500">
                Um questionário gratuito que avalia indicadores-chave do seu processo atual e
                devolve, na hora, um panorama claro do que já funciona e do que precisa de
                estrutura.
              </p>
              <Button to="/diagnostico" className="mt-7">
                Fazer diagnóstico gratuito
              </Button>
            </Reveal>

            <div className="grid gap-4 sm:grid-cols-2">
              {diagnosticoItens.map((item, i) => (
                <Reveal
                  key={item.titulo}
                  delay={i * 80}
                  className="group rounded-2xl border border-mist-300 bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-signal-300 hover:shadow-pop hover:ring-4 hover:ring-signal-100"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-signal-50 text-signal-700 transition-all duration-300 group-hover:scale-110 group-hover:bg-signal-100">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
                      {item.icon}
                    </svg>
                  </span>
                  <p className="mt-3 font-display text-sm font-semibold text-indigo-800">
                    {item.titulo}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-graphite-500">{item.texto}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-signal-600">
            Como funciona
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-indigo-800 sm:text-4xl">
            Um fluxo simples, do diagnóstico à evolução contínua
          </h2>
        </Reveal>

        <div className="relative mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <Reveal
            direction="scale"
            className="absolute left-0 right-0 top-6 hidden h-px origin-left bg-gradient-to-r from-signal-400 via-volt-400 to-signal-400 lg:block"
          />
          {comoFunciona.map((p, i) => (
            <Reveal key={p.numero} delay={i * 100} className="relative">
              <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-700 font-display text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(30,42,74,0.5)] transition-transform duration-300 hover:scale-110">
                {p.numero}
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-indigo-800">
                {p.titulo}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-graphite-500">{p.texto}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Kit Personalizado */}
      <section id="kit-personalizado" className="relative overflow-hidden bg-mist-200 py-20">
        <div className="glow-orb absolute left-1/2 top-0 hidden h-72 w-72 -translate-x-1/2 rounded-full bg-amber-300/25 blur-3xl md:block" />
        <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
          <Reveal direction="scale">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 shadow-card">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z" />
              </svg>
            </span>
            <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-amber-700">
              Kit Personalizado
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-indigo-800 sm:text-4xl">
              Sua empresa precisa de algo específico?
            </h2>
            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-graphite-500">
              Solicite conteúdos e materiais personalizados conforme as necessidades da sua
              empresa — desenvolvidos sob consulta e orçamento, com o mesmo padrão de qualidade
              do IncluiPro Lidera.
            </p>
            <Button href={LINK_KIT_PERSONALIZADO} className="mt-7">
              Solicitar personalização
            </Button>
          </Reveal>
        </div>
      </section>

      {/* Atualização contínua */}
      <section id="atualizacoes" className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-wide text-volt-600">
              Evolução contínua
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-indigo-800 sm:text-4xl">
              Uma plataforma que acompanha a evolução da inclusão.
            </h2>
          </Reveal>
          <Reveal delay={100} direction="scale" className="rounded-2xl border border-mist-300 bg-white p-8 shadow-card transition-all duration-300 hover:shadow-pop">
            <ul className="space-y-3.5">
              {atualizacoes.map((item, i) => (
                <li
                  key={item}
                  className="fade-item flex items-start gap-2.5 text-sm text-graphite-700"
                  style={{ animationDelay: `${150 + i * 90}ms` }}
                >
                  <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-signal-600" fill="currentColor">
                    <path d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5a1 1 0 111.4-1.4l3.9 3.9 6.7-6.7a1 1 0 011.4 0z" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Planos e valores */}
      <section id="planos" className="grain relative overflow-hidden bg-indigo-800 py-20">
        <div className="glow-orb absolute -right-32 top-0 hidden h-[420px] w-[420px] rounded-full bg-volt-500/15 blur-3xl md:block" />
        <div className="relative mx-auto max-w-5xl px-5 sm:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-signal-300">
              Planos e valores
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">
              Quanto custa NÃO ter a IncluiPro?
            </h2>
            <p className="mt-4 leading-relaxed text-indigo-200">
              O investimento mensal deve ser analisado considerando o conjunto de atividades,
              recursos e tempo envolvidos na estruturação da inclusão.
            </p>
          </Reveal>

          <Reveal delay={100} className="mt-12 overflow-hidden rounded-3xl border border-white/10 shadow-pop">
            <div className="grid md:grid-cols-2">
              <div className="bg-white/[0.04] p-8 sm:p-10">
                <p className="text-xs font-bold uppercase tracking-wide text-indigo-300">
                  Sem IncluiPro
                </p>
                <ul className="mt-6 space-y-6">
                  <li>
                    <p className="text-sm text-indigo-200">1 avaliação com consultora</p>
                    <p className="mt-1 font-display text-2xl font-semibold text-white">R$ 300–800</p>
                  </li>
                  <li>
                    <p className="text-sm text-indigo-200">1 multa por vaga*</p>
                    <p className="mt-1 font-display text-2xl font-semibold text-white">até R$ 3.499,80</p>
                  </li>
                  <li>
                    <p className="text-sm text-indigo-200">Treinamento criado do zero</p>
                    <p className="mt-1 font-display text-2xl font-semibold text-white">R$ 2.000+</p>
                  </li>
                </ul>
              </div>
              <div className="bg-white/[0.09] p-8 sm:p-10">
                <p className="text-xs font-bold uppercase tracking-wide text-signal-300">
                  Com IncluiPro
                </p>
                <ul className="mt-6 space-y-4">
                  {[
                    'Avaliações ILIMITADAS',
                    'Documentação segura e organizada',
                    'Treinamentos prontos e atualizados',
                    'Suporte prioritário',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-white">
                      <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-signal-300" fill="currentColor">
                        <path d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5a1 1 0 111.4-1.4l3.9 3.9 6.7-6.7a1 1 0 011.4 0z" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 border-t border-white/15 pt-6">
                  <p className="price-glow flex items-baseline gap-1.5">
                    <span className="font-display text-4xl font-semibold text-signal-300">
                      R$ <AnimatedCounter value={497} decimals={2} />
                    </span>
                    <span className="text-sm text-indigo-200">/ mês</span>
                  </p>
                  <p className="mt-1 text-xs text-indigo-300">tudo incluso, sem taxas extras</p>
                </div>
              </div>
            </div>
          </Reveal>

          <p className="mx-auto mt-5 max-w-2xl text-center text-xs leading-relaxed text-indigo-300">
            *Valor de referência sobre o risco de irregularidade por vaga não preenchida na Lei de
            Cotas (Lei 8.213/1991). A IncluiPro não garante isenção de multas nem substitui
            orientação jurídica — o objetivo da plataforma é apoiar a organização e a
            documentação dos processos de inclusão.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href={LINK_PLANO_EMPRESARIAL} size="lg">Começar agora</Button>
            <Button to="/produtos" variant="outlineLight" size="lg">
              Conhecer antes de contratar
            </Button>
          </div>
        </div>
      </section>

      {/* Programa Fundadores */}
      <section id="fundadores" className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-wide text-volt-600">
            Programa Fundadores
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-indigo-800 sm:text-4xl">
            Condições especiais para as primeiras empresas participantes.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-graphite-500">
            As empresas participantes desta fase contam com acompanhamento mais próximo e
            benefícios específicos de implantação e personalização.
          </p>

          <div className="relative mx-auto mt-8 max-w-xl overflow-hidden rounded-2xl border border-volt-200 bg-volt-50 p-6 text-left shadow-[0_12px_36px_-16px_rgba(108,76,230,0.4)]">
            <div className="glow-orb absolute -right-10 -top-10 h-32 w-32 rounded-full bg-volt-300/35 blur-2xl" />
            <p className="relative text-sm font-bold uppercase tracking-wide text-volt-700">
              <span className="inline-block" style={{ animation: 'pulseGlow 2.4s ease-in-out infinite' }}>
                🎁
              </span>{' '}
              Benefício exclusivo
            </p>
            <p className="relative mt-2 text-sm leading-relaxed text-graphite-700">
              Os primeiros clientes recebem Kit Personalizado e acréscimos sem custo adicional
              enquanto durar a fase inicial.
            </p>
          </div>

          <p className="mt-5 text-sm font-semibold text-graphite-500">
            Vagas limitadas — condição especial válida enquanto durar a fase inicial.
          </p>

          <Button href={LINK_PLANO_EMPRESARIAL} className="mt-7">
            Conhecer o Programa Fundadores
          </Button>
        </Reveal>
      </section>

      {/* Confiança e conformidade */}
      <section id="confianca" className="bg-mist-200 py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-signal-600">
              Confiança
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-indigo-800 sm:text-4xl">
              Construída para empresas que querem ir além do cumprimento formal.
            </h2>
          </Reveal>

          <Reveal delay={100} className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
            {[
              'Alinhamento à Lei de Cotas e legislação aplicável',
              'Estrutura organizada',
              'Recursos para RH e lideranças',
              'Evolução contínua',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5 rounded-xl border border-mist-300 bg-white p-4 text-sm text-graphite-700 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card">
                <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-signal-600" fill="currentColor">
                  <path d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5a1 1 0 111.4-1.4l3.9 3.9 6.7-6.7a1 1 0 011.4 0z" />
                </svg>
                {item}
              </div>
            ))}
          </Reveal>

          <p className="mx-auto mt-5 max-w-2xl text-center text-xs leading-relaxed text-graphite-400">
            A IncluiPro apoia a organização dos processos de inclusão da sua empresa; não
            substitui orientação jurídica nem garante resultados de conformidade.
          </p>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {depoimentos.map((d, i) => (
              <Reveal
                key={d.nome}
                delay={i * 100}
                direction="scale"
                className="group flex flex-col rounded-2xl border border-mist-300 bg-white p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-pop hover:ring-4 hover:ring-signal-100"
              >
                <svg viewBox="0 0 32 24" className="h-7 w-7 text-signal-200 transition-colors duration-300 group-hover:text-signal-400" fill="currentColor">
                  <path d="M0 24V13.6C0 5.6 4.8 1 12.8 0l1.6 3.6C9.2 5.2 6.8 8 6.4 12H14v12H0zm18 0V13.6C18 5.6 22.8 1 30.8 0l1.6 3.6C27.2 5.2 24.8 8 24.4 12H32v12H18z" />
                </svg>
                <p className="mt-4 flex-1 text-[15px] italic leading-relaxed text-graphite-700">
                  "{d.citacao}"
                </p>
                <div className="mt-6 border-t border-mist-300 pt-4">
                  <p className="font-display text-sm font-semibold text-indigo-800">{d.nome}</p>
                  <p className="text-xs text-graphite-500">{d.cargo}</p>
                  <p className="text-xs text-graphite-300">{d.empresa}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
        <Reveal className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-signal-600">
            Perguntas frequentes
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-indigo-800 sm:text-4xl">
            Tudo o que você precisa saber antes de contratar
          </h2>
        </Reveal>

        <Reveal delay={100} className="mt-10">
          <FaqAccordion items={faqItems} />
        </Reveal>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <Reveal direction="scale" className="grain step-pattern relative overflow-hidden rounded-3xl bg-indigo-800 px-8 py-14 text-center sm:px-16">
          <div className="glow-orb absolute -right-20 -top-20 hidden h-72 w-72 rounded-full bg-volt-500/20 blur-3xl md:block" />
          <div className="glow-orb-alt absolute -left-20 -bottom-20 hidden h-72 w-72 rounded-full bg-signal-500/20 blur-3xl md:block" />
          <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
            Pronto para estruturar a inclusão de forma mais organizada?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-indigo-200">
            Conheça a plataforma, explore as soluções e veja como a IncluiPro pode apoiar sua
            empresa.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button to="/produtos" size="lg">Conhecer a IncluiPro</Button>
            <Button to="/diagnostico" variant="outlineLight" size="lg">
              Começar diagnóstico gratuito
            </Button>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
