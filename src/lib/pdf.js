// Geração do PDF do relatório do IncluiPro Avalia, seguindo o modelo visual validado:
// cabeçalho com logo (3 barras + "INCLUIPRO"), título e frase de abertura fixos, barras de
// seção coloridas alternando entre as cores da marca, tabelas de identificação/deficiência
// com largura fixa, e rodapé fixo com os dois avisos legais + assinatura da marca.

import { jsPDF } from 'jspdf'

const COLORS = {
  darkGreen: [31, 59, 51], // #1F3B33
  brightTeal: [47, 191, 143], // #2FBF8F
  violet: [124, 92, 252], // #7C5CFC
  sageGreen: [61, 107, 92], // #3D6B5C
  bodyText: [43, 43, 43], // #2B2B2B
  labelText: [26, 26, 26], // #1A1A1A
  footerGray: [153, 153, 153], // #999999
  ruleGray: [223, 223, 223],
  white: [255, 255, 255],
}

const BAR_CYCLE = [COLORS.darkGreen, COLORS.violet, COLORS.sageGreen]

const MARGIN = 45
const PAGE_W = 595.28
const PAGE_H = 841.89
const CONTENT_W = PAGE_W - MARGIN * 2
const FOOTER_BLOCK_H = 62
const FOOTER_TOP = PAGE_H - MARGIN - FOOTER_BLOCK_H

const AVISO_1 =
  '• ESTE RELATÓRIO TEM CARÁTER TÉCNICO E SOCIAL, ELABORADO COM BASE NAS INFORMAÇÕES OBTIDAS DURANTE A ENTREVISTA DE AVALIAÇÃO E NAS NECESSIDADES APRESENTADAS PELA PESSOA AVALIADA.'
const AVISO_2 =
  '• NÃO SUBSTITUI LAUDOS MÉDICOS, PSICOLÓGICOS OU DEMAIS DOCUMENTOS LEGAIS RELACIONADOS AO ENQUADRAMENTO DA DEFICIÊNCIA, SERVINDO EXCLUSIVAMENTE COMO INSTRUMENTO DE APOIO À PROMOÇÃO DA ACESSIBILIDADE E INCLUSÃO NO AMBIENTE DE TRABALHO.'
const ASSINATURA = 'IncluiPro Soluções · Inclusão estruturada, com metodologia validada'

function drawFooter(doc) {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6)
  doc.setTextColor(...COLORS.footerGray)
  let y = FOOTER_TOP
  for (const aviso of [AVISO_1, AVISO_2]) {
    const lines = doc.splitTextToSize(aviso, CONTENT_W)
    doc.text(lines, MARGIN, y)
    y += lines.length * 7.5 + 4
  }
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.violet)
  doc.text(ASSINATURA, PAGE_W / 2, PAGE_H - MARGIN, { align: 'center' })
}

function drawMiniHeader(doc) {
  let x = MARGIN
  const y = MARGIN
  ;[COLORS.darkGreen, COLORS.brightTeal, COLORS.violet].forEach((color) => {
    doc.setFillColor(...color)
    doc.rect(x, y - 7, 7, 7, 'F')
    x += 10
  })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.darkGreen)
  doc.text('INCLUIPRO', x + 3, y - 1)
  doc.setDrawColor(...COLORS.ruleGray)
  doc.line(MARGIN, y + 6, PAGE_W - MARGIN, y + 6)
  return y + 20
}

function newPage(doc) {
  doc.addPage()
  drawFooter(doc)
  return drawMiniHeader(doc)
}

function ensureSpace(doc, y, needed) {
  if (y + needed > FOOTER_TOP - 6) {
    return newPage(doc)
  }
  return y
}

function drawSectionBar(doc, y, title, colorIndex) {
  const barH = 22
  y = ensureSpace(doc, y, barH + 10)
  const color = BAR_CYCLE[colorIndex % BAR_CYCLE.length]
  doc.setFillColor(...color)
  doc.rect(MARGIN, y, CONTENT_W, barH, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10.5)
  doc.setTextColor(...COLORS.white)
  doc.text(title, MARGIN + 10, y + barH / 2 + 3.5)
  return y + barH + 10
}

function drawInfoTable(doc, y, rows) {
  const labelW = CONTENT_W * 0.32
  const valueW = CONTENT_W - labelW
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  for (const [label, value] of rows) {
    const valueLines = doc.splitTextToSize(value || '—', valueW - 8)
    const rowH = Math.max(20, valueLines.length * 12 + 8)
    y = ensureSpace(doc, y, rowH)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLORS.labelText)
    doc.text(label, MARGIN, y + 13)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...COLORS.bodyText)
    doc.text(valueLines, MARGIN + labelW, y + 13)
    doc.setDrawColor(...COLORS.ruleGray)
    doc.line(MARGIN, y + rowH - 2, MARGIN + CONTENT_W, y + rowH - 2)
    y += rowH
  }
  return y + 12
}

function stripInlineMarkdown(text) {
  return text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1').trim()
}

function drawProseBody(doc, y, rawText) {
  const lines = (rawText || '').split('\n')
  doc.setFontSize(9.5)
  let paragraphBuffer = []

  function flushParagraph() {
    if (paragraphBuffer.length === 0) return
    const text = stripInlineMarkdown(paragraphBuffer.join(' '))
    paragraphBuffer = []
    if (!text) return
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...COLORS.bodyText)
    const wrapped = doc.splitTextToSize(text, CONTENT_W)
    y = ensureSpace(doc, y, wrapped.length * 13)
    doc.text(wrapped, MARGIN, y + 9)
    y += wrapped.length * 13 + 6
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) {
      flushParagraph()
      continue
    }
    if (/^[-*]\s+/.test(line)) {
      flushParagraph()
      const bulletText = stripInlineMarkdown(line.replace(/^[-*]\s+/, ''))
      const wrapped = doc.splitTextToSize(bulletText, CONTENT_W - 14)
      y = ensureSpace(doc, y, wrapped.length * 13)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...COLORS.bodyText)
      doc.text('•', MARGIN, y + 9)
      doc.text(wrapped, MARGIN + 12, y + 9)
      y += wrapped.length * 13 + 4
      continue
    }
    paragraphBuffer.push(line)
  }
  flushParagraph()
  return y + 4
}

/** Divide o markdown do relatório em seções por título "## ". */
function parseSections(markdown) {
  const matches = [...(markdown || '').matchAll(/^##\s+(.+)$/gm)]
  if (matches.length === 0) {
    return [{ title: null, body: markdown || '' }]
  }
  const sections = []
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index + matches[i][0].length
    const end = i + 1 < matches.length ? matches[i + 1].index : markdown.length
    sections.push({ title: matches[i][1].trim(), body: markdown.slice(start, end).trim() })
  }
  return sections
}

/**
 * Gera e baixa o PDF do relatório de avaliação social.
 * @param {object} params
 * @param {string} params.nome
 * @param {string} params.cargo
 * @param {string} params.empresa
 * @param {string} params.tipoDeficiencia
 * @param {string} params.observacoesCondicao
 * @param {string} params.relatorioMarkdown
 */
export function baixarRelatorioPDF({
  nome,
  cargo,
  empresa,
  tipoDeficiencia,
  observacoesCondicao,
  relatorioMarkdown,
}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })

  drawFooter(doc)

  // Cabeçalho — logo
  let x = MARGIN
  const logoY = MARGIN + 14
  ;[COLORS.darkGreen, COLORS.brightTeal, COLORS.violet].forEach((color) => {
    doc.setFillColor(...color)
    doc.rect(x, logoY - 10, 12, 12, 'F')
    x += 16
  })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...COLORS.darkGreen)
  doc.text('INCLUIPRO', x + 4, logoY)

  let y = logoY + 30

  // Título
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(17)
  doc.setTextColor(...COLORS.darkGreen)
  doc.text('Relatório de Avaliação Social', MARGIN, y)
  y += 22

  // Subtítulo
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(...COLORS.violet)
  doc.text('Inclusão estruturada, com metodologia validada', MARGIN, y)
  y += 18

  // Parágrafo fixo de abertura
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(...COLORS.bodyText)
  const intro = doc.splitTextToSize(
    'O ambiente de trabalho, os processos de integração, treinamentos e atividades devem considerar as recomendações descritas neste relatório, buscando garantir acessibilidade, autonomia e participação plena da pessoa colaboradora.',
    CONTENT_W,
  )
  doc.text(intro, MARGIN, y)
  y += intro.length * 12 + 16

  let barIndex = 0

  // Dados da Avaliação
  y = drawSectionBar(doc, y, 'Dados da Avaliação', barIndex++)
  y = drawInfoTable(doc, y, [
    ['Nome do candidato', nome],
    ['Cargo', cargo],
    ['Empresa', empresa],
  ])

  // Deficiência
  y = drawSectionBar(doc, y, 'Deficiência', barIndex++)
  const infoRows = [['Deficiência da pessoa candidata', tipoDeficiencia]]
  if (observacoesCondicao) {
    infoRows.push(['Observações sobre a condição', observacoesCondicao])
  }
  y = drawInfoTable(doc, y, infoRows)

  // Seções do relatório (a partir do markdown montado)
  const sections = parseSections(relatorioMarkdown)
  for (const section of sections) {
    if (section.title) {
      y = drawSectionBar(doc, y, section.title, barIndex++)
    }
    y = drawProseBody(doc, y, section.body)
  }

  const nomeArquivo = `relatorio-${(nome || 'candidato').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`
  doc.save(nomeArquivo)
}
