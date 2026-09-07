import { useEffect, useRef, useState } from 'react'
import { Button } from './ui/Button.jsx'

// Capturas reais — da conta de demonstração e do site público.
const TELAS = [
  {
    numero: '01',
    titulo: 'A conta que ninguém mostra',
    texto:
      'Total de empregados, exclusões legais e percentual aplicado — a base de cálculo aberta, do jeito que a fiscalização verifica. Errar o denominador é uma das maiores causas de autuação. A mesma lógica de consistência vale para os documentos que sustentam cada enquadramento.',
    imagens: [
      {
        src: '/demo/painel-app.png',
        largura: 1624,
        altura: 756,
        alt: 'Painel do IncluiPro mostrando o cálculo aberto da cota de PCD, com total de empregados, exclusões legais e percentual aplicado.',
      },
      {
        src: '/demo/documentos-app.png',
        largura: 1440,
        altura: 900,
        alt: 'Tela de Documentos do IncluiPro, com a checagem de consistência documental por colaborador.',
      },
    ],
  },
  {
    numero: '02',
    titulo: 'Relatório técnico sem partir do zero',
    texto:
      'Estrutura padronizada e orientação durante o preenchimento. A informação é registrada uma vez e reaproveitada nos documentos seguintes.',
    imagens: [
      {
        src: '/demo/avaliacoes-app.png',
        largura: 1624,
        altura: 760,
        alt: 'Tela de avaliações do IncluiPro, dentro da plataforma.',
      },
      {
        src: '/demo/relatorio-amostra.png',
        largura: 896,
        altura: 1213,
        alt: 'Modelo de Relatório Técnico de Inclusão gerado pelo IncluiPro Avalia, com dados fictícios.',
      },
    ],
  },
  {
    numero: '03',
    titulo: 'A liderança preparada antes da chegada',
    texto:
      'Kits em slides por tema e por tipo de deficiência, prontos para aplicar. Cada sessão realizada fica registrada com data e participantes.',
    imagens: [
      {
        src: '/demo/treinamentos-app.png',
        largura: 1440,
        altura: 1400,
        alt: 'Tela de treinamentos do IncluiPro listando kits em slides organizados por tema e por tipo de deficiência.',
      },
    ],
  },
  {
    numero: '04',
    titulo: 'O único canal feito para quem é incluído',
    texto:
      'Um link próprio da empresa para solicitar recursos e adaptações, sem precisar de login, com protocolo de acompanhamento. Nenhuma outra solução do mercado oferece esse lado.',
    imagens: [
      {
        src: '/demo/canal-app.png',
        largura: 1624,
        altura: 760,
        alt: 'Painel de Solicitações do IncluiPro com o link do Canal do Colaborador e pedidos recebidos.',
      },
      {
        src: '/demo/canal-formulario.png',
        largura: 878,
        altura: 1204,
        alt: 'Formulário público do Canal do Colaborador, sem necessidade de login.',
        enquadrar: true,
      },
      {
        src: '/demo/canal-confirmacao.png',
        largura: 796,
        altura: 398,
        alt: 'Tela de confirmação do Canal do Colaborador com o protocolo gerado.',
        enquadrar: true,
      },
    ],
  },
  {
    numero: '05',
    titulo: 'Documentação pronta antes de precisar',
    texto:
      'Tudo que a empresa fez, consolidado em um documento único com protocolo e verificação de integridade.',
    imagens: [
      {
        src: '/demo/dossie-real.png',
        largura: 1191,
        altura: 1314,
        alt: 'Página do Dossiê Técnico do IncluiPro, documento consolidado com protocolo de verificação.',
      },
    ],
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

function SetaImagem({ direcao, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-indigo-950/80 text-lg text-white backdrop-blur hover:bg-indigo-900 ${
        direcao === 'anterior' ? 'left-3' : 'right-3'
      }`}
    >
      {direcao === 'anterior' ? '‹' : '›'}
    </button>
  )
}

function ImagemDemo({ tela, containerRef }) {
  const wrapperRef = useRef(null)
  useEntradaUnica(wrapperRef)
  const [indice, setIndice] = useState(0)
  const [ampliada, setAmpliada] = useState(false)
  const imagem = tela.imagens[indice]
  const temVarias = tela.imagens.length > 1

  useEffect(() => {
    if (!ampliada) return
    function onKey(e) {
      if (e.key === 'Escape') setAmpliada(false)
      if (e.key === 'ArrowRight' && temVarias) setIndice((i) => (i + 1) % tela.imagens.length)
      if (e.key === 'ArrowLeft' && temVarias) setIndice((i) => (i - 1 + tela.imagens.length) % tela.imagens.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ampliada, temVarias, tela.imagens.length])

  return (
    <div ref={containerRef}>
      <div className="mb-4 lg:hidden">
        <span className="font-display text-3xl font-semibold text-white/20">{tela.numero}</span>
        <h3 className="mt-1 font-display text-2xl font-medium text-white">{tela.titulo}</h3>
        <p className="mt-2 text-base leading-relaxed text-indigo-200">{tela.texto}</p>
      </div>

      <div ref={wrapperRef} className="demo-item relative">
        <button
          type="button"
          onClick={() => setAmpliada(true)}
          className={`group block w-full cursor-zoom-in ${imagem.enquadrar ? 'rounded-lg border border-white/10 bg-white p-10 sm:p-14' : ''}`}
          aria-label={`Ampliar imagem: ${imagem.alt}`}
        >
          <img
            src={imagem.src}
            alt={imagem.alt}
            width={imagem.largura}
            height={imagem.altura}
            loading="lazy"
            decoding="async"
            className={
              imagem.enquadrar
                ? 'mx-auto max-w-[380px] transition-opacity group-hover:opacity-90'
                : 'w-full rounded-lg border border-white/10 transition-opacity group-hover:opacity-90'
            }
          />
          <span className="pointer-events-none absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-indigo-950/80 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M8.5 3a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM17 17l-3.5-3.5" strokeLinecap="round" />
            </svg>
          </span>
        </button>

        {temVarias && (
          <>
            <SetaImagem
              direcao="anterior"
              label="Imagem anterior"
              onClick={() => setIndice((i) => (i - 1 + tela.imagens.length) % tela.imagens.length)}
            />
            <SetaImagem
              direcao="proxima"
              label="Próxima imagem"
              onClick={() => setIndice((i) => (i + 1) % tela.imagens.length)}
            />
            <div className="mt-3 flex justify-center gap-1.5">
              {tela.imagens.map((img, i) => (
                <button
                  key={img.src}
                  onClick={() => setIndice(i)}
                  aria-label={`Ver imagem ${i + 1} de ${tela.imagens.length}`}
                  aria-current={i === indice}
                  className={`h-1.5 rounded-full transition-all ${i === indice ? 'w-6 bg-signal-400' : 'w-1.5 bg-white/25'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {ampliada && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/90 p-4 backdrop-blur-sm"
          onClick={() => setAmpliada(false)}
        >
          <div className="relative max-h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <img src={imagem.src} alt={imagem.alt} className="max-h-[90svh] w-auto rounded-lg" />
            <button
              onClick={() => setAmpliada(false)}
              aria-label="Fechar"
              className="absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-indigo-900 text-white shadow-pop hover:bg-indigo-800"
            >
              ✕
            </button>
            {temVarias && (
              <>
                <SetaImagem
                  direcao="anterior"
                  label="Imagem anterior"
                  onClick={() => setIndice((i) => (i - 1 + tela.imagens.length) % tela.imagens.length)}
                />
                <SetaImagem
                  direcao="proxima"
                  label="Próxima imagem"
                  onClick={() => setIndice((i) => (i + 1) % tela.imagens.length)}
                />
              </>
            )}
          </div>
        </div>
      )}
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
          <span className="inline-block rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-amber-300">
            Demonstração
          </span>
          <h2 className="mt-5 font-display text-4xl font-medium text-white sm:text-5xl">
            Veja a plataforma por dentro
          </h2>
          <p className="mt-4 text-xl text-indigo-200">
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
                <span className="font-display text-7xl font-semibold text-white/15">{telaAtiva.numero}</span>
                <h3 className="mt-5 font-display text-3xl font-medium leading-tight text-white">
                  {telaAtiva.titulo}
                </h3>
                <span className="mt-4 block h-px w-16 bg-gradient-to-r from-amber-400 to-transparent" />
                <p className="mt-5 text-lg leading-relaxed text-indigo-200">{telaAtiva.texto}</p>
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
