// Integração com a API da Anthropic para o IncluiPro Avalia.
//
// ATENÇÃO — PROTOTIPAGEM APENAS: esta chamada é feita diretamente do front-end,
// o que expõe a chave de API no navegador. Isso é aceitável apenas para validar
// a experiência. Para produção, mova esta chamada para um backend/proxy que
// guarde a chave de forma segura (ex: função serverless que recebe os dados do
// formulário e retorna apenas o relatório gerado).

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-5'

function montarPrompt(dados) {
  return `Você é um especialista em avaliação social e inclusão de pessoas com deficiência (PCD) no mercado de trabalho. Com base nas anotações de entrevista abaixo, produza um RELATÓRIO FINAL estruturado, profissional e em português do Brasil, no formato Markdown, seguindo o modelo oficial da IncluiPro.

O relatório deve ter exatamente estas seções, nesta ordem, usando "## " como marcador de cada seção:
## Rotina e Autonomia
## Observações Ergonômicas e Ambientais
## Parecer e Recomendações

Instruções de conteúdo por seção:
- "Rotina e Autonomia": uma síntese coesa que combine rotina e nível de autonomia, histórico profissional relevante, necessidades específicas no trabalho e expectativas do candidato em relação à vaga — não repita os dados como uma lista de tópicos separados, escreva como uma narrativa única e fluida.
- "Observações Ergonômicas e Ambientais": recomendações de acessibilidade física, mobiliário, iluminação, ruído e demais fatores ambientais relevantes.
- "Parecer e Recomendações": síntese final com os principais pontos de atenção e recomendações objetivas de adaptação, considerando também o tipo de deficiência e as observações sobre a condição informadas abaixo.

Não inclua uma seção de identificação nem repita nome/cargo/empresa/tipo de deficiência no corpo do texto — esses dados já aparecem em tabela própria no relatório final. Seja objetivo, use linguagem profissional e respeitosa, evite jargões desnecessários e não invente informações que não estejam nas anotações — se um campo estiver vazio ou incompleto, indique isso brevemente na seção correspondente em vez de presumir.

--- ANOTAÇÕES DA ENTREVISTA ---

Identificação:
- Nome do candidato: ${dados.nome || '(não informado)'}
- Cargo pretendido: ${dados.cargo || '(não informado)'}
- Empresa: ${dados.empresa || '(não informado)'}

Deficiência:
- Tipo de deficiência: ${dados.tipoDeficiencia || '(não informado)'}
- Observações sobre a condição: ${dados.observacoesCondicao || '(não informado)'}

Rotina e autonomia:
${dados.rotina || '(não informado)'}

Histórico profissional:
${dados.historico || '(não informado)'}

Necessidades específicas no trabalho:
${dados.necessidades || '(não informado)'}

Expectativas do candidato:
${dados.expectativas || '(não informado)'}

Observações ergonômicas/ambientais:
${dados.observacoesErgonomicas || '(não informado)'}

Notas livres do avaliador:
${dados.notasLivres || '(não informado)'}
--- FIM DAS ANOTAÇÕES ---`
}

/**
 * Gera o relatório final via API da Anthropic a partir dos dados do formulário de avaliação.
 * @param {object} dadosFormulario
 * @param {string} apiKey chave de API informada pelo usuário (armazenada só na sessão do navegador)
 * @returns {Promise<string>} relatório em Markdown
 */
export async function gerarRelatorio(dadosFormulario, apiKey) {
  if (!apiKey) {
    throw new Error(
      'Nenhuma chave de API configurada. Informe sua chave da Anthropic nas configurações da conta.',
    )
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      // Necessário para permitir chamadas diretas do navegador — apenas para prototipagem.
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2048,
      thinking: { type: 'disabled' },
      messages: [{ role: 'user', content: montarPrompt(dadosFormulario) }],
    }),
  })

  if (!response.ok) {
    const errText = await response.text().catch(() => '')
    throw new Error(
      `Erro ao gerar relatório (${response.status}). ${errText || 'Verifique sua chave de API e tente novamente.'}`,
    )
  }

  const data = await response.json()
  const textBlock = data.content?.find((b) => b.type === 'text')
  if (!textBlock) {
    throw new Error('A resposta da IA não retornou texto. Tente novamente.')
  }
  return textBlock.text
}
