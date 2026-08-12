import { useEffect, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/Button/Button'
import { ROUTES } from '@/shared/constants/routes'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'
import logoUrl from '@/assets/barq-logo.png'
import styles from '@/shared/components/PromoPopup/PromoPopup.module.scss'

export function PromoPopup() {
  const { t } = useTranslation()
  const titleId = useId()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEYS.promoDismissed) === '1') return

    const timer = window.setTimeout(() => setOpen(true), 1400)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEYS.promoDismissed, '1')
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className={styles.overlay} role="presentation" onClick={dismiss}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className={styles.close} onClick={dismiss} aria-label={t('promo.close')}>
          ×
        </button>
        <div className={styles.media} aria-hidden="true">
          <img src={logoUrl} alt="" />
          <span className={styles.badge}>{t('promo.badge')}</span>
        </div>
        <div className={styles.body}>
          <p className={styles.eyebrow}>{t('promo.eyebrow')}</p>
          <h2 id={titleId}>{t('promo.title')}</h2>
          <p>{t('promo.body')}</p>
          <p className={styles.price}>{t('promo.price')}</p>
          <div className={styles.actions}>
            <Link to={ROUTES.shop} className={styles.primary} onClick={dismiss}>
              {t('promo.cta')}
            </Link>
            <Button type="button" variant="ghost" onClick={dismiss}>
              {t('promo.later')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
