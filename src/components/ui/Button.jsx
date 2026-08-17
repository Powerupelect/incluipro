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

export function Button({
  as = 'button',
  to,
  href,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) {
  const classes = `btn-shine inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${variants[variant]} ${sizes[size]} ${className}`
  const content = <span className="relative z-10 inline-flex items-center gap-2">{children}</span>

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
