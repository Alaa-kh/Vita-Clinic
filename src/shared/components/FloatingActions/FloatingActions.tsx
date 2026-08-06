import { useTranslation } from 'react-i18next'
import styles from '@/shared/components/FloatingActions/FloatingActions.module.scss'

export function FloatingActions() {
  const { t } = useTranslation()

  return (
    <div className={styles.root} aria-label={t('float.label')}>
      <a
        className={styles.whatsapp}
        href="https://wa.me/966500000000"
        target="_blank"
        rel="noreferrer"
      >
        <span className={styles.icon} aria-hidden="true" />
        <span>{t('float.whatsapp')}</span>
      </a>
      <a className={styles.call} href="tel:+966920000000">
        {t('float.call')}
      </a>
    </div>
  )
}
