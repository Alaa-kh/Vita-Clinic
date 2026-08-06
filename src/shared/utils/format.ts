export function formatCurrency(amount: number, currency: string, locale = 'en'): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-AE', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(iso: string, locale = 'en'): string {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar' : 'en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso))
}
