// Gera o PDF de "diagnóstico completo" enviado por e-mail para quem usa a
// calculadora de cota pública e deixa o e-mail. Documento simples e objetivo:
// resultado da conta, contexto da lei e apresentação das soluções IncluiPro.

import { jsPDF } from 'jspdf'

const COLORS = {
  darkGreen: [31, 59, 51],
  brightTeal: [47, 191, 143],
  violet: [124, 92, 252],
  bodyText: [43, 43, 43],
  labelText: [26, 26, 26],
  footerGray: [153, 153, 153],
  ruleGray: [223, 223, 223],
  redText: [178, 38, 38],
  white: [255, 255, 255],
}

const MARGIN = 45
const PAGE_W = 595.28
const CONTENT_W = PAGE_W - MARGIN * 2

function formatBRL(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function drawHeader(doc) {
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
  return y + 30
}

function drawSectionTitle(doc, y, texto) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...COLORS.darkGreen)
  doc.text(texto, MARGIN, y)
  doc.setDrawColor(...COLORS.ruleGray)
  doc.line(MARGIN, y + 5, PAGE_W - MARGIN, y + 5)
  return y + 22
}

function drawParagrafo(doc, y, texto, opts = {}) {
  doc.setFont('helvetica', opts.bold ? 'bold' : 'normal')
  doc.setFontSize(opts.size || 10)
  doc.setTextColor(...(opts.color || COLORS.bodyText))
  const linhas = doc.splitTextToSize(texto, opts.width || CONTENT_W)
  doc.text(linhas, MARGIN, y)
  return y + linhas.length * (opts.lineHeight || 13)
}

function drawBullet(doc, y, texto) {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...COLORS.bodyText)
  const linhas = doc.splitTextToSize(texto, CONTENT_W - 14)
  doc.text('•', MARGIN, y)
  doc.text(linhas, MARGIN + 12, y)
  return y + linhas.length * 13 + 3
}

/**
 * @param {object} dados
 * @param {string} dados.empresa
 * @param {object} dados.resultado - retorno de calcularCota()
 */
export function gerarDiagnosticoPdfBuffer({ empresa, resultado }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  let y = drawHeader(doc)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(19)
  doc.setTextColor(...COLORS.darkGreen)
  doc.text('Diagnóstico de Cota de PCD', MARGIN, y)
  y += 20

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...COLORS.footerGray)
  doc.text(
    `${empresa ? empresa + ' · ' : ''}${new Date().toLocaleDateString('pt-BR')}`,
    MARGIN,
    y,
  )
  y += 30

  // Resultado
  y = drawSectionTitle(doc, y, 'Resultado do cálculo')
  const linhas = [
    ['Base de cálculo (CLT − aprendizes − aposentados por invalidez)', String(resultado.base)],
    ['Percentual legal aplicável', `${Math.round(resultado.percentual * 100)}%`],
    ['Cota devida', String(resultado.cotaDevida)],
    ['Vagas em aberto', String(resultado.vagasEmAberto)],
    ['Exposição estimada (multa mínima × vagas em aberto)', formatBRL(resultado.exposicaoEstimada)],
  ]
  for (const [label, valor] of linhas) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...COLORS.labelText)
    const labelLinhas = doc.splitTextToSize(label, CONTENT_W - 140)
    doc.text(labelLinhas, MARGIN, y)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...(label.includes('aberto') && resultado.vagasEmAberto > 0 ? COLORS.redText : COLORS.darkGreen))
    doc.text(valor, MARGIN + CONTENT_W - 90, y, { align: 'right' })
    y += Math.max(16, labelLinhas.length * 13)
  }
  y += 8
  y = drawParagrafo(
    doc,
    y,
    'Estimativa referencial com base no valor mínimo por vaga (Portaria Interministerial MPS/MF nº 13/2026). O valor efetivo de eventual autuação depende de critérios de gradação da fiscalização. Este diagnóstico não substitui orientação jurídica.',
    { size: 8.5, color: COLORS.footerGray, lineHeight: 11 },
  )
  y += 20

  // Como a IncluiPro ajuda
  y = drawSectionTitle(doc, y, 'Como a IncluiPro ajuda a fechar essas vagas com segurança')
  y = drawParagrafo(doc, y, 'IncluiPro Avalia — Relatórios Técnicos de Inclusão', { bold: true, size: 10.5 })
  y += 2
  y = drawBullet(doc, y, 'Formulário guiado por blocos substitui anotações soltas e retrabalho.')
  y = drawBullet(doc, y, 'Relatório técnico pronto em minutos, editável antes de finalizar.')
  y = drawBullet(doc, y, 'Consulta Rápida sugere recursos e ajustes por tipo de deficiência.')
  y += 10
  y = drawParagrafo(doc, y, 'IncluiPro Lidera — Treinamentos para Lideranças', { bold: true, size: 10.5 })
  y += 2
  y = drawBullet(doc, y, 'Kits de treinamento prontos, organizados por tema.')
  y = drawBullet(doc, y, 'Prepara gestores para conduzir o dia a dia de equipes inclusivas.')
  y = drawBullet(doc, y, 'Conteúdo atualizado continuamente, incluído na assinatura.')
  y += 20

  // CTA
  doc.setFillColor(...COLORS.darkGreen)
  doc.roundedRect(MARGIN, y, CONTENT_W, 60, 8, 8, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...COLORS.white)
  doc.text('Quer estruturar isso na sua empresa?', MARGIN + 18, y + 24)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.text('Fale com a gente: contato@incluipro.com  ·  incluipro.netlify.app', MARGIN + 18, y + 42)

  const bytes = doc.output('arraybuffer')
  return Buffer.from(bytes)
}
