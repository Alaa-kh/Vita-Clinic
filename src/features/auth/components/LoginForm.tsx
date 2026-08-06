import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useLogin } from '@/features/auth/hooks/useLogin'
import {
  loginSchema,
  type LoginFormValues,
} from '@/features/auth/utils/authSchemas'
import { Button } from '@/shared/components/Button/Button'
import { TextField } from '@/shared/components/TextField/TextField'
import { ROUTES } from '@/shared/constants/routes'
import styles from '@/features/auth/components/AuthForm.module.scss'

export function LoginForm() {
  const { t } = useTranslation()
  const { login, isPending, errorKey } = useLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit(async (values) => {
        await login(values)
      })}
      noValidate
    >
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
        autoComplete="current-password"
        error={errors.password ? t('validation.passwordMin') : undefined}
        {...register('password')}
      />

      {errorKey ? <p className={styles.error}>{t(errorKey)}</p> : null}

      <Button type="submit" fullWidth disabled={isPending}>
        {t('auth.submitLogin')}
      </Button>

      <p className={styles.hint}>{t('auth.demoHint')}</p>
      <p className={styles.switch}>
        {t('auth.noAccount')} <Link to={ROUTES.register}>{t('nav.register')}</Link>
      </p>
    </form>
  )
}
