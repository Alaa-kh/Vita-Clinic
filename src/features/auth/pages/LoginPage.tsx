import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BrandMark } from '@/shared/components/BrandMark/BrandMark'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { ROUTES } from '@/shared/constants/routes'
import styles from '@/features/auth/pages/AuthPage.module.scss'

export function LoginPage() {
  const { t } = useTranslation()

  return (
    <section className={styles.panel}>
      <aside className={styles.brandPane} aria-hidden="true">
        <div className={styles.orbit} />
        <div className={styles.routeLine} />
        <div className={styles.brandPaneInner}>
          <span className={styles.boltBadge}>
            <BrandMark />
          </span>
          <p className={styles.paneEyebrow}>{t('header.deliveryBadge')}</p>
          <strong className={styles.paneTitle}>{t('app.name')}</strong>
          <p className={styles.paneLine}>{t('auth.visualLine')}</p>
          <ul className={styles.panePoints}>
            <li>{t('auth.pointTrack')}</li>
            <li>{t('auth.pointDispatch')}</li>
            <li>{t('auth.pointPay')}</li>
          </ul>
        </div>
      </aside>
      <div className={styles.content}>
        <header className={styles.header}>
          <Link to={ROUTES.home} className={styles.brand}>
            {t('app.name')}
          </Link>
          <h1>{t('auth.loginTitle')}</h1>
          <p>{t('auth.loginSubtitle')}</p>
        </header>
        <LoginForm />
      </div>
    </section>
  )
}
