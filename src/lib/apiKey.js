// Gestão da chave de API da Anthropic usada pelo IncluiPro Avalia.
// Prioridade: chave salva pela empresa em "Minha conta" > variável de ambiente de build.
// TODO: em produção, a chave nunca deve chegar ao navegador — isso é só para prototipagem.

const API_KEY_STORAGE = 'incluipro_anthropic_api_key'

export function getApiKey() {
  return localStorage.getItem(API_KEY_STORAGE) || import.meta.env.VITE_ANTHROPIC_API_KEY || ''
}

export function setApiKey(key) {
  if (key) {
    localStorage.setItem(API_KEY_STORAGE, key)
  } else {
    localStorage.removeItem(API_KEY_STORAGE)
  }
}
