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
  document.documentElement.lang = locale
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
  localStorage.setItem(STORAGE_KEYS.locale, locale)
}

applyDocumentLocale(initialLng)

export default i18n
