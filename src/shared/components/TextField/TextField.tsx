import type { InputHTMLAttributes } from 'react'
import styles from './TextField.module.scss'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function TextField({ label, error, id, className, ...props }: TextFieldProps) {
  const fieldId = id ?? props.name

  return (
    <label className={[styles.field, className ?? ''].filter(Boolean).join(' ')} htmlFor={fieldId}>
      <span className={styles.label}>{label}</span>
      <span className={styles.control}>
        <span className={styles.rail} aria-hidden="true" />
        <input id={fieldId} className={styles.input} aria-invalid={Boolean(error)} {...props} />
      </span>
      {error ? <span className={styles.error}>{error}</span> : null}
    </label>
  )
}
