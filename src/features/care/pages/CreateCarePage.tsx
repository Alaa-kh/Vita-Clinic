import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useCreateCare } from '@/features/care/hooks/useCreateCare'
import {
  createCareSchema,
  type CreateCareFormValues,
} from '@/features/care/utils/careSchemas'
import { Button } from '@/shared/components/Button/Button'
import { SelectField } from '@/shared/components/SelectField/SelectField'
import { TextField } from '@/shared/components/TextField/TextField'
import styles from '@/features/care/pages/CreateCarePage.module.scss'

const SPECIALTIES = [
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
] as const

const CARE_MODES = ['in_person', 'telehealth', 'home_visit'] as const

function splitCommaList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function CreateCarePage() {
  const { t } = useTranslation()
  const { createCare, isPending, errorKey } = useCreateCare()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCareFormValues>({
    resolver: zodResolver(createCareSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      currency: 'USD',
      careMode: 'in_person',
      specialty: 'general',
      experienceYears: 5,
      languages: 'English',
      city: '',
      country: '',
      clinicName: '',
      address: '',
      imageUrl: '',
      tags: '',
      featured: false,
    },
  })

  return (
    <div className={`container page ${styles.page}`}>
      <header className={styles.header}>
        <h1>{t('care.createTitle')}</h1>
        <p>{t('care.createSubtitle')}</p>
      </header>

      <form
        className={styles.form}
        onSubmit={handleSubmit(async (values) => {
          await createCare({
            title: values.title,
            description: values.description,
            price: values.price,
            currency: values.currency,
            careMode: values.careMode,
            specialty: values.specialty,
            experienceYears: values.experienceYears,
            languages: splitCommaList(values.languages),
            city: values.city,
            country: values.country,
            clinicName: values.clinicName,
            address: values.address,
            images: values.imageUrl ? [values.imageUrl] : [],
            tags: splitCommaList(values.tags),
            featured: values.featured,
          })
        })}
        noValidate
      >
        <TextField
          label={t('care.form.title')}
          error={errors.title ? t('validation.required') : undefined}
          {...register('title')}
        />
        <label className={styles.textareaField}>
          <span>{t('care.form.description')}</span>
          <textarea rows={5} {...register('description')} />
          {errors.description ? <em>{t('validation.required')}</em> : null}
        </label>
        <div className={styles.row}>
          <TextField
            label={t('care.form.price')}
            type="number"
            error={errors.price ? t('validation.pricePositive') : undefined}
            {...register('price')}
          />
          <SelectField
            label={t('care.form.currency')}
            options={[
              { value: 'USD', label: 'USD' },
              { value: 'AED', label: 'AED' },
              { value: 'SAR', label: 'SAR' },
              { value: 'EUR', label: 'EUR' },
            ]}
            {...register('currency')}
          />
        </div>
        <div className={styles.row}>
          <SelectField
            label={t('care.form.careMode')}
            options={CARE_MODES.map((mode) => ({
              value: mode,
              label: t(`care.careModes.${mode}`),
            }))}
            {...register('careMode')}
          />
          <SelectField
            label={t('care.form.specialty')}
            options={SPECIALTIES.map((specialty) => ({
              value: specialty,
              label: t(`care.specialties.${specialty}`),
            }))}
            {...register('specialty')}
          />
        </div>
        <div className={styles.row}>
          <TextField
            label={t('care.form.experienceYears')}
            type="number"
            error={errors.experienceYears ? t('validation.required') : undefined}
            {...register('experienceYears')}
          />
          <TextField
            label={t('care.form.languages')}
            placeholder={t('care.form.languagesHint')}
            error={errors.languages ? t('validation.required') : undefined}
            {...register('languages')}
          />
        </div>
        <div className={styles.row}>
          <TextField
            label={t('care.form.clinicName')}
            error={errors.clinicName ? t('validation.required') : undefined}
            {...register('clinicName')}
          />
          <TextField
            label={t('care.form.city')}
            error={errors.city ? t('validation.required') : undefined}
            {...register('city')}
          />
        </div>
        <div className={styles.row}>
          <TextField
            label={t('care.form.country')}
            error={errors.country ? t('validation.required') : undefined}
            {...register('country')}
          />
          <TextField
            label={t('care.form.address')}
            error={errors.address ? t('validation.required') : undefined}
            {...register('address')}
          />
        </div>
        <TextField
          label={t('care.form.imageUrl')}
          type="url"
          {...register('imageUrl')}
        />
        <TextField
          label={t('care.form.tags')}
          placeholder={t('care.form.tagsHint')}
          {...register('tags')}
        />
        <label className={styles.checkbox}>
          <input type="checkbox" {...register('featured')} />
          <span>{t('care.form.featured')}</span>
        </label>

        {errorKey ? <p className={styles.error}>{t(errorKey)}</p> : null}

        <Button type="submit" disabled={isPending}>
          {t('care.createSubmit')}
        </Button>
      </form>
    </div>
  )
}
