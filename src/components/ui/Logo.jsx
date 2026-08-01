// Elemento visual de assinatura da marca: três barras ascendentes representando
// os níveis de maturidade em inclusão (Inicial → Em desenvolvimento → Avançado).
export function Mark({ className = 'h-8 w-8', dark = false }) {
  const bg = dark ? '#1e2a4a' : 'transparent'
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      {dark && <rect width="48" height="48" rx="11" fill={bg} />}
      <rect x="9" y="27" width="7" height="12" rx="1.5" fill="#12a594" />
      <rect x="20.5" y="19" width="7" height="20" rx="1.5" fill="#12a594" />
      <rect x="32" y="10" width="7" height="29" rx="1.5" fill="#6c4ce6" />
    </svg>
  )
}

export function Logo({ className = '', dark = false }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Mark className="h-8 w-8 shrink-0" dark={dark} />
      <span className="font-display text-lg font-semibold leading-none tracking-tight text-indigo-700">
        Inclui<span className="text-signal-600">Pro</span>
      </span>
    </span>
  )
}
