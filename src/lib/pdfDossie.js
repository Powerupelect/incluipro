// Dossiê de Gestão da Inclusão — documento de saída para RH, diretoria e auditorias.
// Duas versões: "executiva" (só indicadores agregados, sem dados pessoais) e
// "completa" (resumo executivo + detalhamento por pessoa + anexos).

import { jsPDF } from 'jspdf'
import { gerarNumeroProtocolo, gerarHashIntegridade } from './integridade.js'

const PAGE_W = 595.28
const PAGE_H = 841.89
const M = 50
const CONTENT_W = PAGE_W - M * 2
const TOPO = 78
const RODAPE = PAGE_H - 46

const C = {
  indigo: [30, 42, 74],
  indigoEscuro: [15, 21, 38],
  indigoMedio: [47, 67, 128],
  indigoClaro: [238, 241, 248],
  signal: [18, 165, 148],
  signalEscuro: [12, 106, 99],
  signalClaro: [233, 250, 246],
  volt: [108, 76, 230],
  amber: [224, 145, 31],
  amberClaro: [253, 246, 233],
  red: [220, 38, 38],
  redClaro: [254, 242, 242],
  texto: [20, 23, 31],
  suave: [86, 93, 109],
  mudo: [144, 150, 164],
  linha: [231, 234, 241],
  fundo: [248, 249, 251],
  branco: [255, 255, 255],
}

const moeda = (v) => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const moedaInteira = (v) => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const data = (iso) => (iso ? new Date(`${iso.slice(0, 10)}T12:00`).toLocaleDateString('pt-BR') : '—')

export const SECOES_DOSSIE = [
  { id: 'resumo', label: 'Resumo executivo', fixa: true },
  { id: 'atencao', label: 'Diagnóstico e pontos de atenção' },
  { id: 'plano', label: 'Plano de ação, recrutamento e capacitações' },
  { id: 'cota', label: 'Cálculo da cota', completo: true },
  { id: 'quadro', label: 'Quadro de colaboradores com deficiência', completo: true },
  { id: 'documentacao', label: 'Documentação por pessoa', completo: true },
  { id: 'adaptacoes', label: 'Adaptações e investimento em acessibilidade', completo: true },
  { id: 'movimentacao', label: 'Admissões e desligamentos no período', completo: true },
  { id: 'planos', label: 'Anexo — Planos de Integração completos', completo: true },
  { id: 'evidencias', label: 'Índice de evidências', completo: true },
  { id: 'declaracao', label: 'Declaração e responsável', fixa: true },
]

/* ---------------------------------------------------------------- helpers */

function criarContexto(dados, opcoes) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const ctx = { doc, y: TOPO, sumario: [], dados, opcoes }
  ctx.cor = (rgb, tipo = 'text') => {
    if (tipo === 'text') doc.setTextColor(...rgb)
    if (tipo === 'fill') doc.setFillColor(...rgb)
    if (tipo === 'draw') doc.setDrawColor(...rgb)
  }
  ctx.fonte = (tamanho, peso = 'normal', cor = C.texto) => {
    doc.setFont('helvetica', peso)
    doc.setFontSize(tamanho)
    ctx.cor(cor)
  }
  ctx.novaPagina = () => {
    doc.addPage()
    ctx.y = TOPO
  }
  ctx.espaco = (h) => {
    if (ctx.y + h > RODAPE - 14) ctx.novaPagina()
  }
  return ctx
}

function linhasDe(ctx, texto, largura, tamanho) {
  ctx.doc.setFontSize(tamanho)
  return ctx.doc.splitTextToSize(String(texto ?? '—'), largura)
}

function paragrafo(ctx, texto, { tamanho = 9.5, cor = C.suave, peso = 'normal', largura = CONTENT_W, x = M, entrelinha = 1.45 } = {}) {
  const linhas = linhasDe(ctx, texto, largura, tamanho)
  const alturaLinha = tamanho * entrelinha
  for (const linha of linhas) {
    ctx.espaco(alturaLinha)
    ctx.fonte(tamanho, peso, cor)
    ctx.doc.text(linha, x, ctx.y)
    ctx.y += alturaLinha
  }
  ctx.y += 4
}

function secao(ctx, id, titulo, { novaPagina = false } = {}) {
  if (novaPagina) ctx.novaPagina()
  else {
    ctx.espaco(120)
    ctx.y += 22
  }
  const numero = ctx.sumario.length + 1
  ctx.sumario.push({ id, titulo, pagina: ctx.doc.getNumberOfPages(), numero })
  const { doc } = ctx
  ctx.cor(C.signal, 'fill')
  doc.rect(M, ctx.y - 12, 3, 16, 'F')
  ctx.fonte(8, 'bold', C.signalEscuro)
  doc.text(String(numero).padStart(2, '0'), M + 12, ctx.y - 1)
  ctx.fonte(14, 'bold', C.indigo)
  doc.text(titulo, M + 30, ctx.y)
  ctx.y += 22
}

function subtitulo(ctx, texto) {
  ctx.espaco(30)
  ctx.y += 4
  ctx.fonte(10, 'bold', C.indigo)
  ctx.doc.text(texto, M, ctx.y)
  ctx.y += 14
}

function vazio(ctx, texto) {
  ctx.espaco(30)
  ctx.cor(C.fundo, 'fill')
  ctx.doc.roundedRect(M, ctx.y - 2, CONTENT_W, 26, 3, 3, 'F')
  ctx.fonte(9, 'normal', C.mudo)
  ctx.doc.text(texto, M + 12, ctx.y + 14)
  ctx.y += 34
}

/** Tabela com cabeçalho repetido a cada página e linhas zebradas. */
function tabela(ctx, colunas, linhas) {
  const { doc } = ctx
  const total = colunas.reduce((s, c) => s + c.peso, 0)
  const larguras = colunas.map((c) => (c.peso / total) * CONTENT_W)
  const PAD = 7
  const desenharCabecalho = () => {
    ctx.cor(C.indigo, 'fill')
    doc.rect(M, ctx.y, CONTENT_W, 20, 'F')
    ctx.fonte(7.5, 'bold', C.branco)
    let x = M
    colunas.forEach((c, i) => {
      doc.text(c.titulo.toUpperCase(), c.alinhar === 'right' ? x + larguras[i] - PAD : x + PAD, ctx.y + 13, { align: c.alinhar === 'right' ? 'right' : 'left' })
      x += larguras[i]
    })
    ctx.y += 20
  }
  ctx.espaco(48)
  desenharCabecalho()
  linhas.forEach((linha, idx) => {
    const celulas = linha.map((v, i) => linhasDe(ctx, v, larguras[i] - PAD * 2, 8.5))
    const altura = Math.max(...celulas.map((c) => c.length)) * 11 + 10
    if (ctx.y + altura > RODAPE - 14) {
      ctx.novaPagina()
      desenharCabecalho()
    }
    if (idx % 2 === 1) {
      ctx.cor(C.fundo, 'fill')
      doc.rect(M, ctx.y, CONTENT_W, altura, 'F')
    }
    let x = M
    celulas.forEach((c, i) => {
      const destaque = colunas[i].cor?.(linha[i])
      ctx.fonte(8.5, i === 0 ? 'bold' : 'normal', destaque || (i === 0 ? C.texto : C.suave))
      doc.text(c, colunas[i].alinhar === 'right' ? x + larguras[i] - PAD : x + PAD, ctx.y + 14, { align: colunas[i].alinhar === 'right' ? 'right' : 'left' })
      x += larguras[i]
    })
    ctx.y += altura
    ctx.cor(C.linha, 'draw')
    doc.setLineWidth(0.5)
    doc.line(M, ctx.y, M + CONTENT_W, ctx.y)
  })
  ctx.y += 14
}

function caixaKpi(ctx, x, y, w, h, { rotulo, valor, nota, tom = C.indigo, fundo = C.branco }) {
  const { doc } = ctx
  ctx.cor(fundo, 'fill')
  ctx.cor(C.linha, 'draw')
  doc.setLineWidth(0.7)
  doc.roundedRect(x, y, w, h, 4, 4, 'FD')
  ctx.cor(tom, 'fill')
  doc.rect(x, y + 10, 2.5, h - 20, 'F')
  ctx.fonte(7.5, 'normal', C.suave)
  doc.text(linhasDe(ctx, rotulo, w - 24, 7.5)[0], x + 14, y + 20)
  ctx.fonte(19, 'bold', tom)
  doc.text(String(valor), x + 14, y + 44)
  if (nota) {
    ctx.fonte(7, 'normal', C.mudo)
    doc.text(linhasDe(ctx, nota, w - 24, 7).slice(0, 2), x + 14, y + 58)
  }
}

/* ---------------------------------------------------------------- capa */

function desenharLogo(ctx, x, y, escala = 1) {
  const { doc } = ctx
  const barras = [
    [C.signalEscuro, 9],
    [C.signal, 14],
    [C.volt, 20],
  ]
  barras.forEach(([cor, alt], i) => {
    ctx.cor(cor, 'fill')
    doc.roundedRect(x + i * 7 * escala, y + (20 - alt) * escala, 5 * escala, alt * escala, 1.2, 1.2, 'F')
  })
  ctx.fonte(15 * escala, 'bold', C.branco)
  doc.text('Inclui', x + 28 * escala, y + 16 * escala)
  const largura = doc.getTextWidth('Inclui')
  ctx.cor([99, 211, 186])
  doc.text('Pro', x + 28 * escala + largura, y + 16 * escala)
}

function capa(ctx, protocolo) {
  const { doc, dados, opcoes } = ctx
  ctx.cor(C.indigoEscuro, 'fill')
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F')
  ctx.cor([22, 31, 56], 'fill')
  doc.rect(0, PAGE_H * 0.62, PAGE_W, PAGE_H * 0.38, 'F')
  ctx.cor(C.signal, 'fill')
  doc.rect(M, 250, 46, 4, 'F')

  desenharLogo(ctx, M, 60, 1.3)

  ctx.fonte(32, 'bold', C.branco)
  doc.text('Dossiê de Gestão', M, 300)
  doc.text('da Inclusão', M, 338)
  ctx.fonte(12, 'normal', [179, 192, 221])
  doc.text(linhasDe(ctx, 'Cota de pessoas com deficiência, documentação, adaptações e plano de ação.', 380, 12), M, 368)

  const campos = [
    ['Empresa', dados.empresa?.nome || '—'],
    ['CNPJ', dados.empresa?.cnpj || 'não informado'],
    ['Período de referência', `${data(dados.periodo.inicio)} a ${data(dados.periodo.fim)}`],
    ['Data de emissão', new Date().toLocaleDateString('pt-BR')],
    ['Emitido por', [opcoes.responsavelNome, opcoes.responsavelCargo].filter(Boolean).join(' · ') || '—'],
    ['Protocolo', protocolo],
  ]
  let y = PAGE_H * 0.62 + 44
  campos.forEach(([k, v], i) => {
    const col = i % 2
    const x = M + col * (CONTENT_W / 2)
    if (col === 0 && i > 0) y += 46
    ctx.fonte(7.5, 'bold', [129, 149, 196])
    doc.text(k.toUpperCase(), x, y)
    ctx.fonte(11, 'normal', C.branco)
    doc.text(linhasDe(ctx, v, CONTENT_W / 2 - 16, 11)[0], x, y + 16)
  })

  ctx.fonte(7.5, 'normal', [129, 149, 196])
  const aviso =
    opcoes.versao === 'executiva'
      ? 'Versão executiva: apresenta apenas indicadores agregados, sem dados pessoais de colaboradores.'
      : 'Documento confidencial: contém dados pessoais sensíveis (LGPD, art. 11). Acesso restrito a pessoas autorizadas.'
  doc.text(aviso, M, PAGE_H - 44)
}

/* ---------------------------------------------------------------- seções */

function resumoExecutivo(ctx) {
  const { doc, dados } = ctx
  const p = dados.painel
  const cota = p.cota
  secao(ctx, 'resumo', 'Resumo executivo', { novaPagina: true })

  const pct = cota ? Math.round(cota.percentualCumprimento) : null
  const leitura = cota
    ? cota.cotaDevida === 0
      ? `Com base de cálculo de ${cota.base} empregados, a empresa não está obrigada à cota legal de PCD. Os registros deste dossiê documentam as ações de inclusão realizadas.`
      : `A empresa mantém ${p.ativos} de ${cota.cotaDevida} colaboradores com deficiência exigidos pela Lei 8.213/91, art. 93 (${pct}% da cota). ${
          cota.vagasEmAberto > 0
            ? `Restam ${cota.vagasEmAberto} vaga${cota.vagasEmAberto > 1 ? 's' : ''} em aberto, com exposição estimada a partir de ${moeda(cota.exposicaoEstimada)} em multa.`
            : 'A cota está integralmente cumprida.'
        }`
    : 'O quadro de funcionários não foi informado na plataforma, por isso a cota não pôde ser calculada.'
  paragrafo(ctx, leitura, { tamanho: 10.5, cor: C.texto, entrelinha: 1.5 })
  ctx.y += 6

  if (cota && cota.cotaDevida > 0) {
    ctx.espaco(46)
    ctx.fonte(8, 'bold', C.suave)
    doc.text('CUMPRIMENTO DA COTA', M, ctx.y)
    ctx.fonte(8, 'bold', C.indigo)
    doc.text(`${pct}%`, M + CONTENT_W, ctx.y, { align: 'right' })
    ctx.y += 8
    ctx.cor(C.linha, 'fill')
    doc.roundedRect(M, ctx.y, CONTENT_W, 9, 4.5, 4.5, 'F')
    const tom = pct >= 100 ? C.signal : pct >= 50 ? C.amber : C.red
    ctx.cor(tom, 'fill')
    if (pct > 0) doc.roundedRect(M, ctx.y, Math.max(9, (CONTENT_W * Math.min(100, pct)) / 100), 9, 4.5, 4.5, 'F')
    ctx.y += 30
  }

  const gap = 10
  const w = (CONTENT_W - gap * 3) / 4
  const h = 70
  const linhas = [
    [
      { rotulo: 'Colaboradores na cota', valor: cota ? `${p.ativos}/${cota.cotaDevida}` : p.ativos, nota: 'PCD e reabilitados ativos', tom: C.indigo },
      { rotulo: 'Vagas em aberto', valor: cota ? cota.vagasEmAberto : '—', nota: 'para cumprir a cota', tom: cota?.vagasEmAberto ? C.amber : C.signal },
      { rotulo: 'Multa estimada', valor: cota ? moedaInteira(cota.vagasEmAberto ? cota.exposicaoEstimada : 0) : '—', nota: 'valor mínimo por vaga', tom: cota?.vagasEmAberto ? C.red : C.signal },
      { rotulo: 'Documentação em dia', valor: p.documentacao.pct !== null ? `${p.documentacao.pct}%` : '—', nota: `${p.documentacao.comLaudoValido} de ${p.documentacao.total} com laudo válido`, tom: C.signal },
    ],
    [
      { rotulo: 'Planos de integração', valor: p.planos.pct !== null ? `${p.planos.pct}%` : '—', nota: `${p.planos.com} de ${p.planos.total} colaboradores`, tom: C.volt },
      { rotulo: 'Solicitações abertas', valor: p.solicitacoes.abertas, nota: p.solicitacoes.tempoMedioDias !== null ? `atendimento médio de ${p.solicitacoes.tempoMedioDias} dias` : 'de adaptação', tom: C.indigoMedio },
      { rotulo: 'Investimento no período', valor: moedaInteira(dados.investimentoPeriodo), nota: `${dados.adaptacoes.length} adaptação(ões) executada(s)`, tom: C.signalEscuro },
      { rotulo: 'Retenção em 12 meses', valor: p.retencao.pct !== null ? `${p.retencao.pct}%` : '—', nota: `${p.retencao.desligados12m} desligamento(s)`, tom: C.indigo },
    ],
  ]
  linhas.forEach((linha) => {
    ctx.espaco(h + gap)
    linha.forEach((k, i) => caixaKpi(ctx, M + i * (w + gap), ctx.y, w, h, k))
    ctx.y += h + gap
  })
  ctx.y += 8

  subtitulo(ctx, 'Atividade no período')
  const atividade = [
    `${dados.avaliacoesNoPeriodo} Plano(s) de Integração elaborado(s)`,
    `${dados.adaptacoes.length} adaptação(ões) de acessibilidade executada(s)`,
    `${dados.movimentacao.admissoes.length} admissão(ões) e ${dados.movimentacao.desligamentos.length} desligamento(s) de colaboradores PCD`,
  ]
  atividade.forEach((t) => {
    ctx.espaco(16)
    ctx.cor(C.signal, 'fill')
    doc.circle(M + 3, ctx.y - 3, 2, 'F')
    ctx.fonte(9.5, 'normal', C.texto)
    doc.text(t, M + 12, ctx.y)
    ctx.y += 16
  })
}

function pontosDeAtencao(ctx) {
  const { doc, dados, opcoes } = ctx
  secao(ctx, 'atencao', 'Diagnóstico e pontos de atenção')
  const alertas = dados.painel.alertas
  if (alertas.length === 0) return vazio(ctx, 'Nenhum ponto de atenção identificado nos registros da plataforma.')
  const NIVEL = {
    critico: ['URGENTE', C.red, C.redClaro],
    atencao: ['ATENÇÃO', C.amber, C.amberClaro],
    info: ['ACOMPANHAR', C.indigoMedio, C.indigoClaro],
  }
  alertas.forEach((a) => {
    const [rotulo, cor, fundo] = NIVEL[a.nivel]
    const detalhe = opcoes.versao === 'executiva' ? null : a.detalhe
    const linhasTitulo = linhasDe(ctx, a.titulo, CONTENT_W - 110, 10)
    const linhasDetalhe = detalhe ? linhasDe(ctx, detalhe, CONTENT_W - 110, 8.5) : []
    const h = 16 + linhasTitulo.length * 13 + linhasDetalhe.length * 11
    ctx.espaco(h + 8)
    ctx.cor(fundo, 'fill')
    doc.roundedRect(M, ctx.y, CONTENT_W, h, 3, 3, 'F')
    ctx.cor(cor, 'fill')
    doc.rect(M, ctx.y, 3, h, 'F')
    ctx.fonte(7, 'bold', cor)
    doc.text(rotulo, M + 14, ctx.y + 17)
    ctx.fonte(10, 'bold', C.texto)
    doc.text(linhasTitulo, M + 92, ctx.y + 17)
    if (linhasDetalhe.length) {
      ctx.fonte(8.5, 'normal', C.suave)
      doc.text(linhasDetalhe, M + 92, ctx.y + 17 + linhasTitulo.length * 13)
    }
    ctx.y += h + 8
  })
}

function planoDeAcao(ctx) {
  const { opcoes } = ctx
  const blocos = [
    ['Plano de ação vigente', opcoes.planoDeAcao],
    ['Esforços de recrutamento', opcoes.esforcosRecrutamento],
    ['Treinamentos e capacitações realizados', opcoes.capacitacoes],
  ].filter(([, t]) => t)
  if (!blocos.length) return
  secao(ctx, 'plano', 'Plano de ação, recrutamento e capacitações')
  blocos.forEach(([titulo, texto]) => {
    subtitulo(ctx, titulo)
    texto.split('\n').filter(Boolean).forEach((l) => paragrafo(ctx, l, { tamanho: 9.5 }))
  })
}

function calculoCota(ctx) {
  const { dados } = ctx
  const e = dados.empresa || {}
  const cota = dados.painel.cota
  secao(ctx, 'cota', 'Cálculo da cota')
  if (!cota) return vazio(ctx, 'Quadro de funcionários não informado na plataforma.')
  tabela(
    ctx,
    [
      { titulo: 'Item', peso: 3 },
      { titulo: 'Valor', peso: 1, alinhar: 'right' },
    ],
    [
      ['Total de empregados (matriz e filiais)', e.total_funcionarios || 0],
      ['(-) Aprendizes — Lei 10.097/2000', e.aprendizes || 0],
      ['(-) Aposentados por invalidez', e.aposentados_invalidez || 0],
      ['Base de cálculo', cota.base],
      ['Percentual legal aplicável (Lei 8.213/91, art. 93)', `${Math.round(cota.percentual * 100)}%`],
      ['Cota devida (arredondada para cima)', cota.cotaDevida],
      ['Colaboradores PCD e reabilitados contabilizados', dados.painel.ativos],
      ['Vagas em aberto', cota.vagasEmAberto],
    ],
  )
}

function quadro(ctx) {
  const { dados } = ctx
  secao(ctx, 'quadro', 'Quadro de colaboradores com deficiência')
  if (!dados.quadro.length) return vazio(ctx, 'Nenhum colaborador com deficiência ativo cadastrado.')
  tabela(
    ctx,
    [
      { titulo: 'Nome', peso: 3 },
      { titulo: 'Cargo', peso: 2.6 },
      { titulo: 'Tipo de deficiência', peso: 2.4 },
      { titulo: 'Admissão', peso: 1.3 },
    ],
    dados.quadro.map((c) => [c.nome, c.cargo, c.tipoDeficiencia, data(c.admissao)]),
  )
}

function documentacao(ctx) {
  const { dados, opcoes } = ctx
  secao(ctx, 'documentacao', 'Documentação por pessoa')
  if (opcoes.documentosExternos) {
    return paragrafo(ctx, 'Os laudos, CID e comprovantes de reabilitação desta empresa são mantidos em repositório externo à plataforma.')
  }
  if (!dados.documentacaoPorPessoa.length) return vazio(ctx, 'Sem colaboradores cadastrados para checagem documental.')
  const hoje = new Date().toLocaleDateString('sv')
  const status = (d) => (!d.presente ? 'Ausente' : d.validade && d.validade < hoje ? `Vencido (${data(d.validade)})` : d.validade ? `Válido até ${data(d.validade)}` : 'Presente')
  const cor = (v) => (v === 'Ausente' || String(v).startsWith('Vencido') ? C.red : C.signalEscuro)
  tabela(
    ctx,
    [
      { titulo: 'Colaborador', peso: 2.6 },
      { titulo: 'Laudo caracterizador', peso: 2.2, cor },
      { titulo: 'CID', peso: 1.6, cor },
      { titulo: 'Reabilitação INSS', peso: 1.8, cor },
    ],
    dados.documentacaoPorPessoa.map((p) => [p.nome, ...p.documentos.map(status)]),
  )
  paragrafo(ctx, 'O comprovante de reabilitação do INSS é exigido apenas para colaboradores reabilitados; para pessoas com deficiência, o laudo caracterizador é o documento principal.', { tamanho: 8, cor: C.mudo })
}

function adaptacoes(ctx) {
  const { dados } = ctx
  secao(ctx, 'adaptacoes', 'Adaptações e investimento em acessibilidade')
  if (!dados.adaptacoes.length) return vazio(ctx, 'Nenhuma adaptação executada no período.')
  tabela(
    ctx,
    [
      { titulo: 'Colaborador', peso: 2.4 },
      { titulo: 'Adaptação', peso: 2.4 },
      { titulo: 'Data', peso: 1.2 },
      { titulo: 'Comprovante', peso: 1.4 },
      { titulo: 'Valor', peso: 1.3, alinhar: 'right' },
    ],
    dados.adaptacoes.map((a) => [a.colaborador, a.tipo, data(a.data), a.temComprovante ? 'Anexado' : 'Não anexado', a.valor ? moeda(a.valor) : '—']),
  )
  if (dados.investimentoPeriodo > 0) {
    paragrafo(ctx, `Investimento total registrado no período: ${moeda(dados.investimentoPeriodo)}.`, { cor: C.texto, peso: 'bold' })
  }
}

function movimentacao(ctx) {
  const { dados } = ctx
  const { admissoes, desligamentos } = dados.movimentacao
  secao(ctx, 'movimentacao', 'Admissões e desligamentos no período')
  if (!admissoes.length && !desligamentos.length) return vazio(ctx, 'Nenhuma admissão ou desligamento registrado no período.')
  const linhas = [
    ...admissoes.map((a) => [a.nome, 'Admissão', data(a.data), '—']),
    ...desligamentos.map((d) => [d.nome, 'Desligamento', data(d.data), d.tipo]),
  ].sort((a, b) => a[2].split('/').reverse().join('').localeCompare(b[2].split('/').reverse().join('')))
  tabela(
    ctx,
    [
      { titulo: 'Colaborador', peso: 2.8 },
      { titulo: 'Movimentação', peso: 1.6, cor: (v) => (v === 'Admissão' ? C.signalEscuro : C.amber) },
      { titulo: 'Data', peso: 1.3 },
      { titulo: 'Tipo de saída', peso: 2.4 },
    ],
    linhas,
  )
}

/** Converte o markdown do Plano de Integração em texto formatado no PDF. */
function anexoPlanos(ctx) {
  const { doc, dados } = ctx
  if (!dados.planos.length) return
  secao(ctx, 'planos', 'Anexo — Planos de Integração completos')
  paragrafo(ctx, `Versão mais recente do Plano de Integração e Rotina Inclusiva de cada colaborador ativo (${dados.planos.length} documento${dados.planos.length > 1 ? 's' : ''}).`)
  dados.planos.forEach((plano, i) => {
    ctx.y += i > 0 ? 20 : 6
    ctx.espaco(140)
    ctx.cor(C.indigoClaro, 'fill')
    doc.roundedRect(M, ctx.y, CONTENT_W, 40, 3, 3, 'F')
    ctx.fonte(7.5, 'bold', C.signalEscuro)
    doc.text(`ANEXO A.${i + 1}`, M + 14, ctx.y + 15)
    ctx.fonte(11, 'bold', C.indigo)
    doc.text(plano.nome, M + 14, ctx.y + 30)
    ctx.fonte(8, 'normal', C.suave)
    doc.text([plano.cargo, `atualizado em ${data(plano.data)}`].filter(Boolean).join(' · '), M + CONTENT_W - 14, ctx.y + 30, { align: 'right' })
    ctx.y += 56
    for (const bruta of plano.conteudo.split('\n')) {
      const linha = bruta.trim()
      if (!linha) {
        ctx.y += 4
        continue
      }
      const limpa = linha.replace(/\*\*(.*?)\*\*/g, '$1').replace(/__(.*?)__/g, '$1').replace(/`/g, '')
      if (/^#{1,6}\s/.test(limpa)) {
        ctx.espaco(28)
        ctx.y += 6
        ctx.fonte(10, 'bold', C.indigo)
        doc.text(limpa.replace(/^#+\s*/, ''), M, ctx.y)
        ctx.y += 14
      } else if (/^[-*•]\s/.test(limpa)) {
        const texto = limpa.replace(/^[-*•]\s*/, '')
        const ls = linhasDe(ctx, texto, CONTENT_W - 14, 9)
        ls.forEach((l, j) => {
          ctx.espaco(13)
          if (j === 0) {
            ctx.cor(C.signal, 'fill')
            doc.circle(M + 3, ctx.y - 3, 1.6, 'F')
          }
          ctx.fonte(9, 'normal', C.suave)
          doc.text(l, M + 12, ctx.y)
          ctx.y += 13
        })
      } else {
        paragrafo(ctx, limpa, { tamanho: 9 })
      }
    }
  })
}

function indiceEvidencias(ctx) {
  const { dados, opcoes } = ctx
  const linhas = []
  dados.planos.forEach((p, i) => linhas.push([`Plano de Integração — ${p.nome}`, 'IncluiPro Avalia', data(p.data), `Anexo A.${i + 1}`]))
  if (!opcoes.documentosExternos) {
    dados.documentacaoPorPessoa.forEach((p) =>
      p.documentos.filter((d) => d.presente).forEach((d) => linhas.push([`${d.tipo} — ${p.nome}`, 'Documentos', d.validade ? data(d.validade) : '—', 'Arquivo na plataforma'])),
    )
  }
  dados.adaptacoes.filter((a) => a.temComprovante).forEach((a) => linhas.push([`Comprovante: ${a.tipo} — ${a.colaborador}`, 'Solicitações', data(a.data), 'Arquivo na plataforma']))
  if (!linhas.length) return
  secao(ctx, 'evidencias', 'Índice de evidências')
  paragrafo(ctx, 'Registros que sustentam as informações deste dossiê. Os arquivos originais ficam guardados na plataforma IncluiPro e podem ser apresentados mediante solicitação.')
  tabela(
    ctx,
    [
      { titulo: 'Evidência', peso: 4 },
      { titulo: 'Origem', peso: 1.6 },
      { titulo: 'Data / validade', peso: 1.6 },
      { titulo: 'Localização', peso: 1.9 },
    ],
    linhas,
  )
}

function declaracao(ctx, protocolo, hash) {
  const { doc, opcoes } = ctx
  secao(ctx, 'declaracao', 'Declaração e responsável')
  paragrafo(
    ctx,
    'Declaro que as informações deste dossiê foram extraídas dos registros mantidos pela empresa na plataforma IncluiPro na data de emissão. O documento organiza evidências das ações de inclusão e não substitui orientação jurídica nem garante, por si só, a conformidade legal.',
    { cor: C.texto },
  )
  ctx.espaco(110)
  ctx.y += 40
  ctx.cor(C.texto, 'draw')
  doc.setLineWidth(0.6)
  doc.line(M, ctx.y, M + 230, ctx.y)
  doc.line(M + CONTENT_W - 150, ctx.y, M + CONTENT_W, ctx.y)
  ctx.fonte(9, 'bold', C.texto)
  doc.text(opcoes.responsavelNome || 'Responsável', M, ctx.y + 14)
  doc.text('Data', M + CONTENT_W - 150, ctx.y + 14)
  ctx.fonte(8.5, 'normal', C.suave)
  if (opcoes.responsavelCargo) doc.text(opcoes.responsavelCargo, M, ctx.y + 26)
  ctx.y += 56
  ctx.espaco(50)
  ctx.cor(C.fundo, 'fill')
  doc.roundedRect(M, ctx.y, CONTENT_W, 42, 3, 3, 'F')
  ctx.fonte(7.5, 'bold', C.suave)
  doc.text('VERIFICAÇÃO DE INTEGRIDADE', M + 14, ctx.y + 16)
  ctx.fonte(8.5, 'normal', C.texto)
  doc.text(`Protocolo ${protocolo}  ·  Hash ${hash}`, M + 14, ctx.y + 31)
  ctx.y += 50
}

/* ---------------------------------------------------------------- sumário, cabeçalho e rodapé */

function desenharSumario(ctx) {
  const { doc } = ctx
  doc.setPage(2)
  ctx.fonte(8, 'bold', C.signalEscuro)
  doc.text('CONTEÚDO', M, TOPO + 4)
  ctx.fonte(22, 'bold', C.indigo)
  doc.text('Sumário', M, TOPO + 32)
  let y = TOPO + 74
  ctx.sumario.forEach((s) => {
    ctx.fonte(10, 'bold', C.signalEscuro)
    doc.text(String(s.numero).padStart(2, '0'), M, y)
    ctx.fonte(11, 'normal', C.texto)
    doc.text(s.titulo, M + 28, y)
    const larguraTitulo = doc.getTextWidth(s.titulo)
    ctx.cor(C.linha, 'draw')
    doc.setLineDashPattern([1, 2.5], 0)
    doc.line(M + 34 + larguraTitulo, y - 3, M + CONTENT_W - 24, y - 3)
    doc.setLineDashPattern([], 0)
    ctx.fonte(10, 'bold', C.indigo)
    doc.text(String(s.pagina), M + CONTENT_W, y, { align: 'right' })
    y += 26
  })
  y += 24
  const { dados, opcoes } = ctx
  const sobre =
    opcoes.versao === 'executiva'
      ? 'Versão executiva, destinada à diretoria: reúne indicadores agregados, pontos de atenção e o plano de ação, sem dados pessoais de colaboradores. O detalhamento por pessoa e os anexos ficam na versão completa.'
      : 'Versão completa, destinada ao RH e a auditorias: reúne o resumo executivo, o detalhamento por colaborador e os anexos que sustentam as informações. Contém dados pessoais sensíveis e deve ter acesso restrito.'
  const linhas = linhasDe(ctx, sobre, CONTENT_W - 32, 9.5)
  const alt = 40 + linhas.length * 14
  ctx.cor(C.indigoClaro, 'fill')
  doc.roundedRect(M, y, CONTENT_W, alt, 4, 4, 'F')
  ctx.fonte(8, 'bold', C.indigo)
  doc.text('SOBRE ESTE DOCUMENTO', M + 16, y + 22)
  ctx.fonte(9.5, 'normal', C.suave)
  doc.text(linhas, M + 16, y + 40)
  ctx.fonte(8.5, 'normal', C.mudo)
  doc.text(`Período de referência: ${data(dados.periodo.inicio)} a ${data(dados.periodo.fim)}. Indicadores calculados na data de emissão.`, M, y + alt + 22)
}

function cabecalhoERodape(ctx, protocolo, hash) {
  const { doc, dados, opcoes } = ctx
  const total = doc.getNumberOfPages()
  for (let i = 2; i <= total; i++) {
    doc.setPage(i)
    ctx.fonte(7.5, 'bold', C.indigo)
    doc.text('IncluiPro · Dossiê de Gestão da Inclusão', M, 40)
    ctx.fonte(7.5, 'normal', C.mudo)
    doc.text(`${dados.empresa?.nome || ''} · ${opcoes.versao === 'executiva' ? 'Versão executiva' : 'Versão completa'}`, PAGE_W - M, 40, { align: 'right' })
    ctx.cor(C.linha, 'draw')
    doc.setLineWidth(0.6)
    doc.line(M, 48, PAGE_W - M, 48)
    doc.line(M, RODAPE, PAGE_W - M, RODAPE)
    ctx.fonte(7, 'normal', C.mudo)
    doc.text(`Protocolo ${protocolo} · Hash ${hash}`, M, RODAPE + 14)
    doc.text(`Página ${i} de ${total}`, PAGE_W - M, RODAPE + 14, { align: 'right' })
  }
}

/* ---------------------------------------------------------------- entrada */

/** Monta o PDF e devolve o documento jsPDF (sem salvar). */
export async function construirDossiePDF(dados, opcoes = {}) {
  const op = { versao: 'completa', secoes: null, ...opcoes }
  const incluir = (id) => {
    const s = SECOES_DOSSIE.find((x) => x.id === id)
    if (s?.fixa) return true
    if (s?.completo && op.versao === 'executiva') return false
    return !op.secoes || op.secoes.includes(id)
  }
  const ctx = criarContexto(dados, op)
  const protocolo = gerarNumeroProtocolo(dados.empresa?.id)
  const p = dados.painel
  const hash = await gerarHashIntegridade(
    [protocolo, dados.empresa?.id, op.versao, dados.periodo.inicio, dados.periodo.fim, p.ativos, p.cota?.cotaDevida, p.documentacao.pct, dados.adaptacoes.length].join('|'),
  )

  capa(ctx, protocolo)
  ctx.novaPagina() // página do sumário — preenchida no fim, quando as páginas já são conhecidas
  resumoExecutivo(ctx)
  if (incluir('atencao')) pontosDeAtencao(ctx)
  if (incluir('plano')) planoDeAcao(ctx)
  if (incluir('cota')) calculoCota(ctx)
  if (incluir('quadro')) quadro(ctx)
  if (incluir('documentacao')) documentacao(ctx)
  if (incluir('adaptacoes')) adaptacoes(ctx)
  if (incluir('movimentacao')) movimentacao(ctx)
  if (incluir('planos')) anexoPlanos(ctx)
  if (incluir('evidencias')) indiceEvidencias(ctx)
  declaracao(ctx, protocolo, hash)

  desenharSumario(ctx)
  cabecalhoERodape(ctx, protocolo, hash)
  return ctx.doc
}

export async function gerarDossiePDF(dados, opcoes = {}) {
  const doc = await construirDossiePDF(dados, opcoes)
  const nomeEmpresa = (dados.empresa?.nome || 'empresa')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
  doc.save(`dossie-${opcoes.versao === 'executiva' ? 'executivo' : 'completo'}-${nomeEmpresa}.pdf`)
}
