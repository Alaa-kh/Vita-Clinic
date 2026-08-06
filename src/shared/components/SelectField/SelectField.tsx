import type { SelectHTMLAttributes } from 'react'
import styles from './SelectField.module.scss'

interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: SelectOption[]
  error?: string
}

export function SelectField({
  label,
  options,
  error,
  id,
  className,
  ...props
}: SelectFieldProps) {
  const fieldId = id ?? props.name

  return (
    <label className={[styles.field, className ?? ''].filter(Boolean).join(' ')} htmlFor={fieldId}>
      <span className={styles.label}>{label}</span>
      <span className={styles.control}>
        <span className={styles.rail} aria-hidden="true" />
        <select id={fieldId} className={styles.select} aria-invalid={Boolean(error)} {...props}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className={styles.chevron} aria-hidden="true" />
      </span>
      {error ? <span className={styles.error}>{error}</span> : null}
    </label>
  )
}
