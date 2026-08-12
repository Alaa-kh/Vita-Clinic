import { useTranslation } from 'react-i18next'
import styles from './Spinner.module.scss'

interface SpinnerProps {
  label?: string
}

export function Spinner({ label }: SpinnerProps) {
  const { t } = useTranslation()
  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span>{label ?? t('app.loading')}</span>
    </div>
  )
}
