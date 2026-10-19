import { useEffect, useState } from 'react'
import { Button } from './ui/Button.jsx'
import { montarDadosDossie } from '../lib/dossie.js'
import { gerarDossiePDF, SECOES_DOSSIE } from '../lib/pdfDossie.js'
import { SUGESTAO_ESFORCOS_RECRUTAMENTO, SUGESTAO_PLANO_DE_ACAO, EXEMPLO_CAPACITACAO } from '../lib/sugestoesDossie.js'

const CAMPO =
  'mt-1.5 w-full rounded-md border border-mist-400 bg-white px-3 py-2 text-sm outline-none focus:border-signal-500 focus:ring-2 focus:ring-signal-100'

const VERSOES = [
  {
    id: 'completa',
    titulo: 'Dossiê completo',
    para: 'Para o RH e auditorias',
    texto: 'Resumo executivo, detalhamento por colaborador, Planos de Integração anexados e índice de evidências.',
  },
  {
    id: 'executiva',
    titulo: 'Dossiê executivo',
    para: 'Para a diretoria',
    texto: 'Indicadores, pontos de atenção e plano de ação, sem nomes nem dados pessoais de colaboradores.',
  },
]

const OPCIONAIS = SECOES_DOSSIE.filter((s) => !s.fixa)

function hojeLocal() {
  return new Date().toLocaleDateString('sv')
}

// Textos manuais ficam guardados neste navegador para não precisar redigitar a cada emissão.
function lerRascunho(chave) {
  try {
    return JSON.parse(localStorage.getItem(chave) || 'null')
  } catch {
    return null
  }
}

export function DossieGerador({ empresaId }) {
  const chave = `incluipro-dossie-${empresaId}`
  const [versao, setVersao] = useState('completa')
  const [periodo, setPeriodo] = useState({ inicio: `${hojeLocal().slice(0, 4)}-01-01`, fim: hojeLocal() })
  const [secoes, setSecoes] = useState(() => OPCIONAIS.map((s) => s.id))
  const [textos, setTextos] = useState(() => ({
    responsavelNome: '',
    responsavelCargo: '',
    planoDeAcao: '',
    esforcosRecrutamento: '',
    capacitacoes: '',
    documentosExternos: false,
    ...(lerRascunho(chave) || {}),
  }))
  const [gerando, setGerando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem(chave, JSON.stringify(textos))
    } catch {
      /* armazenamento indisponível — segue sem guardar o rascunho */
    }
  }, [chave, textos])

  const disponiveis = OPCIONAIS.filter((s) => versao === 'completa' || !s.completo)
  const alternarSecao = (id) => setSecoes((atual) => (atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]))
  const texto = (campo) => (e) => setTextos((t) => ({ ...t, [campo]: e.target.value }))

  async function handleGerar() {
    setErro('')
    if (!periodo.inicio || !periodo.fim || periodo.inicio > periodo.fim) {
      setErro('Confira o período: a data inicial deve ser anterior à final.')
      return
    }
    setGerando(true)
    try {
      const dados = await montarDadosDossie(empresaId, periodo)
      await gerarDossiePDF(dados, {
        versao,
        secoes,
        responsavelNome: textos.responsavelNome.trim(),
        responsavelCargo: textos.responsavelCargo.trim(),
        planoDeAcao: textos.planoDeAcao.trim() || null,
        esforcosRecrutamento: textos.esforcosRecrutamento.trim() || null,
        capacitacoes: textos.capacitacoes.trim() || null,
        documentosExternos: textos.documentosExternos,
      })
    } catch {
      setErro('Não foi possível gerar o dossiê agora. Tente novamente.')
    } finally {
      setGerando(false)
    }
  }

  return (
    <div className="rounded-lg border border-mist-300 bg-white p-6 sm:p-8">
      <h2 className="font-display text-lg font-semibold text-indigo-800">Dossiê de Gestão da Inclusão</h2>
      <p className="mt-1 text-sm text-graphite-500">
        Documento em PDF que organiza a situação da cota, as evidências e o plano de ação da empresa. Escolha a
        versão, o período e o que entra no documento.
      </p>

      <fieldset className="mt-6">
        <legend className="text-sm font-semibold text-graphite-700">1. Versão</legend>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {VERSOES.map((v) => (
            <label
              key={v.id}
              className={`cursor-pointer rounded-lg border p-4 transition-colors ${versao === v.id ? 'border-signal-500 bg-signal-50/60 ring-1 ring-signal-500' : 'border-mist-300 hover:border-mist-400'}`}
            >
              <input type="radio" name="versao" value={v.id} checked={versao === v.id} onChange={() => setVersao(v.id)} className="sr-only" />
              <span className="flex items-center justify-between gap-2">
                <span className="font-semibold text-indigo-900">{v.titulo}</span>
                <span className="text-xs font-medium text-signal-700">{v.para}</span>
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-graphite-500">{v.texto}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="text-sm font-semibold text-graphite-700">2. Período de referência</legend>
        <div className="mt-2 grid max-w-md grid-cols-2 gap-3">
          <label className="text-xs text-graphite-500">
            De
            <input type="date" value={periodo.inicio} max={periodo.fim} onChange={(e) => setPeriodo((p) => ({ ...p, inicio: e.target.value }))} className={CAMPO} />
          </label>
          <label className="text-xs text-graphite-500">
            Até
            <input type="date" value={periodo.fim} max={hojeLocal()} onChange={(e) => setPeriodo((p) => ({ ...p, fim: e.target.value }))} className={CAMPO} />
          </label>
        </div>
        <p className="mt-1.5 text-xs text-graphite-400">
          O período filtra adaptações, admissões, desligamentos e avaliações. A situação da cota é sempre a da data de emissão.
        </p>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="text-sm font-semibold text-graphite-700">3. Seções</legend>
        <p className="mt-1 text-xs text-graphite-400">Capa, sumário, resumo executivo e declaração entram sempre.</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {disponiveis.map((s) => (
            <label key={s.id} className="flex items-center gap-2.5 rounded-md border border-mist-200 px-3 py-2 text-sm text-graphite-700 hover:bg-mist-50">
              <input type="checkbox" checked={secoes.includes(s.id)} onChange={() => alternarSecao(s.id)} className="accent-signal-600" />
              {s.label}
            </label>
          ))}
        </div>
        {versao === 'completa' && (
          <label className="mt-3 flex items-start gap-2.5 text-sm text-graphite-700">
            <input
              type="checkbox"
              checked={textos.documentosExternos}
              onChange={(e) => setTextos((t) => ({ ...t, documentosExternos: e.target.checked }))}
              className="mt-0.5 accent-signal-600"
            />
            Os laudos, CID e comprovantes de reabilitação estão guardados em outro sistema ou pasta, fora da plataforma
          </label>
        )}
      </fieldset>

      <fieldset className="mt-6">
        <legend className="text-sm font-semibold text-graphite-700">4. Responsável pela emissão</legend>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-graphite-500">
            Nome
            <input value={textos.responsavelNome} onChange={texto('responsavelNome')} placeholder="Ex.: Ana Ribeiro" className={CAMPO} />
          </label>
          <label className="text-xs text-graphite-500">
            Cargo
            <input value={textos.responsavelCargo} onChange={texto('responsavelCargo')} placeholder="Ex.: Gerente de RH" className={CAMPO} />
          </label>
        </div>
      </fieldset>

      {secoes.includes('plano') && (
        <fieldset className="mt-6 space-y-4 rounded-md border border-mist-300 bg-mist-100 p-4">
          <legend className="px-1 text-sm font-semibold text-graphite-700">5. Plano de ação e iniciativas</legend>
          {[
            ['planoDeAcao', 'Plano de ação vigente', SUGESTAO_PLANO_DE_ACAO, 'Usar sugestão', 'Metas e prazos da empresa para cumprir a cota de PCD.', 2],
            ['esforcosRecrutamento', 'Esforços de recrutamento', SUGESTAO_ESFORCOS_RECRUTAMENTO, 'Usar sugestão', 'Como a empresa busca candidatos PCD para as vagas em aberto.', 2],
            ['capacitacoes', 'Treinamentos e capacitações realizados', EXEMPLO_CAPACITACAO, 'Usar exemplo', 'Um por linha: data — tema — quantidade de participantes.', 3],
          ].map(([campo, rotulo, sugestao, rotuloSugestao, placeholder, linhas]) => (
            <label key={campo} className="block text-sm">
              <span className="flex items-center justify-between gap-2 font-semibold text-graphite-700">
                {rotulo}
                <button type="button" onClick={() => setTextos((t) => ({ ...t, [campo]: sugestao }))} className="shrink-0 text-xs font-semibold text-volt-700 hover:text-volt-800">
                  {rotuloSugestao}
                </button>
              </span>
              <textarea rows={linhas} value={textos[campo]} onChange={texto(campo)} placeholder={placeholder} className={CAMPO} />
            </label>
          ))}
          <p className="text-xs text-graphite-400">Campos em branco ficam fora do documento. Os textos ficam salvos neste navegador.</p>
        </fieldset>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-mist-200 pt-5">
        <Button shape="crm" as="button" type="button" disabled={gerando} onClick={handleGerar}>
          {gerando ? 'Gerando…' : versao === 'executiva' ? 'Gerar dossiê executivo' : 'Gerar dossiê completo'}
        </Button>
        <span className="text-xs text-graphite-400">
          {versao === 'executiva' ? 'Sem dados pessoais — pode circular na diretoria.' : 'Contém dados sensíveis (LGPD) — compartilhe só com pessoas autorizadas.'}
        </span>
      </div>
      {erro && <p className="mt-3 text-sm text-red-600">{erro}</p>}
    </div>
  )
}
