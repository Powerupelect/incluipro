import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button.jsx'
import { Mark } from '../components/ui/Logo.jsx'
import { Reveal } from '../components/Reveal.jsx'
import { SlideGallery } from '../components/SlideGallery.jsx'
import { ReportSampleModal } from '../components/ReportSampleModal.jsx'

const produtos = [
  {
    nome: 'IncluiPro Avalia',
    tag: 'Avaliação social estruturada',
    descricao:
      'Transforma anotações de entrevista de avaliação social em um relatório final estruturado e profissional — em minutos, não em horas.',
    itens: [
      'Formulário estruturado por blocos',
      'Consulta Rápida com recursos sugeridos por tipo de deficiência',
      'Relatório editável, com exportação em PDF e histórico com busca',
    ],
    accent: 'signal',
    preco: null,
  },
  {
    nome: 'IncluiPro Lidera',
    tag: 'Capacitação de lideranças',
    descricao:
      'Biblioteca de kits de treinamento em slides, prontos para uso, para capacitar líderes na gestão de equipes inclusivas.',
    itens: [
      'Kits em slides prontos para uso',
      'Organizados por tema e nível',
      'Download imediato para a liderança',
    ],
    accent: 'volt',
    preco: null,
  },
  {
    nome: 'Kit Personalizado',
    tag: 'Sob consulta',
    descricao:
      'Desenvolvemos conteúdo de treinamento sob medida para a realidade e os desafios específicos da sua empresa.',
    itens: [
      'Conteúdo pensado para o seu setor',
      'Alinhado com sua cultura e processos internos',
      'Orçamento personalizado, sem taxa fixa',
    ],
    accent: 'amber',
    preco: 'Sob consulta e orçamento',
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

const passos = [
  {
    numero: '01',
    titulo: 'Cadastro',
    texto: 'Sua empresa cria uma conta em minutos e já recebe um diagnóstico inicial gratuito.',
  },
  {
    numero: '02',
    titulo: 'Assinatura',
    texto: 'Um único plano mensal libera os dois produtos: IncluiPro Avalia e IncluiPro Lidera.',
  },
  {
    numero: '03',
    titulo: 'Acesso à plataforma',
    texto: 'Sua equipe gera relatórios de avaliação e distribui treinamentos para líderes.',
  },
]

export function Home() {
  const [amostraAberta, setAmostraAberta] = useState(false)

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-indigo-800">
        <div className="step-pattern absolute inset-0 opacity-40" />
        <div className="absolute -right-24 top-1/2 hidden h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-volt-500/20 blur-3xl md:block" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 md:grid-cols-2 md:items-center md:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-signal-300">
              Inclusão estruturada, com metodologia validada
            </span>
            <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.08] text-white sm:text-5xl">
              Inclusão de PCD, transformada em processo — não em boa vontade.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-indigo-200">
              A IncluiPro Soluções é uma consultoria especializada em inclusão de pessoas com
              deficiência no mercado de trabalho, com metodologia própria: avaliações sociais
              consistentes, lideranças preparadas e uma plataforma que sustenta os dois.
            </p>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-indigo-300">
              Desenvolvido com base em anos de experiência em avaliação social e inclusão
              profissional de pessoas com deficiência.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button to="/cadastro" size="lg">Criar conta e assinar</Button>
              <Button to="/diagnostico" variant="outlineLight" size="lg">
                Fazer diagnóstico gratuito
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-indigo-200">
              <span className="inline-flex items-center gap-1.5">
                ✅ Alinhado à LBI e à Lei de Cotas
              </span>
              <span className="inline-flex items-center gap-1.5">
                ✅ Usado por empresas de todo o Brasil
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-7 shadow-pop backdrop-blur">
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
          </div>
        </div>
      </section>

      {/* Prova social */}
      <section className="border-b border-mist-300 bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 text-center sm:px-8 md:flex-row md:justify-between md:text-left">
          <p className="max-w-md text-sm leading-relaxed text-graphite-500">
            Desenvolvido com base em anos de experiência em avaliação social e inclusão
            profissional — a mesma metodologia usada por empresas de todo o Brasil para
            estruturar processos de inclusão de PCD.
          </p>
          <div className="flex items-center gap-4 rounded-2xl border border-signal-200 bg-signal-50 px-6 py-4">
            <span className="font-display text-3xl font-semibold text-signal-700">80%</span>
            <span className="max-w-[10rem] text-left text-xs font-semibold uppercase leading-snug tracking-wide text-signal-800">
              de economia no tempo com processos estruturados
            </span>
          </div>
        </div>
      </section>

      {/* Diagnóstico de Maturidade */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-signal-600">
              Diagnóstico de Maturidade
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-indigo-800 sm:text-4xl">
              Antes de assinar, saiba onde sua empresa está hoje
            </h2>
            <p className="mt-4 leading-relaxed text-graphite-500">
              O Diagnóstico de Maturidade em Inclusão é um questionário gratuito que avalia
              quatro indicadores-chave do seu processo atual e devolve, na hora, um panorama
              claro do que já funciona e do que precisa de estrutura.
            </p>
            <Button to="/diagnostico" className="mt-7">
              Fazer diagnóstico gratuito
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {diagnosticoItens.map((item, i) => (
              <Reveal
                key={item.titulo}
                delay={i * 80}
                className="rounded-2xl border border-mist-300 bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-signal-300 hover:shadow-pop"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-signal-50 text-signal-700">
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
      </section>

      {/* Produtos */}
      <section className="bg-mist-200 py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-signal-600">
              Três formas de estruturar a inclusão
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-indigo-800 sm:text-4xl">
              Tudo o que a inclusão precisa para sair do improviso
            </h2>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {produtos.map((p, i) => (
              <Reveal
                key={p.nome}
                delay={i * 100}
                className="flex flex-col rounded-2xl border border-mist-300 bg-white p-8 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-signal-300 hover:shadow-pop"
              >
                <span
                  className={`inline-block w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                    p.accent === 'signal'
                      ? 'bg-signal-50 text-signal-700'
                      : p.accent === 'volt'
                        ? 'bg-volt-50 text-volt-700'
                        : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {p.tag}
                </span>
                <h3 className="mt-4 font-display text-2xl font-semibold text-indigo-800">
                  {p.nome}
                </h3>
                <p className="mt-3 flex-1 leading-relaxed text-graphite-500">{p.descricao}</p>
                <ul className="mt-6 space-y-2.5">
                  {p.itens.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-graphite-700">
                      <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-signal-600" fill="currentColor">
                        <path d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5a1 1 0 111.4-1.4l3.9 3.9 6.7-6.7a1 1 0 011.4 0z" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                {p.preco && (
                  <p className="mt-6 border-t border-mist-300 pt-4 text-sm font-semibold text-amber-700">
                    {p.preco}
                  </p>
                )}
              </Reveal>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link to="/produtos" className="text-sm font-semibold text-indigo-700 hover:text-signal-600">
              Ver planos e detalhes dos produtos →
            </Link>
          </div>
        </div>
      </section>

      {/* Galeria de slides */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-volt-600">
            Antes de criar sua conta
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-indigo-800 sm:text-4xl">
            Veja como fica o resultado na prática
          </h2>
          <p className="mt-3 leading-relaxed text-graphite-500">
            Slides reais dos kits do IncluiPro Lidera — clique em qualquer miniatura para ampliar.
          </p>
        </Reveal>

        <Reveal delay={100} className="mt-10">
          <SlideGallery />
        </Reveal>

        <Reveal delay={150} className="mt-14 grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-signal-600">
              Relatório do IncluiPro Avalia
            </p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-indigo-800">
              Um relatório completo, com estrutura fixa e recursos sugeridos por deficiência
            </h3>
            <p className="mt-3 leading-relaxed text-graphite-500">
              Veja uma amostra completa e ilustrativa, com dados fictícios, sem precisar criar
              conta: cabeçalho, identificação, seções coloridas por tema, recursos sugeridos,
              plano de ação e o aviso legal fixo — exatamente como no PDF exportado.
            </p>
            <button
              onClick={() => setAmostraAberta(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-indigo-700 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-800 hover:shadow-pop"
            >
              📄 Ver amostra completa do relatório
            </button>
          </div>
          <div className="overflow-hidden rounded-2xl border border-mist-300 bg-white shadow-card transition-transform duration-300 hover:-translate-y-1 hover:shadow-pop">
            <img
              src="/previews/avalia-relatorio.png"
              alt="Exemplo real de relatório gerado pelo IncluiPro Avalia, com dados da avaliação, deficiência, rotina e autonomia, e parecer final"
              className="h-72 w-full object-cover object-top"
            />
          </div>
        </Reveal>
      </section>

      <ReportSampleModal open={amostraAberta} onClose={() => setAmostraAberta(false)} />

      {/* Como funciona */}
      <section className="bg-mist-200 py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-signal-600">
              Como funciona
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-indigo-800 sm:text-4xl">
              Da conta criada ao primeiro relatório, em um único fluxo
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {passos.map((p, i) => (
              <Reveal key={p.numero} delay={i * 100} direction="left" className="relative">
                <span className="font-display text-5xl font-semibold text-mist-400">
                  {p.numero}
                </span>
                <h3 className="mt-3 font-display text-xl font-semibold text-indigo-800">
                  {p.titulo}
                </h3>
                <p className="mt-2 leading-relaxed text-graphite-500">{p.texto}</p>
                {i < passos.length - 1 && (
                  <div className="absolute right-[-1.5rem] top-6 hidden h-px w-8 bg-mist-400 md:block" />
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <Reveal className="step-pattern relative overflow-hidden rounded-3xl bg-indigo-800 px-8 py-14 text-center sm:px-16">
          <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
            Pronto para estruturar a inclusão na sua empresa?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-indigo-200">
            Comece com o diagnóstico gratuito ou crie sua conta e assine para acessar a
            plataforma completa.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button to="/cadastro" size="lg">Criar conta e assinar</Button>
            <Button to="/diagnostico" variant="outlineLight" size="lg">
              Fazer diagnóstico gratuito
            </Button>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
