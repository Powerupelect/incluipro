import { Link } from 'react-router-dom'
import { Logo } from '../ui/Logo.jsx'

export function PublicFooter() {
  return (
    <footer className="border-t border-mist-300 bg-indigo-900 text-indigo-100">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo dark className="[&_span]:text-white [&_span_span]:text-signal-300" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-indigo-200">
              Consultoria especializada em inclusão de pessoas com deficiência no mercado de
              trabalho, com metodologia própria.
            </p>
            <a
              href="mailto:contato@incluipro.com"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-signal-300 hover:text-signal-200"
            >
              contato@incluipro.com
            </a>
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-white">Produto</p>
            <ul className="mt-3 space-y-2 text-sm text-indigo-200">
              <li><Link className="hover:text-white" to="/produtos">IncluiPro Avalia</Link></li>
              <li><Link className="hover:text-white" to="/produtos">IncluiPro Lidera</Link></li>
              <li><Link className="hover:text-white" to="/diagnostico">Diagnóstico gratuito</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-white">Conta</p>
            <ul className="mt-3 space-y-2 text-sm text-indigo-200">
              <li><Link className="hover:text-white" to="/cadastro">Criar conta</Link></li>
              <li><Link className="hover:text-white" to="/login">Entrar</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-indigo-300 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} IncluiPro Soluções. Todos os direitos reservados.</p>
          <p>Protótipo — dados e autenticação simulados nesta versão.</p>
        </div>
      </div>
    </footer>
  )
}
