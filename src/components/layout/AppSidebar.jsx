import { NavLink, useNavigate } from 'react-router-dom'
import { Logo } from '../ui/Logo.jsx'
import { useAuth } from '../../lib/auth.jsx'

const items = [
  {
    to: '/app',
    end: true,
    label: 'Painel',
    hint: 'Situação e pendências',
    icon: <path d="M4 11.5L12 4l8 7.5M6 10v9a1 1 0 001 1h4v-6h2v6h4a1 1 0 001-1v-9" />,
  },
  {
    to: '/app/colaboradores',
    label: 'Colaboradores',
    hint: 'Cadastro e histórico',
    icon: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20c.9-3 3-5 6-5s5.1 2 6 5M16 5.5a3 3 0 010 5.8M20.5 20c-.5-2.3-1.7-4-3.5-5" />
      </>
    ),
  },
  {
    to: '/app/avalia',
    label: 'Avaliações',
    hint: 'Relatórios técnicos de inclusão',
    icon: (
      <path d="M6 4h9l3 3v13a1 1 0 01-1 1H6a1 1 0 01-1-1V5a1 1 0 011-1zM8 12h8M8 16h5M8 8h4" />
    ),
  },
  {
    to: '/app/lidera',
    label: 'Treinamentos',
    hint: 'Kits de capacitação',
    icon: <path d="M4 6h16M4 6v12a1 1 0 001 1h6M4 6l2-3h12l2 3M14 19l3 2v-6.5M17 14.5l3-2" />,
  },
  {
    to: '/app/solicitacoes',
    label: 'Solicitações',
    hint: 'Pedidos de adaptação',
    restritoA: ['admin', 'rh', 'gestor'],
    icon: <path d="M12 4a3 3 0 110 6 3 3 0 010-6zM5 20c1.2-3.6 3.8-6 7-6s5.8 2.4 7 6M9 13l1.5 2L14 11" />,
  },
  {
    to: '/app/canal-colaborador',
    label: 'Canal do Colaborador',
    hint: 'Pedidos recebidos sem login',
    restritoA: ['admin', 'rh', 'gestor'],
    icon: <path d="M4 5h16a1 1 0 011 1v10a1 1 0 01-1 1H9l-5 4V6a1 1 0 011-1z" />,
  },
  {
    to: '/app/documentos',
    label: 'Documentos',
    hint: 'Laudos e comprovantes',
    icon: <path d="M7 4h7l4 4v12a1 1 0 01-1 1H7a1 1 0 01-1-1V5a1 1 0 011-1zM14 4v4h4M9 13l2 2 4-4" />,
  },
  {
    to: '/app/conta',
    label: 'Configurações',
    hint: 'Empresa e assinatura',
    icon: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </>
    ),
  },
]

export function AppSidebar({ onNavigate }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="flex h-full flex-col bg-indigo-800 text-indigo-100">
      <div className="px-6 py-6">
        <Logo dark={false} className="[&_span]:text-white [&_span_span]:text-signal-300" />
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {items
          .filter((item) => !item.restritoA || item.restritoA.includes(user?.papel))
          .map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-3 text-sm transition-colors ${
                isActive ? 'bg-white/10 text-white' : 'text-indigo-200 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              {item.icon}
            </svg>
            <span>
              <span className="block font-medium leading-tight">{item.label}</span>
              <span className="block text-xs text-indigo-300">{item.hint}</span>
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 px-6 py-5">
        <p className="truncate text-sm font-medium text-white">{user?.companyName}</p>
        <p className="truncate text-xs text-indigo-300">{user?.email}</p>
        <button
          onClick={handleLogout}
          className="mt-3 text-xs font-semibold text-signal-300 hover:text-signal-200"
        >
          Sair da conta
        </button>
      </div>
    </div>
  )
}
