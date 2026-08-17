import { useEffect, useRef, useState } from 'react'

const DIRECTIONS = {
  up: 'translate-y-6',
  left: 'translate-x-6',
  right: '-translate-x-6',
  scale: 'scale-95',
  none: '',
}

/** Revela o conteúdo com fade + leve deslocamento/escala quando entra na viewport. */
export function Reveal({ children, className = '', direction = 'up', delay = 0, as: Comp = 'div' }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <Comp
      ref={ref}
      style={{
        transitionDelay: visible ? `${delay}ms` : '0ms',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className={`transition-all duration-700 ${
        visible ? 'translate-x-0 translate-y-0 scale-100 opacity-100' : `opacity-0 ${DIRECTIONS[direction]}`
      } ${className}`}
    >
      {children}
    </Comp>
  )
}
