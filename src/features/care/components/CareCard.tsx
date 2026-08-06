import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useToggleFavorite } from '@/features/favorites/hooks/useToggleFavorite'
import type { Care } from '@/features/care/types/care'
import { Button } from '@/shared/components/Button/Button'
import { careDetailPath } from '@/shared/constants/routes'
import { formatCurrency } from '@/shared/utils/format'
import styles from '@/features/care/components/CareCard.module.scss'

interface CareCardProps {
  care: Care
}

export function CareCard({ care }: CareCardProps) {
  const { t, i18n } = useTranslation()
  const { toggleFavorite, isPending } = useToggleFavorite()
  const image = care.images[0] ?? ''

  return (
    <article className={styles.card}>
      <Link to={careDetailPath(care.id)} className={styles.media}>
        <img src={image} alt={care.title} loading="lazy" />
        <span className={styles.badge}>{t(`care.specialties.${care.specialty}`)}</span>
      </Link>

      <div className={styles.body}>
        <p className={styles.price}>
          {formatCurrency(care.price, care.currency, i18n.language)}
        </p>

        <h3 className={styles.title}>
          <Link to={careDetailPath(care.id)}>{care.title}</Link>
        </h3>

        <p className={styles.clinic}>{care.clinicName}</p>
        <p className={styles.city}>{care.city}</p>

        <div className={styles.actions}>
          <Link to={careDetailPath(care.id)} className={styles.bookBtn}>
            {t('care.book')}
          </Link>
          <Button
            type="button"
            size="sm"
            variant={care.isFavorite ? 'primary' : 'secondary'}
            disabled={isPending}
            onClick={() => void toggleFavorite(care.id, care.isFavorite)}
            aria-pressed={care.isFavorite}
            className={styles.favBtn}
          >
            {care.isFavorite ? t('care.removeFavorite') : t('care.addFavorite')}
          </Button>
        </div>
      </div>
    </article>
  )
}
