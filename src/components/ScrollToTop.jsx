import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// React Router não reseta o scroll ao navegar entre rotas — sem isso, a página
// nova herda a posição de rolagem da página anterior.
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
