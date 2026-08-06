import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/Button/Button'
import styles from './StateMessage.module.scss'

interface StateMessageProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  tone?: 'empty' | 'error'
}

export function StateMessage({
  title,
  description,
  actionLabel,
  onAction,
  tone = 'empty',
}: StateMessageProps) {
  const { t } = useTranslation()

  return (
    <div className={[styles.wrap, styles[tone]].join(' ')} role={tone === 'error' ? 'alert' : 'status'}>
      <h2 className={styles.title}>{title}</h2>
      {description ? <p className={styles.description}>{description}</p> : null}
      {onAction ? (
        <Button type="button" variant="secondary" onClick={onAction}>
          {actionLabel ?? t('app.retry')}
        </Button>
      ) : null}
    </div>
  )
}
