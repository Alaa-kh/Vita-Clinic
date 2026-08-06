import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { CareGrid } from '@/features/care/components/CareGrid'
import { useFavorites } from '@/features/favorites/hooks/useFavorites'
import { Spinner } from '@/shared/components/Spinner/Spinner'
import { StateMessage } from '@/shared/components/StateMessage/StateMessage'
import { ROUTES } from '@/shared/constants/routes'
import { isAppError } from '@/shared/errors/AppError'
import { errorMessageKey } from '@/shared/utils/errorMessageKey'
import styles from '@/features/favorites/pages/FavoritesPage.module.scss'

export function FavoritesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const query = useFavorites()

  if (!isAuthenticated) {
    return (
      <div className="container page">
        <StateMessage
          title={t('favorites.loginRequired')}
          actionLabel={t('nav.login')}
          onAction={() => navigate(ROUTES.login)}
        />
      </div>
    )
  }

  return (
    <div className={`container page ${styles.page}`}>
      <header className={styles.header}>
        <h1>{t('favorites.title')}</h1>
        <p>{t('favorites.subtitle')}</p>
      </header>

      {query.isLoading ? <Spinner /> : null}

      {query.isError ? (
        <StateMessage
          tone="error"
          title={t(
            isAppError(query.error) ? errorMessageKey(query.error.code) : 'errors.generic',
          )}
          onAction={() => void query.refetch()}
        />
      ) : null}

      {query.isSuccess && query.data.length === 0 ? (
        <StateMessage
          title={t('favorites.empty')}
          actionLabel={t('home.hero.ctaFindCare')}
          onAction={() => navigate(ROUTES.care)}
        />
      ) : null}

      {query.isSuccess && query.data.length > 0 ? <CareGrid items={query.data} /> : null}

      <Link to={ROUTES.care} className={styles.link}>
        {t('home.hero.ctaFindCare')}
      </Link>
    </div>
  )
}
