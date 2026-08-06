import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { useToggleFavorite } from '@/features/favorites/hooks/useToggleFavorite'
import { useCare } from '@/features/care/hooks/useCare'
import { Button } from '@/shared/components/Button/Button'
import { Dialog } from '@/shared/components/Dialog/Dialog'
import { Spinner } from '@/shared/components/Spinner/Spinner'
import { StateMessage } from '@/shared/components/StateMessage/StateMessage'
import { TextField } from '@/shared/components/TextField/TextField'
import { ROUTES } from '@/shared/constants/routes'
import { isAppError } from '@/shared/errors/AppError'
import { errorMessageKey } from '@/shared/utils/errorMessageKey'
import { formatCurrency } from '@/shared/utils/format'
import styles from '@/features/care/pages/CareDetailPage.module.scss'

export function CareDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t, i18n } = useTranslation()
  const query = useCare(id)
  const { toggleFavorite, isPending } = useToggleFavorite()
  const [bookOpen, setBookOpen] = useState(false)
  const [sentOpen, setSentOpen] = useState(false)
  const [message, setMessage] = useState('')

  if (query.isLoading) {
    return <Spinner />
  }

  if (query.isError) {
    return (
      <div className="container page">
        <StateMessage
          tone="error"
          title={t(
            isAppError(query.error) ? errorMessageKey(query.error.code) : 'errors.generic',
          )}
          onAction={() => void query.refetch()}
        />
      </div>
    )
  }

  if (!query.data) {
    return (
      <div className="container page">
        <StateMessage title={t('errors.notFound')} />
      </div>
    )
  }

  const care = query.data
  const primaryImage = care.images[0] ?? ''

  return (
    <article className={`container page ${styles.page}`}>
      <Link to={ROUTES.care} className={styles.back}>
        {t('app.back')}
      </Link>

      <div className={styles.gallery}>
        <img src={primaryImage} alt={care.title} className={styles.primaryImage} />
        {care.images.slice(1).map((image) => (
          <img key={image} src={image} alt="" />
        ))}
      </div>

      <div className={styles.content}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>
              {t(`care.specialties.${care.specialty}`)} ·{' '}
              {t(`care.careModes.${care.careMode}`)} · {care.clinicName}
            </p>
            <h1>{care.title}</h1>
            <p className={styles.location}>
              {care.city}, {care.country}
            </p>
            <p className={styles.address}>{care.address}</p>
          </div>
          <div className={styles.aside}>
            <p className={styles.price}>
              {formatCurrency(care.price, care.currency, i18n.language)}
            </p>
            <Button
              type="button"
              variant={care.isFavorite ? 'primary' : 'secondary'}
              disabled={isPending}
              onClick={() => void toggleFavorite(care.id, care.isFavorite)}
            >
              {care.isFavorite ? t('care.removeFavorite') : t('care.addFavorite')}
            </Button>
            <Button type="button" onClick={() => setBookOpen(true)}>
              {t('care.bookAppointment')}
            </Button>
          </div>
        </header>

        <ul className={styles.stats}>
          <li>{t('care.experienceYears', { count: care.experienceYears })}</li>
          <li>{t(`care.careModes.${care.careMode}`)}</li>
          <li>{t(`care.specialties.${care.specialty}`)}</li>
          <li>
            {care.status === 'available'
              ? t('care.statusAvailable')
              : care.status === 'busy'
                ? t('care.statusBusy')
                : t('care.statusUnavailable')}
          </li>
          {care.languages.length > 0 ? (
            <li>{t('care.spec.languages', { languages: care.languages.join(', ') })}</li>
          ) : null}
        </ul>

        <section className={styles.section}>
          <h2>{t('care.description')}</h2>
          <p>{care.description}</p>
        </section>

        {care.tags.length > 0 ? (
          <section className={styles.section}>
            <h2>{t('care.tags')}</h2>
            <ul className={styles.tags}>
              {care.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className={styles.highlights}>
          <h2>{t('care.specs')}</h2>
          <div className={styles.highlightGrid}>
            <div>
              <strong>{t('care.form.specialty')}</strong>
              <span>{t(`care.specialties.${care.specialty}`)}</span>
            </div>
            <div>
              <strong>{t('care.form.careMode')}</strong>
              <span>{t(`care.careModes.${care.careMode}`)}</span>
            </div>
            <div>
              <strong>{t('care.form.experienceYears')}</strong>
              <span>{care.experienceYears}</span>
            </div>
            <div>
              <strong>{t('care.form.clinicName')}</strong>
              <span>{care.clinicName}</span>
            </div>
            <div>
              <strong>{t('care.form.city')}</strong>
              <span>{care.city}</span>
            </div>
            <div>
              <strong>{t('care.form.country')}</strong>
              <span>{care.country}</span>
            </div>
            <div>
              <strong>{t('care.form.address')}</strong>
              <span>{care.address}</span>
            </div>
            <div>
              <strong>{t('care.form.languages')}</strong>
              <span>{care.languages.join(', ')}</span>
            </div>
          </div>
        </section>
      </div>

      <Dialog
        open={bookOpen}
        title={t('dialog.bookTitle')}
        description={t('dialog.bookBody', { title: care.title })}
        onClose={() => setBookOpen(false)}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setBookOpen(false)}>
              {t('app.cancel')}
            </Button>
            <Button
              type="button"
              onClick={() => {
                setBookOpen(false)
                setSentOpen(true)
                setMessage('')
              }}
            >
              {t('dialog.sendMessage')}
            </Button>
          </>
        }
      >
        <TextField
          label={t('dialog.messageLabel')}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={t('dialog.messagePlaceholder')}
        />
      </Dialog>

      <Dialog
        open={sentOpen}
        title={t('dialog.sentTitle')}
        description={t('dialog.sentBody')}
        onClose={() => setSentOpen(false)}
        size="sm"
        footerAlign="center"
        footer={
          <Button type="button" onClick={() => setSentOpen(false)}>
            {t('dialog.gotIt')}
          </Button>
        }
      />
    </article>
  )
}
