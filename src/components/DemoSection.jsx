import { useEffect, useRef, useState } from 'react'
import { Button } from './ui/Button.jsx'
import { ReportSampleModal } from './ReportSampleModal.jsx'
import { DocumentoFolha } from './DocumentoFolha.jsx'

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
    titulo: 'Plano de Integração e Rotina Inclusiva sem partir do zero',
    texto:
      'Estrutura padronizada e orientação durante o preenchimento. A informação é registrada uma vez e reaproveitada nos documentos seguintes.',
    destaque:
      'Pode ser encaminhado direto para as lideranças responsáveis pelo colaborador — assim, todos os envolvidos já sabem como apoiar a inclusão desde o início.',
    imagens: [
      {
        src: '/previews/avalia-relatorio.png',
        largura: 888,
        altura: 1202,
        alt: 'Modelo de Plano de Integração e Rotina Inclusiva gerado pelo IncluiPro Avalia, com dados fictícios.',
        documento: true,
      },
      {
        src: '/demo/avaliacoes-app.png',
        largura: 1624,
        altura: 760,
        alt: 'Tela de avaliações do IncluiPro, dentro da plataforma.',
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
      'Um link próprio da empresa para solicitar recursos e adaptações, sem precisar de login, com protocolo de acompanhamento.',
    destaque: 'Nenhuma outra solução do mercado oferece esse lado.',
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
        a4: true,
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

function LupaZoom() {
  return (
    <span className="pointer-events-none absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-indigo-950/80 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M8.5 3a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM17 17l-3.5-3.5" strokeLinecap="round" />
      </svg>
    </span>
  )
}

function SetaImagem({ direcao, onClick, label, flutuante = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={
        flutuante
          ? `absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-indigo-950/80 text-lg text-white backdrop-blur hover:bg-indigo-900 ${
              direcao === 'anterior' ? 'left-3' : 'right-3'
            }`
          : 'flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/5 text-lg text-white transition-colors hover:border-signal-400 hover:bg-white/10'
      }
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
  const [amostraAberta, setAmostraAberta] = useState(false)
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

  function renderItem(img) {
    return (
img.documento ? (
          <DocumentoFolha
            src={img.src}
            alt={img.alt}
            largura={img.largura}
            altura={img.altura}
            onAbrir={() => setAmostraAberta(true)}
          />
        ) : img.a4 ? (
          <div className="relative mx-auto max-w-[520px] px-3 pb-4 pt-3 sm:px-6">
            <div className="absolute inset-x-8 top-0 bottom-6 rotate-[-2deg] rounded-sm bg-white/10" aria-hidden="true" />
            <div className="absolute inset-x-6 top-1 bottom-5 rotate-[1.5deg] rounded-sm bg-white/20" aria-hidden="true" />
            <button
              type="button"
              onClick={() => setAmpliada(true)}
              className="group relative flex aspect-[210/297] w-full cursor-zoom-in flex-col overflow-hidden rounded-sm bg-white shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] ring-1 ring-black/5 transition-transform duration-300 hover:-translate-y-1"
              aria-label={`Ampliar imagem: ${img.alt}`}
            >
              <img
                src={img.src}
                alt={img.alt}
                width={img.largura}
                height={img.altura}
                loading="lazy"
                decoding="async"
                className="w-full pt-[4%]"
              />
              <LupaZoom />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAmpliada(true)}
            className={`group relative block w-full cursor-zoom-in ${img.enquadrar ? 'rounded-lg border border-white/10 bg-white p-5 sm:p-8' : ''}`}
            aria-label={`Ampliar imagem: ${img.alt}`}
          >
            <img
              src={img.src}
              alt={img.alt}
              width={img.largura}
              height={img.altura}
              loading="lazy"
              decoding="async"
              className={
                img.enquadrar
                  ? 'mx-auto w-full max-w-[380px] transition-opacity group-hover:opacity-90 lg:max-w-[280px]'
                  : 'w-full rounded-lg border border-white/10 transition-opacity group-hover:opacity-90'
              }
            />
            <LupaZoom />
          </button>
        )
    )
  }

  return (
    <div ref={containerRef}>
      <div className="mb-4 lg:hidden">
        <span className="font-display text-3xl font-semibold text-white/20">{tela.numero}</span>
        <h3 className="mt-1 font-display text-2xl font-medium text-white">{tela.titulo}</h3>
        <p className="mt-2 text-base leading-relaxed text-indigo-200">{tela.texto}</p>
        {tela.destaque && (
          <p className="mt-2 text-base font-semibold leading-relaxed text-amber-300">{tela.destaque}</p>
        )}
      </div>

      <div ref={wrapperRef} className="demo-item relative">
        {/* Todas as imagens ocupam a mesma célula da grade: o quadro fica com a altura da
            maior e não "pula" ao trocar de imagem pelas setas. */}
        <div className="grid">
          {tela.imagens.map((img, i) => (
            <div
              key={img.src}
              style={{ gridArea: '1 / 1' }}
              aria-hidden={i !== indice}
              className={`self-center transition-opacity duration-300 ${i === indice ? 'opacity-100' : 'pointer-events-none invisible opacity-0'}`}
            >
              {renderItem(img)}
            </div>
          ))}
        </div>

        {temVarias && (
          <div className="mt-4 flex items-center justify-center gap-4">
            <SetaImagem
              direcao="anterior"
              label="Imagem anterior"
              onClick={() => setIndice((i) => (i - 1 + tela.imagens.length) % tela.imagens.length)}
            />
            <div className="flex gap-1.5">
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
            <SetaImagem
              direcao="proxima"
              label="Próxima imagem"
              onClick={() => setIndice((i) => (i + 1) % tela.imagens.length)}
            />
          </div>
        )}
      </div>

      <ReportSampleModal open={amostraAberta} onClose={() => setAmostraAberta(false)} />

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
                  flutuante
                  direcao="anterior"
                  label="Imagem anterior"
                  onClick={() => setIndice((i) => (i - 1 + tela.imagens.length) % tela.imagens.length)}
                />
                <SetaImagem
                  flutuante
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
    <section id="demonstracao" className="scroll-mt-16 overflow-x-clip bg-indigo-900 px-5 pb-24 pt-10 sm:px-8 sm:pb-28 sm:pt-12">
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
                {telaAtiva.destaque && (
                  <p className="mt-3 text-lg font-semibold leading-relaxed text-amber-300">{telaAtiva.destaque}</p>
                )}
              </div>
            </div>
          </div>

          <div className="min-w-0 flex flex-col gap-16">
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

        <div className="mt-20 flex flex-col items-center gap-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] px-6 py-10 text-center sm:px-10 lg:flex-row lg:justify-between lg:text-left">
          <div>
            <p className="font-display text-2xl font-medium text-white sm:text-3xl">
              Descubra a situação da sua empresa
            </p>
            <p className="mt-2 text-base text-indigo-200">
              Faça o diagnóstico gratuito de inclusão e cota de PCD — leva poucos minutos.
            </p>
          </div>
          <Button to="/diagnostico" size="lg" className="shrink-0">
            Realizar diagnóstico
          </Button>
        </div>
      </div>
    </section>
  )
}
