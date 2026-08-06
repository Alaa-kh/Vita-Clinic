import { useTranslation } from 'react-i18next'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Button } from '@/shared/components/Button/Button'
import { formatDate } from '@/shared/utils/format'
import styles from '@/features/profile/pages/ProfilePage.module.scss'

export function ProfilePage() {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuth()

  if (!user) {
    return null
  }

  return (
    <div className={`container page ${styles.page}`}>
      <header className={styles.header}>
        <h1>{t('profile.title')}</h1>
        <p>{t('profile.subtitle')}</p>
      </header>

      <dl className={styles.card}>
        <div>
          <dt>{t('auth.fullName')}</dt>
          <dd>{user.fullName}</dd>
        </div>
        <div>
          <dt>{t('auth.email')}</dt>
          <dd>{user.email}</dd>
        </div>
        <div>
          <dt>{t('profile.role')}</dt>
          <dd>
            {user.role === 'provider' ? t('auth.roles.provider') : t('auth.roles.patient')}
          </dd>
        </div>
        {user.phone ? (
          <div>
            <dt>{t('auth.phone')}</dt>
            <dd>{user.phone}</dd>
          </div>
        ) : null}
        <div>
          <dt>{t('profile.memberSince')}</dt>
          <dd>{formatDate(user.createdAt, i18n.language)}</dd>
        </div>
      </dl>

      <Button type="button" variant="secondary" onClick={logout}>
        {t('nav.logout')}
      </Button>
    </div>
  )
}
