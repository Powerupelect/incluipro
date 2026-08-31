import { NavLink, useNavigate } from 'react-router-dom'
import { Logo } from '../ui/Logo.jsx'
import { useAuth } from '../../lib/auth.jsx'

const items = [
  {
    to: '/app',
    end: true,
    label: 'Início',
    hint: 'Painel geral',
    icon: <path d="M4 11.5L12 4l8 7.5M6 10v9a1 1 0 001 1h4v-6h2v6h4a1 1 0 001-1v-9" />,
  },
  {
    to: '/app/avalia',
    label: 'IncluiPro Avalia',
    hint: 'Relatórios técnicos de inclusão',
    icon: (
      <path d="M6 4h9l3 3v13a1 1 0 01-1 1H6a1 1 0 01-1-1V5a1 1 0 011-1zM8 12h8M8 16h5M8 8h4" />
    ),
  },
  {
    to: '/app/matriz',
    label: 'Matriz de Compatibilidade',
    hint: 'Cargo × tipo de deficiência',
    icon: <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />,
  },
  {
    to: '/app/laudos',
    label: 'Triagem de Laudos',
    hint: 'Documentos e consistência',
    icon: <path d="M7 4h7l4 4v12a1 1 0 01-1 1H7a1 1 0 01-1-1V5a1 1 0 011-1zM14 4v4h4M9 13l2 2 4-4" />,
  },
  {
    to: '/app/acessibilidade',
    label: 'Central de Acessibilidade',
    hint: 'Solicitações de adaptação',
    restritoA: ['admin', 'rh', 'gestor'],
    icon: <path d="M12 4a3 3 0 110 6 3 3 0 010-6zM5 20c1.2-3.6 3.8-6 7-6s5.8 2.4 7 6M9 13l1.5 2L14 11" />,
  },
  {
    to: '/app/lidera',
    label: 'IncluiPro Lidera',
    hint: 'Kits de treinamento',
    icon: <path d="M4 6h16M4 6v12a1 1 0 001 1h6M4 6l2-3h12l2 3M14 19l3 2v-6.5M17 14.5l3-2" />,
  },
  {
    to: '/app/conta',
    label: 'Minha conta',
    hint: 'Empresa e assinatura',
    icon: <path d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 20c1.5-4 4.5-6 8-6s6.5 2 8 6" />,
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
              `flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors ${
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
