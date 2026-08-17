import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// React Router não reseta o scroll ao navegar entre rotas — sem isso, a página
// nova herda a posição de rolagem da página anterior. Quando a URL tem uma
// âncora (#planos, #faq...), rola até o elemento em vez de ir para o topo —
// necessário para os links do menu que apontam para seções da Home.
export function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '')
      // Aguarda o layout da nova página montar antes de medir a posição do alvo.
      const timer = setTimeout(() => {
        const el = document.getElementById(id)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } else {
          window.scrollTo(0, 0)
        }
      }, 80)
      return () => clearTimeout(timer)
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}
