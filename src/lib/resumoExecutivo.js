// Resumo Executivo Mensal — PDF de uma única página para a diretoria (não confundir com
// o Relatório Técnico de Inclusão, que é por colaborador). Só entra aqui o que o sistema
// realmente rastreia: situação da cota, evolução no mês, pendências reais e adaptações
// implementadas — nada de métrica fictícia ou valor financeiro que a IncluiPro não calcula.

import { jsPDF } from 'jspdf'
import { faixaCota } from './cota.js'

const COLORS = {
  darkGreen: [31, 59, 51],
  brightTeal: [47, 191, 143],
  violet: [124, 92, 252],
  bodyText: [43, 43, 43],
  labelText: [26, 26, 26],
  footerGray: [153, 153, 153],
  ruleGray: [223, 223, 223],
  white: [255, 255, 255],
}

const MARGIN = 48
const PAGE_W = 595.28
const CONTENT_W = PAGE_W - MARGIN * 2

function drawHeader(doc, empresaNome, mesReferencia) {
  let x = MARGIN
  const y = MARGIN + 14
  ;[COLORS.darkGreen, COLORS.brightTeal, COLORS.violet].forEach((color) => {
    doc.setFillColor(...color)
    doc.rect(x, y - 10, 12, 12, 'F')
    x += 16
  })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...COLORS.darkGreen)
  doc.text('INCLUIPRO', x + 4, y)

  let cursorY = y + 28
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(...COLORS.darkGreen)
  doc.text('Resumo Executivo Mensal', MARGIN, cursorY)
  cursorY += 18
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...COLORS.bodyText)
  doc.text(`${empresaNome} · ${mesReferencia}`, MARGIN, cursorY)
  cursorY += 14
  doc.setDrawColor(...COLORS.ruleGray)
  doc.line(MARGIN, cursorY, PAGE_W - MARGIN, cursorY)
  return cursorY + 22
}

function drawSectionTitle(doc, y, titulo) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...COLORS.violet)
  doc.text(titulo.toUpperCase(), MARGIN, y)
  return y + 16
}

export function gerarResumoExecutivoPdf({
  empresaNome,
  mesReferencia,
  resultado,
  pcdAtivos,
  colaboradoresNovosNoMes,
  avaliacoesNoMes,
  adaptacoesConcluidasNoMes,
  adaptacoesConcluidasTotal,
  pendencias,
}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  let y = drawHeader(doc, empresaNome || 'Empresa', mesReferencia)

  // Situação da cota — o número dominante
  y = drawSectionTitle(doc, y, 'Situação da cota')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(32)
  doc.setTextColor(...COLORS.darkGreen)
  doc.text(`${pcdAtivos} / ${resultado.cotaDevida}`, MARGIN, y + 26)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...COLORS.bodyText)
  doc.text('colaboradores com deficiência na cota legal', MARGIN, y + 42)
  const situacaoTexto =
    resultado.vagasEmAberto > 0
      ? `${resultado.vagasEmAberto} vaga${resultado.vagasEmAberto !== 1 ? 's' : ''} em aberto`
      : 'Cota cumprida'
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...(resultado.vagasEmAberto > 0 ? [180, 83, 9] : COLORS.brightTeal))
  doc.text(situacaoTexto, MARGIN, y + 58)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.footerGray)
  doc.text(
    `Base de cálculo: ${resultado.base} empregados (${faixaCota(resultado.base)}) · alíquota ${Math.round(resultado.percentual * 100)}%`,
    MARGIN,
    y + 72,
  )
  y += 92

  // Evolução no mês
  y = drawSectionTitle(doc, y, 'Evolução no mês')
  const linhasEvolucao = [
    [`${colaboradoresNovosNoMes}`, 'colaborador(es) cadastrado(s)'],
    [`${avaliacoesNoMes}`, 'avaliação(ões) registrada(s)'],
    [`${adaptacoesConcluidasNoMes}`, 'adaptação(ões) concluída(s)'],
  ]
  const colW = CONTENT_W / 3
  linhasEvolucao.forEach(([numero, label], i) => {
    const x = MARGIN + colW * i
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(22)
    doc.setTextColor(...COLORS.darkGreen)
    doc.text(numero, x, y + 20)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...COLORS.bodyText)
    const wrapped = doc.splitTextToSize(label, colW - 10)
    doc.text(wrapped, x, y + 34)
  })
  y += 64

  // Pendências
  y = drawSectionTitle(doc, y, 'Pendências')
  if (!pendencias || pendencias.length === 0) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...COLORS.bodyText)
    doc.text('Nenhuma pendência identificada no momento.', MARGIN, y + 12)
    y += 26
  } else {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    for (const p of pendencias) {
      doc.setTextColor(...COLORS.bodyText)
      const wrapped = doc.splitTextToSize(`•  ${p.texto}`, CONTENT_W)
      doc.text(wrapped, MARGIN, y + 12)
      y += wrapped.length * 13 + 4
    }
    y += 10
  }

  // Investimento em acessibilidade (indicador de adaptações em vigor — não é valor financeiro,
  // a IncluiPro não calcula custo de adaptação)
  y = drawSectionTitle(doc, y, 'Investimento em acessibilidade')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...COLORS.bodyText)
  doc.text(
    `${adaptacoesConcluidasTotal} adaptação(ões) de acessibilidade implementada(s) ao todo nesta empresa.`,
    MARGIN,
    y + 12,
  )
  y += 30

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...COLORS.footerGray)
  const aviso = doc.splitTextToSize(
    'Documento gerencial interno, gerado automaticamente a partir dos dados cadastrados na plataforma. Não substitui parecer jurídico ou contábil.',
    CONTENT_W,
  )
  doc.text(aviso, MARGIN, 780)

  const nomeArquivo = `resumo-executivo-${mesReferencia.replace(/\s+/g, '-').toLowerCase()}.pdf`
  doc.save(nomeArquivo)
}
