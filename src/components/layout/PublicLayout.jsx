import { Outlet } from 'react-router-dom'
import { PublicHeader } from './PublicHeader.jsx'
import { PublicFooter } from './PublicFooter.jsx'

export function PublicLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-mist-100">
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  )
}
