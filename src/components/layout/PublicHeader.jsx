import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Logo } from '../ui/Logo.jsx'
import { Button } from '../ui/Button.jsx'

const links = [
  { to: '/#solucoes', label: 'Soluções' },
  { to: '/diagnostico', label: 'Diagnóstico' },
  { to: '/#como-funciona', label: 'Como funciona' },
  { to: '/#planos', label: 'Planos' },
  { to: '/#fundadores', label: 'Programa Fundadores' },
]

export function PublicHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-mist-300 bg-white/90 backdrop-blur">
      <div className="hidden border-b border-mist-200 bg-indigo-900 md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-end px-5 py-1.5 sm:px-8">
          <a
            href="mailto:contato.incluipro@gmail.com"
            className="text-xs font-medium text-indigo-200 hover:text-white"
          >
            contato.incluipro@gmail.com
          </a>
        </div>
      </div>
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
        <NavLink to="/" className="shrink-0">
          <Logo />
        </NavLink>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-graphite-700 transition-colors hover:bg-mist-200"
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button to="/login" variant="ghost" size="sm">
            Entrar
          </Button>
          <Button to="/diagnostico" variant="primary" size="sm">
            Começar diagnóstico
          </Button>
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-full border border-mist-400 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menu"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-indigo-700" fill="none">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-mist-300 bg-white px-5 py-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-graphite-700 hover:bg-mist-200"
              >
                {l.label}
              </NavLink>
            ))}
            <div className="mt-3 flex gap-2">
              <Button to="/login" variant="ghost" className="flex-1" onClick={() => setOpen(false)}>
                Entrar
              </Button>
              <Button to="/diagnostico" variant="primary" className="flex-1" onClick={() => setOpen(false)}>
                Começar diagnóstico
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
