import { useTranslation } from 'react-i18next'
import { LoginForm } from '@/features/auth/components/LoginForm'
import styles from '@/features/auth/pages/AuthPage.module.scss'

const CLINIC_IMAGE =
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1400&q=85'

export function LoginPage() {
  const { t } = useTranslation()

  return (
    <section className={styles.panel}>
      <div className={styles.visual} aria-hidden="true">
        <img src={CLINIC_IMAGE} alt="" />
        <div className={styles.visualCopy}>
          <strong>{t('app.name')}</strong>
          <p>{t('auth.visualLine')}</p>
        </div>
      </div>
      <div className={styles.content}>
        <header className={styles.header}>
          <p className={styles.brand}>{t('app.name')}</p>
          <h1>{t('auth.loginTitle')}</h1>
          <p>{t('auth.loginSubtitle')}</p>
        </header>
        <LoginForm />
      </div>
    </section>
  )
}
