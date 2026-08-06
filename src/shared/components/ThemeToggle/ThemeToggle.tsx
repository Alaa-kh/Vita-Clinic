import { useTranslation } from 'react-i18next'
import { useTheme } from '@/shared/theme/ThemeProvider'
import styles from '@/shared/components/ThemeToggle/ThemeToggle.module.scss'

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
      <circle cx="12" cy="12" r="4.2" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 2.5v2.2" />
        <path d="M12 19.3v2.2" />
        <path d="M2.5 12h2.2" />
        <path d="M19.3 12h2.2" />
        <path d="M5.1 5.1l1.6 1.6" />
        <path d="M17.3 17.3l1.6 1.6" />
        <path d="M17.3 5.1l1.6-1.6" transform="rotate(90 18.1 4.3)" />
        <path d="M5.1 18.9l1.6-1.6" />
      </g>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
      <path
        fill="currentColor"
        d="M19.5 14.2A7.8 7.8 0 0 1 9.8 4.5a7.9 7.9 0 1 0 9.7 9.7Z"
      />
    </svg>
  )
}

export function ThemeToggle() {
  const { t } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const isLight = theme === 'light'

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggleTheme}
      aria-label={isLight ? t('theme.toDark') : t('theme.toLight')}
      title={isLight ? t('theme.toDark') : t('theme.toLight')}
    >
      <span className={styles.iconWrap} key={theme}>
        {isLight ? <MoonIcon /> : <SunIcon />}
      </span>
    </button>
  )
}
