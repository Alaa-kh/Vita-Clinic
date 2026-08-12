import { useTranslation } from 'react-i18next'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import styles from '@/features/auth/pages/AuthPage.module.scss'

const CLINIC_IMAGE =
  'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1400&q=85'

export function RegisterPage() {
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
          <h1>{t('auth.registerTitle')}</h1>
          <p>{t('auth.registerSubtitle')}</p>
        </header>
        <RegisterForm />
      </div>
    </section>
  )
}
