import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BrandMark } from '@/shared/components/BrandMark/BrandMark'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { ROUTES } from '@/shared/constants/routes'
import styles from '@/features/auth/pages/AuthPage.module.scss'

export function RegisterPage() {
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
          <h1>{t('auth.registerTitle')}</h1>
          <p>{t('auth.registerSubtitle')}</p>
        </header>
        <RegisterForm />
      </div>
    </section>
  )
}
