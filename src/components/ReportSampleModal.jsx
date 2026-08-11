import { useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { montarRelatorio } from '../lib/montarRelatorio.js'

const AMOSTRA = {
  nome: 'Marina Alves Ferreira',
  cargo: 'Analista de Atendimento ao Cliente',
  empresa: 'Empresa Exemplo Ltda.',
  tipoDeficiencia: 'Deficiência auditiva',
  observacoesCondicao:
    'Usuária de aparelho auditivo bilateral. Comunica-se com apoio de leitura labial e, em contextos formais, Libras.',
  rotina:
    'Rotina independente para deslocamento e atividades do dia a dia. Prefere comunicação escrita em situações com ruído ambiente ou múltiplas pessoas falando ao mesmo tempo.',
  historico:
    'Três anos de experiência em atendimento ao cliente por chat e e-mail em empresa do setor de varejo.',
  necessidades:
    'Intérprete de Libras em reuniões de equipe e treinamentos. Comunicação via chat/e-mail como canal preferencial para demandas do dia a dia.',
  expectativas:
    'Espera um ambiente onde suas necessidades de comunicação sejam consideradas desde o primeiro dia, sem precisar solicitar ajustes repetidamente.',
  observacoesErgonomicas:
    'Posto de trabalho em área com ruído controlado, longe de corredores de grande circulação.',
  notasLivres:
    'Candidata demonstrou domínio técnico consistente com a vaga. Recomenda-se onboarding com apresentação prévia dos canais de comunicação disponíveis na equipe.',
  recursosSugeridos: [
    'Intérprete de Libras em reuniões, treinamentos e processos seletivos',
    'Legendas automáticas em vídeos e videochamadas',
    'Comunicação com apoio visual/escrito nas instruções do dia a dia',
    'Ambiente de trabalho com nível de ruído controlado',
  ],
}

const relatorioAmostra = montarRelatorio({ ...AMOSTRA, recursosSugeridos: [] })

export function ReportSampleModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-indigo-950/80 p-4 py-10 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-2xl bg-white shadow-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 rounded-t-2xl border-b border-mist-300 bg-white/95 px-6 py-3.5 backdrop-blur">
          <p className="text-sm font-semibold text-indigo-800">
            Amostra do relatório — IncluiPro Avalia
          </p>
          <button
            onClick={onClose}
            aria-label="Fechar amostra"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-mist-400 text-graphite-500 hover:border-signal-400 hover:text-signal-600"
          >
            ✕
          </button>
        </div>

        {/* "Folha de papel" */}
        <div className="grid gap-0 p-6 sm:p-10 md:grid-cols-[1.5fr_1fr] md:gap-8">
          <div>
            <div className="flex items-center gap-2">
              {['bg-[#1F3B33]', 'bg-[#2FBF8F]', 'bg-[#7C5CFC]'].map((c) => (
                <span key={c} className={`h-3.5 w-3.5 rounded-[3px] ${c}`} />
              ))}
              <span className="ml-1 font-display text-sm font-bold tracking-wide text-[#1F3B33]">
                INCLUIPRO
              </span>
            </div>
            <h2 className="mt-6 font-display text-2xl font-semibold text-[#1F3B33]">
              Relatório Técnico de Inclusão
            </h2>
            <p className="mt-1 text-xs font-semibold text-[#7C5CFC]">
              Inclusão estruturada.
            </p>
            <p className="mt-4 text-xs leading-relaxed text-graphite-700">
              Este relatório apresenta recomendações técnicas destinadas a apoiar a inclusão, a
              acessibilidade e o desenvolvimento profissional da pessoa colaboradora. As
              orientações aqui descritas devem subsidiar a adaptação do ambiente de trabalho, dos
              processos de integração, das atividades e das ações de desenvolvimento, promovendo
              condições que favoreçam autonomia, participação e desempenho em igualdade de
              oportunidades.
            </p>

            <div className="mt-6 overflow-hidden rounded-lg border border-mist-300">
              <div className="bg-[#1F3B33] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white">
                Dados da Avaliação
              </div>
              <dl className="divide-y divide-mist-200 text-xs">
                {[
                  ['Nome do candidato', AMOSTRA.nome],
                  ['Cargo', AMOSTRA.cargo],
                  ['Empresa', AMOSTRA.empresa],
                ].map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[0.8fr_1.2fr] gap-2 px-4 py-2">
                    <dt className="font-semibold text-graphite-500">{label}</dt>
                    <dd className="text-graphite-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-4 overflow-hidden rounded-lg border border-mist-300">
              <div className="bg-[#7C5CFC] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white">
                Deficiência
              </div>
              <dl className="divide-y divide-mist-200 text-xs">
                <div className="grid grid-cols-[0.8fr_1.2fr] gap-2 px-4 py-2">
                  <dt className="font-semibold text-graphite-500">Deficiência da pessoa candidata</dt>
                  <dd className="text-graphite-900">{AMOSTRA.tipoDeficiencia}</dd>
                </div>
                <div className="grid grid-cols-[0.8fr_1.2fr] gap-2 px-4 py-2">
                  <dt className="font-semibold text-graphite-500">Observações sobre a condição</dt>
                  <dd className="text-graphite-900">{AMOSTRA.observacoesCondicao}</dd>
                </div>
              </dl>
            </div>

            <div className="prose-report mt-4 text-xs">
              <ReactMarkdown>{relatorioAmostra}</ReactMarkdown>
            </div>
          </div>

          {/* Sidebar: checklist de recursos + plano de ação */}
          <div className="mt-8 md:mt-0">
            <div className="rounded-xl border border-signal-200 bg-signal-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-signal-700">
                Recursos e adaptações sugeridas
              </p>
              <ul className="mt-3 space-y-2">
                {AMOSTRA.recursosSugeridos.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-xs text-graphite-700">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-signal-600 text-[9px] text-white">
                      ✓
                    </span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 rounded-xl border border-volt-200 bg-volt-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-volt-700">
                Plano de ação sugerido
              </p>
              <ol className="mt-3 space-y-2 text-xs text-graphite-700">
                <li>1. Alinhar intérprete de Libras para a primeira semana de onboarding.</li>
                <li>2. Configurar legendas automáticas nas ferramentas de videochamada da equipe.</li>
                <li>3. Revisar em 30 dias se os ajustes atendem à rotina real da colaboradora.</li>
              </ol>
            </div>

            <div className="mt-4 rounded-xl border border-mist-300 bg-mist-100 p-4">
              <p className="text-[10px] leading-relaxed text-graphite-500">
                <strong className="text-graphite-700">Avisos legais fixos:</strong> este relatório
                tem caráter técnico e social, elaborado com base nas informações obtidas durante a
                entrevista de avaliação. Não substitui laudos médicos, psicológicos ou demais
                documentos legais relacionados ao enquadramento da deficiência, servindo
                exclusivamente como instrumento de apoio à promoção da acessibilidade e inclusão
                no ambiente de trabalho.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-b-2xl border-t border-mist-300 bg-mist-100 px-6 py-4 text-center text-xs text-graphite-500 sm:px-10">
          Esta é uma amostra ilustrativa com dados fictícios. Crie sua conta para gerar relatórios
          reais com o IncluiPro Avalia.
        </div>
      </div>
    </div>
  )
}
