import { Outlet } from 'react-router-dom'
import { PublicHeader } from './PublicHeader.jsx'
import { PublicFooter } from './PublicFooter.jsx'

export function PublicLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-mist-100">
      <a
        href="#conteudo-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-signal-600 focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
      >
        Pular para o conteúdo
      </a>
      <PublicHeader />
      <main id="conteudo-principal" className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  )
}
