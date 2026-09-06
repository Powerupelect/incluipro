import { Link } from 'react-router-dom'

const variants = {
  primary:
    'bg-signal-600 text-white hover:bg-signal-700 shadow-[0_8px_24px_-10px_rgba(12,106,99,0.6)]',
  dark: 'bg-indigo-700 text-white hover:bg-indigo-800',
  ghost: 'bg-white text-indigo-700 border border-mist-400 hover:border-indigo-300 hover:bg-mist-200',
  outlineLight: 'bg-transparent text-white border border-white/35 hover:bg-white/10',
  danger: 'bg-white text-red-600 border border-red-200 hover:bg-red-50',
}

const sizes = {
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
  sm: 'px-3.5 py-2 text-xs',
}

const shapes = {
  // Botão de marketing (landing page) — pílula, com brilho e leve elevação no hover.
  pill: 'rounded-full',
  // Botão de produto (área logada) — cantos discretos, sem floreio, tom de ferramenta de trabalho.
  crm: 'rounded-md',
}

export function Button({
  as = 'button',
  to,
  href,
  variant = 'primary',
  size = 'md',
  shape = 'pill',
  className = '',
  children,
  ...props
}) {
  const microinteracoes =
    shape === 'crm' ? 'transition-colors duration-150' : 'btn-shine transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97] disabled:hover:translate-y-0'
  const classes = `inline-flex items-center justify-center gap-2 ${shapes[shape]} font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${microinteracoes} ${variants[variant]} ${sizes[size]} ${className}`
  const content =
    shape === 'crm' ? children : <span className="relative z-10 inline-flex items-center gap-2">{children}</span>

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    )
  }
  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {content}
      </a>
    )
  }
  const Comp = as
  return (
    <Comp className={classes} {...props}>
      {content}
    </Comp>
  )
}
