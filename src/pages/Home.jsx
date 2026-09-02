import { useState } from 'react'
import { Button } from '../components/ui/Button.jsx'
import { Reveal } from '../components/Reveal.jsx'
import { SlideGallery } from '../components/SlideGallery.jsx'
import { ReportSampleModal } from '../components/ReportSampleModal.jsx'
import { FaqAccordion } from '../components/FaqAccordion.jsx'
import { CalculadoraCota } from '../components/CalculadoraCota.jsx'
import { MomentoDossie } from '../components/MomentoDossie.jsx'

const LINK_KIT_PERSONALIZADO =
  'mailto:contato@incluipro.com?subject=Solicita%C3%A7%C3%A3o%20de%20Kit%20Personalizado'
const LINK_SOLICITAR_PROPOSTA =
  'mailto:contato@incluipro.com?subject=Solicita%C3%A7%C3%A3o%20de%20Proposta%20-%20Plano%20Empresarial'
const LINK_FALAR_CONSULTOR = 'mailto:contato@incluipro.com?subject=Contato%20Enterprise'
const LINK_PROGRAMA_FUNDADORES =
  'mailto:contato@incluipro.com?subject=Interesse%20no%20Programa%20Fundadores'

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

const avaliaItens = [
  'Reduz o tempo do RH em cada avaliação — formulário guiado por blocos substitui anotações soltas e retrabalho.',
  'Relatório técnico pronto em minutos, no modelo oficial IncluiPro (Rotina e Autonomia, Observações Ergonômicas e Ambientais, Parecer e Recomendações).',
  'Recomendações certas na hora certa: Consulta Rápida sugere ajustes por tipo de deficiência (visual, física, auditiva, intelectual, cognitiva/neurodivergente, múltipla).',
  'Edição livre do texto antes de finalizar — sua equipe mantém o controle editorial completo.',
  'Histórico organizado e pronto para consulta — documentação rastreável para auditorias e fiscalizações da Lei de Cotas.',
]

const lideraItens = [
  'Reduz turnover e afastamentos evitáveis — líderes preparados para gerir equipes inclusivas desde o primeiro dia.',
  'Pronto para usar hoje: kits organizados por tema (fundamentos, comunicação e postura, gestão do dia a dia, casos práticos), sem esperar cronograma de consultoria.',
  'Conteúdo atualizado continuamente, sem custo adicional — sua assinatura sempre acompanha a metodologia mais recente.',
  'Funciona para qualquer nível de liderança, sem exigir conhecimento prévio em diversidade e inclusão.',
]

const comoFunciona = [
  { numero: '01', titulo: 'Cadastro da empresa', texto: 'Crie a conta da empresa em poucos minutos.' },
  { numero: '02', titulo: 'Cálculo da cota', texto: 'Descubra a cota de PCD devida por lei e quantas vagas estão em aberto, com nosso calculador gratuito.' },
  { numero: '03', titulo: 'Avaliação dos colaboradores', texto: 'Gere Relatórios Técnicos de Inclusão padronizados com o IncluiPro Avalia.' },
  { numero: '04', titulo: 'Capacitação das lideranças', texto: 'Distribua treinamentos prontos do IncluiPro Lidera para as equipes de gestão.' },
  { numero: '05', titulo: 'Documentação organizada', texto: 'Centralize toda a documentação de inclusão em um só lugar.' },
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
    pergunta: 'O que está incluído no Plano Empresarial?',
    resposta:
      'O Plano Empresarial inclui acesso completo ao IncluiPro Avalia e ao IncluiPro Lidera, atualizações constantes da plataforma, novos treinamentos, atualizações legais e melhorias contínuas, além de suporte por e-mail para a equipe de RH. O preço varia conforme o porte da empresa — solicite uma proposta para ver a condição do seu caso.',
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
      'Solicite uma proposta pelo site. Nossa equipe entra em contato para entender o porte da sua empresa, apresentar a condição comercial e liberar o acesso à plataforma.',
  },
]

export function Home() {
  const [amostraAberta, setAmostraAberta] = useState(false)

  return (
    <div>
      {/* Hero — claro */}
      <section id="hero" className="relative overflow-hidden bg-mist-100 px-5 py-20 sm:px-8 sm:py-28">
        <div className="hero-mosaic absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-5xl">
          <Reveal className="max-w-3xl">
            <h1 className="font-display text-4xl font-medium leading-[1.08] text-indigo-900 sm:text-6xl sm:leading-[1.05] lg:text-7xl">
              Estruture a inclusão de pessoas com deficiência em um só lugar.
            </h1>
            <p className="mt-6 max-w-[62ch] text-lg leading-relaxed text-graphite-500">
              Relatórios técnicos, treinamentos para lideranças e ferramentas para apoiar o RH na
              construção de processos de inclusão mais organizados e consistentes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button to="/#avalia" size="lg">Conhecer as soluções</Button>
              <Button to="/#planos" variant="ghost" size="lg">Ver planos</Button>
            </div>
            <div className="mt-8 inline-flex flex-wrap items-center gap-x-6 gap-y-1.5 rounded-2xl border border-mist-300 bg-white/80 px-6 py-4 text-sm font-medium text-graphite-700 shadow-card backdrop-blur">
              <span>Alinhado à LBI e à Lei de Cotas</span>
              <span aria-hidden="true" className="text-signal-500">·</span>
              <span>Metodologia especializada</span>
              <span aria-hidden="true" className="text-signal-500">·</span>
              <span>Atualizações constantes</span>
            </div>
          </Reveal>

          <Reveal delay={100} className="mt-16">
            <p className="font-display text-xl font-medium text-indigo-900">
              Qual é a cota de PCD da sua empresa?
            </p>
            <p className="mt-1.5 max-w-[60ch] text-[15px] text-graphite-500">
              Sem cadastro. Informe alguns números do seu quadro e veja a cota devida, as vagas em
              aberto e a exposição estimada.
            </p>
            <div className="mt-6">
              <CalculadoraCota />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Problema — claro */}
      <section id="problema" className="relative overflow-hidden bg-white px-5 py-24 sm:px-8 sm:py-28">
        <div className="hero-mosaic absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-4xl">
          <Reveal>
            <h2 className="max-w-2xl font-display text-4xl font-medium leading-tight text-indigo-900">
              Quando a inclusão depende de processos manuais, o RH perde tempo.
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {problemas.map((p, i) => (
              <Reveal
                key={p.titulo}
                delay={i * 100}
                direction="scale"
                className="group rounded-2xl border border-mist-300 bg-mist-100 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-signal-300 hover:bg-white hover:shadow-pop"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-signal-50 text-signal-700 transition-transform duration-300 group-hover:scale-110">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    {p.icon}
                  </svg>
                </span>
                <p className="mt-4 font-display text-base font-semibold text-indigo-900">
                  {p.titulo}
                </p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-graphite-500">{p.texto}</p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200} className="mt-14">
            <p className="font-display text-xl font-medium text-indigo-900">
              A IncluiPro reúne essas frentes em uma única plataforma.
            </p>
          </Reveal>
        </div>
      </section>

      {/* O momento — documentos dispersos convergindo para o dossiê, claro → escuro */}
      <MomentoDossie />

      {/* IncluiPro Avalia — escuro */}
      <section id="avalia" className="bg-indigo-900 px-5 py-24 sm:px-8 sm:py-28">
        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[3fr_2fr] lg:items-center">
          <Reveal>
            <h2 className="font-display text-4xl font-medium text-white">IncluiPro Avalia</h2>
            <p className="mt-2 text-sm font-medium text-indigo-300">Relatórios Técnicos de Inclusão</p>
            <p className="mt-5 max-w-[60ch] text-[15px] leading-relaxed text-indigo-200">
              Você preenche as anotações da entrevista em um formulário organizado por blocos, com
              uma Consulta Rápida de recursos sugeridos por tipo de deficiência. O sistema monta o
              relatório automaticamente — editável, antes de exportar em PDF.
            </p>
            <ul className="mt-7 space-y-3">
              {avaliaItens.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-indigo-100">
                  <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-signal-400" fill="currentColor">
                    <path d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5a1 1 0 111.4-1.4l3.9 3.9 6.7-6.7a1 1 0 011.4 0z" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <button
                onClick={() => setAmostraAberta(true)}
                className="inline-flex items-center gap-2 rounded-full bg-signal-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-signal-400"
              >
                Ver amostra completa do relatório
              </button>
              <Button to="/diagnostico" variant="outlineLight">
                Fazer diagnóstico gratuito
              </Button>
            </div>
          </Reveal>

          <Reveal delay={120} direction="scale">
            <img
              src="/previews/avalia-relatorio.png"
              alt="Relatório Técnico de Inclusão real gerado pelo IncluiPro Avalia"
              className="w-full rounded-lg border border-white/10"
              width={640}
              height={800}
              loading="lazy"
            />
          </Reveal>
        </div>
      </section>

      <ReportSampleModal open={amostraAberta} onClose={() => setAmostraAberta(false)} />

      {/* IncluiPro Lidera — claro, com prévias grandes dos slides */}
      <section id="lidera" className="relative overflow-hidden bg-white px-5 py-24 sm:px-8 sm:py-28">
        <div className="hero-mosaic absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl">
          <div className="grid gap-14 lg:grid-cols-[3fr_2fr] lg:items-center">
            <Reveal>
              <h2 className="font-display text-4xl font-medium text-indigo-900">IncluiPro Lidera</h2>
              <p className="mt-2 text-sm font-medium text-signal-700">Treinamentos para Lideranças</p>
              <p className="mt-5 max-w-[60ch] text-[15px] leading-relaxed text-graphite-500">
                Uma biblioteca de kits de treinamento em slides, organizados por tema — fundamentos,
                comunicação e postura, gestão do dia a dia, casos práticos — prontos para baixar e
                usar em reuniões e capacitações internas.
              </p>
              <ul className="mt-7 space-y-3">
                {lideraItens.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-graphite-700">
                    <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-signal-600" fill="currentColor">
                      <path d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5a1 1 0 111.4-1.4l3.9 3.9 6.7-6.7a1 1 0 011.4 0z" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={120} direction="scale">
              <img
                src="/previews/gallery/checklist.png"
                alt="Slide real de um kit do IncluiPro Lidera"
                className="w-full rounded-lg border border-mist-300"
                width={640}
                height={360}
                loading="lazy"
              />
            </Reveal>
          </div>

          <Reveal delay={150} className="mt-16">
            <p className="text-sm font-medium text-graphite-700">
              Todos os slides do IncluiPro Lidera — clique em qualquer miniatura para ampliar.
            </p>
            <div className="mt-6">
              <SlideGallery />
            </div>
          </Reveal>

          <Reveal delay={200} className="mt-16 flex flex-col items-center gap-5 border-t border-mist-300 pt-14 text-center">
            <div>
              <p className="font-display text-2xl font-semibold text-indigo-900 sm:text-3xl">
                Sua empresa precisa de algo específico?
              </p>
              <p className="mt-2 text-base text-graphite-500">
                Solicite um Kit Personalizado, sob consulta e orçamento.
              </p>
            </div>
            <Button href={LINK_KIT_PERSONALIZADO} size="lg">
              Solicitar personalização
            </Button>
          </Reveal>
        </div>
      </section>

      {/* Como funciona — escuro */}
      <section id="como-funciona" className="bg-indigo-900 px-5 py-24 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal className="max-w-2xl">
            <h2 className="font-display text-4xl font-medium text-white">
              Um fluxo simples, do cadastro à documentação organizada
            </h2>
          </Reveal>

          <div className="relative mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
            <Reveal
              direction="scale"
              className="absolute left-0 right-0 top-6 hidden h-px origin-left bg-signal-500/40 lg:block"
            />
            {comoFunciona.map((p, i) => (
              <Reveal key={p.numero} delay={i * 100} className="relative">
                <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-signal-500 font-display text-sm font-semibold text-white">
                  {p.numero}
                </span>
                <h3 className="mt-4 font-display text-lg font-medium text-white">
                  {p.titulo}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-indigo-200">{p.texto}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Planos e valores — claro */}
      <section id="planos" className="relative overflow-hidden bg-white px-5 py-24 sm:px-8 sm:py-28">
        <div className="hero-mosaic absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-5xl">
          <Reveal className="max-w-2xl">
            <h2 className="font-display text-4xl font-medium text-indigo-900">
              Quanto custa NÃO ter a IncluiPro?
            </h2>
            <p className="mt-4 max-w-[60ch] text-[15px] leading-relaxed text-graphite-500">
              O investimento mensal deve ser analisado considerando o conjunto de atividades,
              recursos e tempo envolvidos na estruturação da inclusão.
            </p>
          </Reveal>

          <Reveal delay={100} className="mt-12 overflow-hidden rounded-2xl border border-mist-300">
            <div className="grid md:grid-cols-2">
              <div className="bg-mist-100 p-8 sm:p-10">
                <p className="text-xs font-semibold text-graphite-500">Sem IncluiPro</p>
                <ul className="mt-6 space-y-6">
                  <li>
                    <p className="text-sm text-graphite-500">1 avaliação com consultora</p>
                    <p className="mt-1 font-display text-2xl font-semibold text-indigo-900">R$ 300–800</p>
                  </li>
                  <li>
                    <p className="text-sm text-graphite-500">1 multa por vaga*</p>
                    <p className="mt-1 font-display text-2xl font-semibold text-indigo-900">R$ 3.499,80 a R$ 349.978,53</p>
                  </li>
                  <li>
                    <p className="text-sm text-graphite-500">Treinamento criado do zero</p>
                    <p className="mt-1 font-display text-2xl font-semibold text-indigo-900">R$ 2.000+</p>
                  </li>
                </ul>
              </div>
              <div className="orbit-glow bg-white p-8 sm:p-10">
                <p className="text-xs font-semibold text-signal-700">Com IncluiPro</p>
                <ul className="mt-6 space-y-4">
                  {['Sem limite de relatórios no período', ...atualizacoes.slice(0, 3)].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-base font-medium text-indigo-900">
                      <svg viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 shrink-0 text-signal-600" fill="currentColor">
                        <path d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5a1 1 0 111.4-1.4l3.9 3.9 6.7-6.7a1 1 0 011.4 0z" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 border-t border-mist-300 pt-6">
                  <p className="font-display text-xl font-semibold text-indigo-900">
                    Planos conforme o porte da empresa
                  </p>
                  <p className="mt-1 text-xs text-graphite-500">
                    Produto único, sem travamento de recurso — o que varia é o preço, por faixa de
                    funcionários.
                  </p>
                  <Button href={LINK_SOLICITAR_PROPOSTA} className="mt-5 w-full justify-center">
                    Solicitar proposta
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={150} className="mt-6 overflow-hidden rounded-2xl border border-mist-300 bg-mist-100 p-8 sm:p-10">
            <span className="text-xs font-semibold text-graphite-500">Enterprise</span>
            <p className="mt-3 font-display text-xl font-medium text-indigo-900">
              Para empresas com múltiplas unidades ou operações de grande porte
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {['Múltiplas unidades', 'Gestão de acessos', 'Importação em massa', 'Onboarding assistido'].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-graphite-700">
                  <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-signal-600" fill="currentColor">
                    <path d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5a1 1 0 111.4-1.4l3.9 3.9 6.7-6.7a1 1 0 011.4 0z" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <Button href={LINK_FALAR_CONSULTOR} variant="ghost" className="mt-6">
              Falar com consultor
            </Button>
          </Reveal>

          <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed text-graphite-400">
            *De R$ 3.499,80 a R$ 349.978,53 por vaga (Portaria Interministerial MPS/MF nº 13/2026).
            Valor sujeito a critérios de gradação. A IncluiPro não garante isenção de multas nem
            substitui orientação jurídica — o objetivo da plataforma é apoiar a organização e a
            documentação dos processos de inclusão.
          </p>

          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {depoimentos.map((d, i) => (
              <Reveal
                key={d.nome}
                delay={i * 100}
                className="flex flex-col rounded-2xl border border-mist-300 bg-mist-100 p-7 shadow-card"
              >
                <svg viewBox="0 0 32 24" className="h-8 w-8 text-signal-300" fill="currentColor">
                  <path d="M0 24V13.6C0 5.6 4.8 1 12.8 0l1.6 3.6C9.2 5.2 6.8 8 6.4 12H14v12H0zm18 0V13.6C18 5.6 22.8 1 30.8 0l1.6 3.6C27.2 5.2 24.8 8 24.4 12H32v12H18z" />
                </svg>
                <p className="mt-3 flex-1 text-base leading-relaxed text-graphite-800">
                  {d.citacao}
                </p>
                <div className="mt-6 flex items-center gap-3 border-t border-mist-300 pt-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-900 font-display text-sm font-semibold text-white">
                    {d.nome.charAt(0)}
                  </span>
                  <div>
                    <p className="font-display text-sm font-semibold text-indigo-900">{d.nome}</p>
                    <p className="text-xs text-graphite-500">{d.cargo} · {d.empresa}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Programa Fundadores — escuro */}
      <section id="fundadores" className="relative overflow-hidden bg-indigo-900 px-5 py-24 text-center sm:px-8 sm:py-28">
        <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-signal-500/10 blur-3xl" />
        <Reveal className="relative mx-auto max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-signal-400/30 bg-signal-500/10 px-4 py-1.5 text-xs font-semibold text-signal-300">
            Programa Fundadores
          </span>
          <h2 className="mt-5 font-display text-4xl font-medium leading-tight text-white sm:text-5xl">
            Condições especiais para as primeiras empresas participantes.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-indigo-200">
            O Programa Fundadores é a fase inicial de adoção da IncluiPro, com um número limitado
            de vagas. As empresas participantes contam com acompanhamento mais próximo da nossa
            equipe durante a implantação.
          </p>

          <div className="mx-auto mt-9 grid max-w-xl gap-3 text-left sm:grid-cols-1">
            {[
              'Um Kit Personalizado sem custo adicional',
              'Onboarding acompanhado pela nossa equipe',
              'Prioridade no atendimento durante a fase inicial',
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-5 py-4"
              >
                <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0 text-signal-400" fill="currentColor">
                  <path d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5a1 1 0 111.4-1.4l3.9 3.9 6.7-6.7a1 1 0 011.4 0z" />
                </svg>
                <p className="text-[15px] font-medium text-white">{item}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm text-indigo-300">
            Vagas limitadas, condição especial válida enquanto durar a fase inicial. Envie sua
            solicitação e nossa equipe entra em contato.
          </p>

          <Button href={LINK_PROGRAMA_FUNDADORES} size="lg" className="mt-7">
            Solicitar participação no Programa Fundadores
          </Button>
        </Reveal>
      </section>

      {/* FAQ — claro */}
      <section id="faq" className="relative overflow-hidden bg-white px-5 py-24 sm:px-8 sm:py-28">
        <div className="hero-mosaic absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl">
          <Reveal>
            <h2 className="font-display text-4xl font-medium text-indigo-900">
              Tudo o que você precisa saber antes de contratar
            </h2>
          </Reveal>

          <Reveal delay={100} className="mt-10">
            <FaqAccordion items={faqItems} />
          </Reveal>
        </div>
      </section>
    </div>
  )
}
