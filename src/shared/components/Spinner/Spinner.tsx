import { useTranslation } from 'react-i18next'
import { PageLoader } from '@/shared/components/PageLoader/PageLoader'
import styles from './Spinner.module.scss'

interface SpinnerProps {
  label?: string
  fullscreen?: boolean
}

export function Spinner({ label, fullscreen = false }: SpinnerProps) {
  const { t } = useTranslation()
  if (fullscreen) {
    return <PageLoader fullscreen label={label} />
  }
  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span>{label ?? t('app.loading')}</span>
    </div>
  )
}
