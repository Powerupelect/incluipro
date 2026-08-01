import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AppSidebar } from './AppSidebar.jsx'

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-svh bg-mist-200">
      <aside className="hidden w-72 shrink-0 lg:block">
        <div className="fixed left-0 top-0 h-svh w-72">
          <AppSidebar />
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="w-72">
            <AppSidebar onNavigate={() => setMobileOpen(false)} />
          </div>
          <button
            className="flex-1 bg-graphite-900/50"
            aria-label="Fechar menu"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-mist-300 bg-white px-5 py-3 lg:hidden">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-mist-400"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-indigo-700" fill="none">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <span className="font-display text-sm font-semibold text-indigo-700">IncluiPro</span>
        </div>
        <main className="flex-1 px-5 py-8 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
