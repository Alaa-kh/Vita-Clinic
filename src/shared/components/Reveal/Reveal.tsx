import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

type RevealVariant = 'up' | 'scale' | 'left' | 'right'

interface RevealProps {
  children: ReactNode
  className?: string
  delayMs?: number
  variant?: RevealVariant
  as?: 'div' | 'section' | 'article' | 'header' | 'li'
}

export function Reveal({
  children,
  className,
  delayMs = 0,
  variant = 'up',
  as: Tag = 'div',
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const style = {
    '--reveal-delay': `${delayMs}ms`,
  } as CSSProperties

  return (
    <Tag
      ref={ref as never}
      style={style}
      className={[
        'reveal',
        `reveal-${variant}`,
        visible ? 'reveal-visible' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </Tag>
  )
}
