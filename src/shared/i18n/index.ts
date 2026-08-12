import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { STORAGE_KEYS } from '@/shared/constants/storageKeys'
import ar from '@/shared/i18n/locales/ar.json'
import en from '@/shared/i18n/locales/en.json'

const savedLocale = localStorage.getItem(STORAGE_KEYS.locale)
const initialLng = savedLocale === 'ar' || savedLocale === 'en' ? savedLocale : 'en'

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: initialLng,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

export function applyDocumentLocale(locale: string): void {
  const normalized = locale.startsWith('ar') ? 'ar' : 'en'
  const cairo = "'Cairo', 'Segoe UI', Tahoma, sans-serif"

  document.documentElement.lang = normalized
  document.documentElement.dir = normalized === 'ar' ? 'rtl' : 'ltr'

  if (normalized === 'ar') {
    document.documentElement.style.setProperty('--font-body', cairo)
    document.documentElement.style.setProperty('--font-display', cairo)
    document.documentElement.style.setProperty('--font-mono', cairo)
    document.documentElement.style.setProperty('--font-arabic', cairo)
    if (document.body) document.body.style.fontFamily = cairo
  } else {
    document.documentElement.style.removeProperty('--font-body')
    document.documentElement.style.removeProperty('--font-display')
    document.documentElement.style.removeProperty('--font-mono')
    document.documentElement.style.removeProperty('--font-arabic')
    if (document.body) document.body.style.fontFamily = ''
  }

  localStorage.setItem(STORAGE_KEYS.locale, normalized)
}

applyDocumentLocale(initialLng)

export default i18n
