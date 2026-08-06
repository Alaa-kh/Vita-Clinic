import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/Button/Button'
import styles from '@/shared/components/Dialog/Dialog.module.scss'

type FooterAlign = 'start' | 'center' | 'end'

interface DialogProps {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children?: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  footerAlign?: FooterAlign
}

const EXIT_MS = 280

export function Dialog({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  size = 'md',
  footerAlign = 'end',
}: DialogProps) {
  const { t } = useTranslation()
  const titleId = useId()
  const descriptionId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(open)
  const [phase, setPhase] = useState<'open' | 'closing'>(open ? 'open' : 'closing')

  useEffect(() => {
    if (open) {
      setMounted(true)
      setPhase('open')
      return
    }

    if (!mounted) return

    setPhase('closing')
    const timer = window.setTimeout(() => {
      setMounted(false)
    }, EXIT_MS)

    return () => window.clearTimeout(timer)
  }, [open, mounted])

  useEffect(() => {
    if (!mounted || phase !== 'open') return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    panelRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [mounted, phase, onClose])

  if (!mounted) {
    return null
  }

  const motionClass = phase === 'closing' ? styles.closing : styles.opening

  return createPortal(
    <div className={[styles.root, motionClass].join(' ')} role="presentation">
      <button
        type="button"
        className={styles.backdrop}
        aria-label={t('app.cancel')}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className={[styles.panel, styles[size]].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
      >
        <div className={styles.glow} aria-hidden="true" />
        <header className={styles.header}>
          <div className={styles.headerCopy}>
            <h2 id={titleId}>{title}</h2>
            {description ? (
              <p id={descriptionId} className={styles.description}>
                {description}
              </p>
            ) : null}
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} aria-label={t('dialog.close')}>
            ✕
          </Button>
        </header>
        {children ? <div className={styles.body}>{children}</div> : null}
        {footer ? (
          <footer className={[styles.footer, styles[`align-${footerAlign}`]].join(' ')}>{footer}</footer>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
