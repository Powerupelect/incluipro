// Geração dos documentos de saída do IncluiPro Avalia — Etapa 10.
// Dossiê técnico: objetivo, sem enfeite — evidência verificável para a fiscalização.
// Resumo executivo: uma página, visualmente trabalhada — para a diretoria.

import { jsPDF } from 'jspdf'
import { SEM_REGISTRO, gerarNumeroProtocolo, gerarHashIntegridade } from './dossie.js'

const MARGIN = 45
const PAGE_W = 595.28
const PAGE_H = 841.89
const CONTENT_W = PAGE_W - MARGIN * 2

const PRETO = [17, 17, 17]
const CINZA = [110, 110, 110]
const CINZA_CLARO = [225, 225, 225]

function ensureSpace(doc, y, needed, footerTop) {
  if (y + needed > footerTop) {
    doc.addPage()
    return MARGIN
  }
  return y
}

function drawTitulo(doc, y, texto) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10.5)
  doc.setTextColor(...PRETO)
  doc.text(texto.toUpperCase(), MARGIN, y)
  doc.setDrawColor(...PRETO)
  doc.line(MARGIN, y + 4, PAGE_W - MARGIN, y + 4)
  return y + 18
}

function drawLinhaChaveValor(doc, y, chave, valor) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...PRETO)
  doc.text(chave, MARGIN, y)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...CINZA)
  const linhas = doc.splitTextToSize(String(valor ?? '—'), CONTENT_W - 180)
  doc.text(linhas, MARGIN + 180, y)
  return y + Math.max(14, linhas.length * 11)
}

function drawParagrafo(doc, y, texto, footerTop) {
  y = ensureSpace(doc, y, 14, footerTop)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...CINZA)
  const linhas = doc.splitTextToSize(texto, CONTENT_W)
  doc.text(linhas, MARGIN, y)
  return y + linhas.length * 11 + 6
}

export async function gerarDossieTecnicoPDF(dados) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const protocolo = gerarNumeroProtocolo(dados.empresa?.id)
  const footerTop = PAGE_H - MARGIN - 24

  let y = MARGIN

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(...PRETO)
  doc.text('Dossiê Técnico — Cota de Pessoas com Deficiência', MARGIN, y)
  y += 20

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...CINZA)
  doc.text('Documento gerado para fins de acompanhamento e fiscalização. Evidência verificável, sem elementos ilustrativos.', MARGIN, y)
  y += 24

  // 1. Identificação e período
  y = drawTitulo(doc, y, '1. Identificação e período')
  y = drawLinhaChaveValor(doc, y, 'Empresa', dados.empresa?.nome)
  y = drawLinhaChaveValor(doc, y, 'CNPJ', dados.empresa?.cnpj)
  y = drawLinhaChaveValor(doc, y, 'Período de referência', `${dados.periodo.inicio} a ${dados.periodo.fim}`)
  y += 10

  // 2. Situação de cota
  y = ensureSpace(doc, y, 100, footerTop)
  y = drawTitulo(doc, y, '2. Situação de cota')
  if (dados.cota) {
    y = drawLinhaChaveValor(doc, y, 'Base de cálculo', dados.cota.base)
    y = drawLinhaChaveValor(doc, y, 'Percentual legal aplicável', `${Math.round(dados.cota.percentual * 100)}%`)
    y = drawLinhaChaveValor(doc, y, 'Cota devida', dados.cota.cotaDevida)
    y = drawLinhaChaveValor(doc, y, 'Colaboradores PCD ativos contabilizados', dados.pcdAtivos)
    y = drawLinhaChaveValor(doc, y, 'Vagas em aberto', dados.cota.vagasEmAberto)
    y = drawLinhaChaveValor(doc, y, '% da cota cumprido', `${Math.round(dados.cota.percentualCumprimento)}%`)
  } else {
    y = drawParagrafo(doc, y, 'Quadro de funcionários não informado — preencher em Minha conta.', footerTop)
  }
  y += 10

  // 3. Quadro de colaboradores
  y = ensureSpace(doc, y, 60, footerTop)
  y = drawTitulo(doc, y, '3. Quadro de colaboradores com deficiência')
  if (dados.documentacaoPorPessoa.length === 0) {
    y = drawParagrafo(doc, y, 'Nenhum colaborador com deficiência cadastrado.', footerTop)
  } else {
    for (const item of dados.documentacaoPorPessoa) {
      y = ensureSpace(doc, y, 14, footerTop)
      y = drawLinhaChaveValor(doc, y, item.colaborador.nome, item.colaborador.cargo || '—')
    }
  }
  y += 10

  // 4. Documentação por pessoa
  y = ensureSpace(doc, y, 60, footerTop)
  y = drawTitulo(doc, y, '4. Documentação por pessoa')
  if (dados.documentacaoPorPessoa.length === 0) {
    y = drawParagrafo(doc, y, 'Sem colaboradores cadastrados para checagem documental.', footerTop)
  } else {
    for (const item of dados.documentacaoPorPessoa) {
      y = ensureSpace(doc, y, 30, footerTop)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(...PRETO)
      doc.text(item.colaborador.nome, MARGIN, y)
      y += 12
      const resumo = item.documentos
        .map((d) => `${d.tipo}: ${d.presente ? 'presente' : 'ausente'}${d.validade ? ` (válido até ${d.validade})` : ''}`)
        .join(' · ')
      y = drawParagrafo(doc, y, resumo, footerTop)
    }
  }
  y += 10

  // 5. Esforços de recrutamento
  y = ensureSpace(doc, y, 40, footerTop)
  y = drawTitulo(doc, y, '5. Esforços de recrutamento')
  y = drawParagrafo(doc, y, dados.esforcosRecrutamento || SEM_REGISTRO, footerTop)
  y += 10

  // 6. Adaptações executadas com comprovantes
  y = ensureSpace(doc, y, 60, footerTop)
  y = drawTitulo(doc, y, '6. Adaptações executadas com comprovantes')
  if (dados.adaptacoesExecutadas.length === 0) {
    y = drawParagrafo(doc, y, 'Nenhuma adaptação executada registrada no período.', footerTop)
  } else {
    for (const a of dados.adaptacoesExecutadas) {
      y = ensureSpace(doc, y, 14, footerTop)
      y = drawLinhaChaveValor(
        doc,
        y,
        a.colaborador,
        `${a.tipo} — ${a.temComprovante ? 'com comprovante anexado' : 'sem comprovante anexado'}`,
      )
    }
  }
  y += 10

  // 7. Capacitações com listas de presença
  y = ensureSpace(doc, y, 40, footerTop)
  y = drawTitulo(doc, y, '7. Capacitações com listas de presença')
  y = drawParagrafo(doc, y, dados.capacitacoes || SEM_REGISTRO, footerTop)
  y += 10

  // 8. Mapeamento de cargos compatíveis
  y = ensureSpace(doc, y, 60, footerTop)
  y = drawTitulo(doc, y, '8. Mapeamento de cargos compatíveis')
  if (dados.mapeamentoCargos.length === 0) {
    y = drawParagrafo(doc, y, 'Nenhum cargo cadastrado na matriz de compatibilidade.', footerTop)
  } else {
    for (const m of dados.mapeamentoCargos) {
      y = ensureSpace(doc, y, 14, footerTop)
      const compat = m.compatibilidades.filter((c) => c.status === 'compativel').map((c) => c.tipo)
      y = drawLinhaChaveValor(doc, y, m.cargo, compat.length > 0 ? compat.join(', ') : 'nenhuma compatibilidade sem ajuste')
    }
  }
  y += 10

  // 9. Investimento em acessibilidade
  y = ensureSpace(doc, y, 40, footerTop)
  y = drawTitulo(doc, y, '9. Investimento em acessibilidade')
  y = drawParagrafo(doc, y, dados.investimentoAcessibilidade || SEM_REGISTRO, footerTop)
  y += 10

  // 10. Plano de ação vigente
  y = ensureSpace(doc, y, 40, footerTop)
  y = drawTitulo(doc, y, '10. Plano de ação vigente')
  y = drawParagrafo(doc, y, dados.planoDeAcao || SEM_REGISTRO, footerTop)

  // Rodapé com protocolo e hash em todas as páginas
  const totalPaginas = doc.getNumberOfPages()
  const textoIntegridade = `${protocolo}|${dados.empresa?.id || ''}|${dados.periodo.fim}`
  const hash = await gerarHashIntegridade(textoIntegridade)
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i)
    doc.setDrawColor(...CINZA_CLARO)
    doc.line(MARGIN, footerTop, PAGE_W - MARGIN, footerTop)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...CINZA)
    doc.text(`Protocolo ${protocolo} · Hash de integridade ${hash} · Página ${i}/${totalPaginas}`, MARGIN, footerTop + 12)
  }

  const nomeEmpresa = (dados.empresa?.nome || 'empresa').toLowerCase().replace(/[^a-z0-9]+/g, '-')
  doc.save(`dossie-tecnico-${nomeEmpresa}.pdf`)
}

export function gerarResumoExecutivoPDF(dados) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const DARK_GREEN = [31, 59, 51]
  const VIOLET = [124, 92, 252]

  let y = MARGIN

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(...DARK_GREEN)
  doc.text('Resumo Executivo — Cota de PCD', MARGIN, y)
  y += 16
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...CINZA)
  doc.text(`${dados.empresa?.nome || ''} · até ${dados.periodo.fim}`, MARGIN, y)
  y += 26

  if (dados.semaforo) {
    const cores = { signal: [47, 191, 143], amber: [217, 158, 41], red: [211, 68, 68] }
    doc.setFillColor(...(cores[dados.semaforo.cor] || CINZA))
    doc.circle(MARGIN + 6, y - 4, 6, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(...PRETO)
    doc.text(dados.semaforo.label, MARGIN + 20, y)
    y += 24
  }

  const cards = dados.cota
    ? [
        ['Cota devida', String(dados.cota.cotaDevida)],
        ['PCD ativos', String(dados.pcdAtivos)],
        ['Vagas em aberto', String(dados.cota.vagasEmAberto)],
        ['% cumprido', `${Math.round(dados.cota.percentualCumprimento)}%`],
        ['Exposição estimada', dados.cota.exposicaoEstimada.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
      ]
    : [['Cota', 'Quadro de funcionários não informado']]

  const cardW = (CONTENT_W - 12 * (cards.length - 1)) / cards.length
  let x = MARGIN
  for (const [label, valor] of cards) {
    doc.setDrawColor(...CINZA_CLARO)
    doc.setFillColor(248, 248, 248)
    doc.roundedRect(x, y, cardW, 56, 6, 6, 'FD')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...CINZA)
    const labelLines = doc.splitTextToSize(label, cardW - 12)
    doc.text(labelLines, x + 8, y + 16)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...DARK_GREEN)
    doc.text(doc.splitTextToSize(valor, cardW - 12), x + 8, y + 40)
    x += cardW + 12
  }
  y += 76

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...VIOLET)
  doc.text('Evolução no ano', MARGIN, y)
  y += 14
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...PRETO)
  doc.text(
    `${dados.evolucaoNoAno.admitidosNoAno} admissão(ões) e ${dados.evolucaoNoAno.desligadosNoAno} desligamento(s) de colaboradores com deficiência no ano corrente.`,
    MARGIN,
    y,
  )
  y += 26

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...VIOLET)
  doc.text('Pendências', MARGIN, y)
  y += 14
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...PRETO)
  const pendencias =
    dados.cota && dados.cota.vagasEmAberto > 0
      ? `${dados.cota.vagasEmAberto} vaga(s) em aberto para cumprir a cota.`
      : 'Nenhuma pendência de cota identificada.'
  doc.text(pendencias, MARGIN, y)
  y += 26

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...VIOLET)
  doc.text('Investimento em acessibilidade', MARGIN, y)
  y += 14
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...CINZA)
  doc.text(dados.investimentoAcessibilidade || SEM_REGISTRO, MARGIN, y)

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(7)
  doc.setTextColor(...CINZA)
  doc.text('Exposição estimada é referência de cálculo, não é o valor definitivo de eventual autuação.', MARGIN, PAGE_H - MARGIN)

  const nomeEmpresa = (dados.empresa?.nome || 'empresa').toLowerCase().replace(/[^a-z0-9]+/g, '-')
  doc.save(`resumo-executivo-${nomeEmpresa}.pdf`)
}
