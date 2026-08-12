import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '@/shared/constants/routes'
import styles from '@/features/platform/pages/Platform.module.scss'

const MODULES = [
  { to: ROUTES.maps, titleKey: 'platform.maps', bodyKey: 'platform.mapsBody' },
  { to: ROUTES.booking, titleKey: 'platform.booking', bodyKey: 'platform.bookingBody' },
  { to: ROUTES.payments, titleKey: 'platform.payments', bodyKey: 'platform.paymentsBody' },
  { to: ROUTES.chat, titleKey: 'platform.chat', bodyKey: 'platform.chatBody' },
  { to: ROUTES.call, titleKey: 'platform.call', bodyKey: 'platform.callBody' },
  { to: ROUTES.ai, titleKey: 'platform.ai', bodyKey: 'platform.aiBody' },
  { to: ROUTES.analytics, titleKey: 'platform.analytics', bodyKey: 'platform.analyticsBody' },
  { to: ROUTES.notifications, titleKey: 'platform.notifications', bodyKey: 'platform.notificationsBody' },
  { to: ROUTES.storage, titleKey: 'platform.storage', bodyKey: 'platform.storageBody' },
  { to: ROUTES.security, titleKey: 'platform.security', bodyKey: 'platform.securityBody' },
] as const

export function PlatformHubPage() {
  const { t } = useTranslation()

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>{t('platform.eyebrow')}</p>
        <h1>{t('platform.title')}</h1>
        <p>{t('platform.subtitle')}</p>
      </header>

      <div className={styles.hubGrid}>
        {MODULES.map((mod) => (
          <Link key={mod.to} to={mod.to} className={styles.hubCard}>
            <strong>{t(mod.titleKey)}</strong>
            <span>{t(mod.bodyKey)}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
