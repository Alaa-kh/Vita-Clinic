import { useId, useState, type InputHTMLAttributes } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './TextField.module.scss'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function TextField({
  label,
  error,
  id,
  className,
  type = 'text',
  ...props
}: TextFieldProps) {
  const { t } = useTranslation()
  const generatedId = useId()
  const fieldId = id ?? props.name ?? generatedId
  const isPassword = type === 'password'
  const [visible, setVisible] = useState(false)
  const inputType = isPassword ? (visible ? 'text' : 'password') : type

  return (
    <label className={[styles.field, className ?? ''].filter(Boolean).join(' ')} htmlFor={fieldId}>
      <span className={styles.label}>{label}</span>
      <span className={`${styles.control} ${isPassword ? styles.controlPassword : ''}`}>
        <span className={styles.rail} aria-hidden="true" />
        <input
          id={fieldId}
          className={styles.input}
          type={inputType}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {isPassword ? (
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? t('auth.hidePassword') : t('auth.showPassword')}
            aria-pressed={visible}
          >
            {visible ? (
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
                <path
                  fill="currentColor"
                  d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
                />
                <path
                  fill="currentColor"
                  d="M3.3 3.3a1 1 0 0 1 1.4 0l16 16a1 1 0 1 1-1.4 1.4l-16-16a1 1 0 0 1 0-1.4Z"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
                <path
                  fill="currentColor"
                  d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
                />
              </svg>
            )}
          </button>
        ) : null}
      </span>
      {error ? <span className={styles.error}>{error}</span> : null}
    </label>
  )
}
