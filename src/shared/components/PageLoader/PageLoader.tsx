import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './PageLoader.module.scss'

interface PageLoaderProps {
  fullscreen?: boolean
  label?: string
}

export function PageLoader({ fullscreen = false, label }: PageLoaderProps) {
  const { t } = useTranslation()
  return (
    <div
      className={`${styles.wrap} ${fullscreen ? styles.fullscreen : ''}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className={styles.bolt} aria-hidden="true" />
      <span className={styles.spinner} aria-hidden="true" />
      <p className={styles.label}>{label ?? t('app.loading')}</p>
    </div>
  )
}

export function RouteProgress() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let timer: number | undefined
    const onStart = () => {
      window.clearTimeout(timer)
      setVisible(true)
    }
    const onDone = () => {
      timer = window.setTimeout(() => setVisible(false), 220)
    }

    window.addEventListener('barq:nav-start', onStart)
    window.addEventListener('barq:nav-done', onDone)
    return () => {
      window.removeEventListener('barq:nav-start', onStart)
      window.removeEventListener('barq:nav-done', onDone)
      window.clearTimeout(timer)
    }
  }, [])

  if (!visible) return null
  return <div className={styles.topBar} aria-hidden="true" />
}
