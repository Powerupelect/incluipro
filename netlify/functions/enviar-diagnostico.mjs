// Recebe o e-mail deixado na calculadora pública de cota, gera o PDF de
// "diagnóstico completo" e envia por e-mail com o resultado + apresentação
// das soluções IncluiPro.

import { calcularCota } from '../../src/lib/cota.js'
import { gerarDiagnosticoPdfBuffer } from './_lib/diagnosticoPdf.mjs'
import { enviarEmailComAnexo } from './_lib/email.mjs'

export const config = { path: '/api/enviar-diagnostico' }

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  let body
  try {
    body = await req.json()
  } catch {
    return new Response('JSON inválido', { status: 400 })
  }

  const email = String(body?.email || '').trim().toLowerCase()
  if (!email || !email.includes('@')) {
    return Response.json({ enviado: false, motivo: 'E-mail inválido' }, { status: 400 })
  }
  const empresa = String(body?.empresa || '').trim().slice(0, 200)

  const resultado = calcularCota({
    totalFuncionarios: Number(body?.totalFuncionarios) || 0,
    aprendizes: Number(body?.aprendizes) || 0,
    aposentadosInvalidez: Number(body?.aposentadosInvalidez) || 0,
    pcdAtuais: Number(body?.pcdAtuais) || 0,
  })

  try {
    const bufferPdf = gerarDiagnosticoPdfBuffer({ empresa, resultado })
    const envio = await enviarEmailComAnexo({
      email,
      assunto: 'Seu diagnóstico de cota de PCD — IncluiPro',
      texto: `Olá!\n\nSegue em anexo o diagnóstico completo com o resultado do cálculo da sua cota de PCD e como a IncluiPro pode ajudar.\n\nQualquer dúvida, é só responder este e-mail.\n\nEquipe IncluiPro`,
      nomeArquivo: 'diagnostico-cota-pcd-incluipro.pdf',
      bufferPdf,
    })
    return Response.json(envio)
  } catch (err) {
    return Response.json({ enviado: false, motivo: String(err?.message || err) }, { status: 500 })
  }
}
