// Envio do e-mail de confirmação de pagamento via Resend (https://resend.com).
// Se RESEND_API_KEY não estiver configurada, retorna sem enviar em vez de
// falhar — a liberação de acesso não deve depender do envio de e-mail.

export const CONTACT_EMAIL = 'contato@incluipro.com'

function textoConfirmacao({ nome, plano, linkAcesso }) {
  const pacote = plano === 'vitalicio' ? 'Acesso Vitalício' : 'Assinatura Mensal'
  return `Olá ${nome || 'tudo bem'}! Tudo bem?

Seu pagamento foi confirmado com sucesso!

📦 Pacote adquirido: ${pacote}
🔗 Acesse aqui: ${linkAcesso}
🔑 Use o e-mail que cadastrou na compra para entrar

Qualquer dúvida: ${CONTACT_EMAIL}

Abraços, equipe IncluiPro 🤍`
}

export async function enviarEmailConfirmacao({ nome, email, plano, linkAcesso }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return { enviado: false, motivo: 'RESEND_API_KEY não configurado no ambiente' }
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || 'IncluiPro <onboarding@resend.dev>',
      to: [email],
      subject: 'Pagamento confirmado! Acesse seu IncluiPro 🎉',
      text: textoConfirmacao({ nome, plano, linkAcesso }),
    }),
  })

  if (!res.ok) {
    const detalhe = await res.text().catch(() => '')
    return { enviado: false, motivo: `Resend respondeu ${res.status}: ${detalhe}` }
  }
  return { enviado: true }
}
