import { Button } from '../components/ui/Button.jsx'
import { GaleriaHorizontal } from '../components/GaleriaHorizontal.jsx'

const SECOES = [
  {
    numero: '01',
    titulo: 'Painel',
    texto:
      'Total de empregados, exclusões legais e percentual aplicado — a base de cálculo aberta, do jeito que a fiscalização verifica.',
    itens: [
      { src: '/demo/painel-app.svg', alt: 'Painel do IncluiPro com o cálculo aberto da cota de PCD.', legenda: 'Painel — cota calculada' },
    ],
  },
  {
    numero: '02',
    titulo: 'Avaliações técnicas',
    texto:
      'Estrutura padronizada e orientação durante o preenchimento. A informação é registrada uma vez e reaproveitada nos documentos seguintes.',
    itens: [
      { src: '/demo/avaliacoes-app.svg', alt: 'Tela de avaliações do IncluiPro, dentro da plataforma.', legenda: 'Dentro da plataforma' },
      { src: '/demo/relatorio-amostra.png', alt: 'Modelo de Relatório Técnico de Inclusão gerado pelo IncluiPro Avalia, com dados fictícios.', legenda: 'Modelo do relatório gerado' },
    ],
  },
  {
    numero: '03',
    titulo: 'Treinamentos',
    texto:
      'Kits em slides por tema e por tipo de deficiência, prontos para aplicar. Cada sessão realizada fica registrada com data e participantes.',
    itens: [
      { src: '/demo/treinamentos-app.svg', alt: 'Tela de treinamentos do IncluiPro, dentro da plataforma.', legenda: 'Dentro da plataforma' },
      { src: '/demo/slide-capa.png', alt: 'Slide de capa do kit Fundamentos de Inclusão.', legenda: 'Fundamentos de Inclusão' },
      { src: '/demo/slide-checklist.png', alt: 'Slide da checklist mensal do gestor inclusivo.', legenda: 'Gestão do Dia a Dia' },
    ],
  },
  {
    numero: '04',
    titulo: 'Canal do Colaborador',
    badge: 'Novidade · diferencial de mercado',
    texto:
      'Um link próprio da empresa para o colaborador solicitar recursos e adaptações, sem precisar de login, com protocolo de acompanhamento. Nenhuma outra solução do mercado oferece esse lado.',
    itens: [
      { src: '/demo/canal-app.svg', alt: 'Painel de Solicitações do IncluiPro com o link do Canal do Colaborador e pedidos recebidos.', legenda: 'Link e solicitações recebidas' },
    ],
  },
  {
    numero: '05',
    titulo: 'Dossiê Técnico',
    texto:
      'Tudo que a empresa fez, consolidado em um documento único com protocolo e verificação de integridade.',
    itens: [
      { src: '/demo/dossie-real.png', alt: 'Página do Dossiê Técnico do IncluiPro, documento consolidado com protocolo de verificação de integridade.', legenda: 'Protocolo e hash de integridade' },
    ],
  },
]

export function Demonstracao() {
  return (
    <div className="bg-indigo-950">
      <section className="px-5 pb-16 pt-24 sm:px-8 sm:pt-28">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-block rounded-full border border-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-signal-300">
            Demonstração
          </span>
          <h1 className="mt-5 font-display text-4xl font-medium text-white sm:text-5xl">
            A plataforma por dentro, produto a produto
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-indigo-200">
            Três produtos, um único lugar. Capturas reais da plataforma e dos documentos que ela
            entrega — sem instalação, sem planilha paralela.
          </p>
        </div>
      </section>

      {SECOES.map((secao, i) => (
        <section
          key={secao.numero}
          className={`border-t border-white/10 px-5 py-16 sm:px-8 sm:py-20 ${i % 2 === 1 ? 'bg-indigo-900/40' : ''}`}
        >
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className="font-display text-3xl font-semibold text-white/20">{secao.numero}</span>
                  <h2 className="font-display text-2xl font-medium text-white sm:text-3xl">{secao.titulo}</h2>
                </div>
                <p className="mt-3 text-base leading-relaxed text-indigo-200">{secao.texto}</p>
              </div>
              {secao.badge && (
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-amber-300">
                  ★ {secao.badge}
                </span>
              )}
            </div>

            <div className="mt-8">
              <GaleriaHorizontal itens={secao.itens} />
            </div>
          </div>
        </section>
      ))}

      <section className="border-t border-white/10 px-5 py-20 text-center sm:px-8">
        <p className="text-lg text-indigo-100">
          Quer ver com os números da sua empresa?
        </p>
        <Button to="/cadastro" size="lg" className="mt-5">
          Começar agora
        </Button>
      </section>
    </div>
  )
}
