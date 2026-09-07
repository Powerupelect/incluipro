import { useEffect, useRef, useState } from 'react'
import { Button } from './ui/Button.jsx'

// Capturas reais da conta de demonstração — ver public/demo/README.txt para o que cada
// arquivo deve mostrar quando substituído (por enquanto são placeholders .svg).
const TELAS = [
  {
    numero: '01',
    titulo: 'A conta que ninguém mostra',
    texto:
      'Total de empregados, exclusões legais e percentual aplicado — a base de cálculo aberta, do jeito que a fiscalização verifica. Errar o denominador é uma das maiores causas de autuação.',
    imagem: '/demo/painel.svg',
    alt: 'Painel do IncluiPro mostrando o cálculo aberto da cota de PCD, com total de empregados, exclusões legais e percentual aplicado.',
  },
  {
    numero: '02',
    titulo: 'Relatório técnico sem partir do zero',
    texto:
      'Estrutura padronizada e orientação durante o preenchimento. A informação é registrada uma vez e reaproveitada nos documentos seguintes.',
    imagem: '/demo/avaliacoes.svg',
    alt: 'Tela de avaliação do IncluiPro com o relatório técnico de inclusão de um colaborador preenchido.',
  },
  {
    numero: '03',
    titulo: 'A liderança preparada antes da chegada',
    texto:
      'Kits em slides por tema e por tipo de deficiência, prontos para aplicar. Cada sessão realizada fica registrada com data e participantes.',
    imagem: '/demo/treinamentos.svg',
    alt: 'Tela de treinamentos do IncluiPro listando kits em slides organizados por tema e por tipo de deficiência.',
  },
  {
    numero: '04',
    titulo: 'O único canal feito para quem é incluído',
    texto:
      'Um link próprio da empresa para solicitar recursos e adaptações, com protocolo de acompanhamento. Nenhuma outra solução do mercado oferece esse lado.',
    imagem: '/demo/canal.svg',
    alt: 'Painel de Solicitações do IncluiPro com o link do Canal do Colaborador e pedidos recebidos.',
  },
  {
    numero: '05',
    titulo: 'Documentação pronta antes de precisar',
    texto:
      'Tudo que a empresa fez, consolidado em um documento único com protocolo e verificação de integridade.',
    imagem: '/demo/dossie.svg',
    alt: 'Página do Dossiê Técnico do IncluiPro, documento consolidado com protocolo de verificação.',
  },
]

/** Dispara uma vez, quando a imagem entra na viewport — adiciona a classe que aciona a
 * animação de entrada em CSS (ver .demo-item no index.css). Não repete ao rolar de volta. */
function useEntradaUnica(ref) {
  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') {
      node.classList.add('demo-item--visivel')
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add('demo-item--visivel')
          observer.disconnect()
        }
      },
      { threshold: 0.2 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [ref])
}

function ImagemDemo({ tela, containerRef }) {
  const imgRef = useRef(null)
  useEntradaUnica(imgRef)

  return (
    <div ref={containerRef}>
      <div className="mb-4 lg:hidden">
        <span className="font-display text-3xl font-semibold text-white/20">{tela.numero}</span>
        <h3 className="mt-1 font-display text-xl font-medium text-white">{tela.titulo}</h3>
        <p className="mt-2 text-sm leading-relaxed text-indigo-200">{tela.texto}</p>
      </div>
      <img
        ref={imgRef}
        src={tela.imagem}
        alt={tela.alt}
        width={1280}
        height={800}
        loading="lazy"
        decoding="async"
        className="demo-item w-full rounded-lg border border-white/10"
      />
    </div>
  )
}

export function DemoSection() {
  const [ativo, setAtivo] = useState(0)
  const refsImagens = useRef([])

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const indice = Number(entry.target.dataset.indice)
            setAtivo(indice)
          }
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )
    for (const node of refsImagens.current) {
      if (node) observer.observe(node)
    }
    return () => observer.disconnect()
  }, [])

  const telaAtiva = TELAS[ativo]

  return (
    <section className="bg-indigo-900 px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="font-display text-4xl font-medium text-white sm:text-5xl">
            Veja a plataforma por dentro
          </h2>
          <p className="mt-4 text-lg text-indigo-200">
            Três produtos, um único lugar. Sem instalação, sem planilha paralela.
          </p>
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-[2fr_3fr] lg:gap-16">
          <div className="hidden lg:block">
            {/* wrapper esticado pelo grid pra ter a altura da coluna de imagens — o sticky
                de verdade vai no filho, que fica com a altura natural do próprio texto
                (ver nota em index.css: sticky num elemento já esticado à altura do irmão
                praticamente não tem "janela" de rolagem pra grudar). */}
            <div className="demo-texto">
              <div key={telaAtiva.numero} className="demo-legenda">
                <span className="font-display text-5xl font-semibold text-white/20">{telaAtiva.numero}</span>
                <h3 className="mt-4 font-display text-2xl font-medium text-white">{telaAtiva.titulo}</h3>
                <p className="mt-3 text-base leading-relaxed text-indigo-200">{telaAtiva.texto}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-16">
            {TELAS.map((tela, i) => (
              <ImagemDemo
                key={tela.numero}
                tela={tela}
                containerRef={(node) => {
                  refsImagens.current[i] = node
                  if (node) node.dataset.indice = String(i)
                }}
              />
            ))}
          </div>
        </div>

        <p className="mt-16 text-center text-lg text-indigo-100">
          Quer ver com os números da sua empresa?{' '}
          <Button href="/cadastro" size="lg" className="ml-3">
            Fale com a gente
          </Button>
        </p>
      </div>
    </section>
  )
}
