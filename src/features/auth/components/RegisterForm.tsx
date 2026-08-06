import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useRegister } from '@/features/auth/hooks/useRegister'
import {
  registerSchema,
  type RegisterFormValues,
} from '@/features/auth/utils/authSchemas'
import { Button } from '@/shared/components/Button/Button'
import { SelectField } from '@/shared/components/SelectField/SelectField'
import { TextField } from '@/shared/components/TextField/TextField'
import { ROUTES } from '@/shared/constants/routes'
import styles from '@/features/auth/components/AuthForm.module.scss'

export function RegisterForm() {
  const { t } = useTranslation()
  const { register: registerUser, isPending, errorKey } = useRegister()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      role: 'patient',
      phone: '',
    },
  })

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit(async (values) => {
        await registerUser({
          ...values,
          phone: values.phone || undefined,
        })
      })}
      noValidate
    >
      <TextField
        label={t('auth.fullName')}
        autoComplete="name"
        error={errors.fullName ? t('validation.required') : undefined}
        {...register('fullName')}
      />
      <TextField
        label={t('auth.email')}
        type="email"
        autoComplete="email"
        error={errors.email ? t('validation.email') : undefined}
        {...register('email')}
      />
      <TextField
        label={t('auth.password')}
        type="password"
        autoComplete="new-password"
        error={errors.password ? t('validation.passwordMin') : undefined}
        {...register('password')}
      />
      <TextField label={t('auth.phone')} type="tel" autoComplete="tel" {...register('phone')} />
      <SelectField
        label={t('auth.role')}
        options={[
          { value: 'patient', label: t('auth.roles.patient') },
          { value: 'provider', label: t('auth.roles.provider') },
        ]}
        {...register('role')}
      />

      {errorKey ? <p className={styles.error}>{t(errorKey)}</p> : null}

      <Button type="submit" fullWidth disabled={isPending}>
        {t('auth.submitRegister')}
      </Button>

      <p className={styles.switch}>
        {t('auth.hasAccount')} <Link to={ROUTES.login}>{t('nav.login')}</Link>
      </p>
    </form>
  )
}
