import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { CareFilters } from '@/features/care/components/CareFilters'
import { CareGrid } from '@/features/care/components/CareGrid'
import { useCareFilters } from '@/features/care/hooks/useCareFilters'
import { useCareList } from '@/features/care/hooks/useCareList'
import type { CareMode, Specialty } from '@/features/care/types/care'
import { Reveal } from '@/shared/components/Reveal/Reveal'
import { Button } from '@/shared/components/Button/Button'
import { Spinner } from '@/shared/components/Spinner/Spinner'
import { StateMessage } from '@/shared/components/StateMessage/StateMessage'
import { isAppError } from '@/shared/errors/AppError'
import { errorMessageKey } from '@/shared/utils/errorMessageKey'
import styles from '@/features/care/pages/CarePage.module.scss'

const SPECIALTIES: Specialty[] = [
  'general',
  'cardiology',
  'dermatology',
  'pediatrics',
  'orthopedics',
  'dentistry',
  'ophthalmology',
  'neurology',
  'mental',
  'gynecology',
  'ent',
  'emergency',
]

const CARE_MODES: CareMode[] = ['in_person', 'telehealth', 'home_visit']

function parseSpecialty(value: string | null): Specialty | '' {
  if (value && SPECIALTIES.includes(value as Specialty)) {
    return value as Specialty
  }
  return ''
}

function parseCareMode(value: string | null): CareMode | '' {
  if (value && CARE_MODES.includes(value as CareMode)) {
    return value as CareMode
  }
  return ''
}

export function CarePage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const specialtyFromUrl = parseSpecialty(searchParams.get('specialty'))
  const careModeFromUrl = parseCareMode(searchParams.get('careMode'))

  const {
    filters,
    setQuery,
    setSpecialty,
    setCareMode,
    setCity,
    setMinPrice,
    setMaxPrice,
    setPage,
    clear,
  } = useCareFilters({
    specialty: specialtyFromUrl,
    careMode: careModeFromUrl,
  })
  const query = useCareList(filters)

  useEffect(() => {
    if (specialtyFromUrl) {
      setSpecialty(specialtyFromUrl)
    }
  }, [specialtyFromUrl, setSpecialty])

  useEffect(() => {
    if (careModeFromUrl) {
      setCareMode(careModeFromUrl)
    }
  }, [careModeFromUrl, setCareMode])

  return (
    <div className={`container page ${styles.page}`}>
      <Reveal as="header" className={styles.header}>
        <h1>{t('care.title')}</h1>
        <p>{t('care.subtitle')}</p>
      </Reveal>

      <Reveal delayMs={80}>
        <CareFilters
          values={filters}
          onQueryChange={setQuery}
          onSpecialtyChange={setSpecialty}
          onCareModeChange={setCareMode}
          onCityChange={setCity}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
          onClear={clear}
        />
      </Reveal>

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

      {query.isSuccess && query.data.items.length === 0 ? (
        <StateMessage
          title={t('care.empty')}
          onAction={clear}
          actionLabel={t('app.clearFilters')}
        />
      ) : null}

      {query.isSuccess && query.data.items.length > 0 ? (
        <>
          <CareGrid items={query.data.items} />
          {query.data.pagination.totalPages > 1 ? (
            <div className={styles.pagination}>
              <Button
                type="button"
                variant="secondary"
                disabled={query.data.pagination.page <= 1}
                onClick={() => setPage(query.data.pagination.page - 1)}
              >
                {t('app.back')}
              </Button>
              <span>
                {query.data.pagination.page} / {query.data.pagination.totalPages}
              </span>
              <Button
                type="button"
                variant="secondary"
                disabled={query.data.pagination.page >= query.data.pagination.totalPages}
                onClick={() => setPage(query.data.pagination.page + 1)}
              >
                {t('app.next')}
              </Button>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
