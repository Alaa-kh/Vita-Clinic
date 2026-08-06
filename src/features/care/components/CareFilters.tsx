import { useTranslation } from 'react-i18next'
import type { CareMode, Specialty } from '@/features/care/types/care'
import { Button } from '@/shared/components/Button/Button'
import { SelectField } from '@/shared/components/SelectField/SelectField'
import { TextField } from '@/shared/components/TextField/TextField'
import styles from '@/features/care/components/CareFilters.module.scss'

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

interface CareFiltersProps {
  values: {
    q?: string
    specialty?: Specialty | ''
    careMode?: CareMode | ''
    city?: string
    minPrice?: string
    maxPrice?: string
  }
  onQueryChange: (value: string) => void
  onSpecialtyChange: (value: Specialty | '') => void
  onCareModeChange: (value: CareMode | '') => void
  onCityChange: (value: string) => void
  onMinPriceChange: (value: string) => void
  onMaxPriceChange: (value: string) => void
  onClear: () => void
}

export function CareFilters({
  values,
  onQueryChange,
  onSpecialtyChange,
  onCareModeChange,
  onCityChange,
  onMinPriceChange,
  onMaxPriceChange,
  onClear,
}: CareFiltersProps) {
  const { t } = useTranslation()

  return (
    <form
      className={styles.bar}
      onSubmit={(event) => event.preventDefault()}
      aria-label={t('care.filters.query')}
    >
      <TextField
        label={t('care.filters.query')}
        value={values.q ?? ''}
        onChange={(event) => onQueryChange(event.target.value)}
      />
      <SelectField
        label={t('care.filters.specialty')}
        value={values.specialty ?? ''}
        onChange={(event) => onSpecialtyChange(event.target.value as Specialty | '')}
        options={[
          { value: '', label: t('care.filters.allSpecialties') },
          ...SPECIALTIES.map((specialty) => ({
            value: specialty,
            label: t(`care.specialties.${specialty}`),
          })),
        ]}
      />
      <SelectField
        label={t('care.filters.careMode')}
        value={values.careMode ?? ''}
        onChange={(event) => onCareModeChange(event.target.value as CareMode | '')}
        options={[
          { value: '', label: t('care.filters.allCareModes') },
          ...CARE_MODES.map((mode) => ({
            value: mode,
            label: t(`care.careModes.${mode}`),
          })),
        ]}
      />
      <TextField
        label={t('care.filters.city')}
        value={values.city ?? ''}
        onChange={(event) => onCityChange(event.target.value)}
      />
      <TextField
        label={t('care.filters.minPrice')}
        type="number"
        min={0}
        value={values.minPrice ?? ''}
        onChange={(event) => onMinPriceChange(event.target.value)}
      />
      <TextField
        label={t('care.filters.maxPrice')}
        type="number"
        min={0}
        value={values.maxPrice ?? ''}
        onChange={(event) => onMaxPriceChange(event.target.value)}
      />
      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onClear}>
          {t('app.clearFilters')}
        </Button>
      </div>
    </form>
  )
}
