import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { paymentsApi } from '@/features/payments/api/paymentsApi'
import { Button } from '@/shared/components/Button/Button'
import { Spinner } from '@/shared/components/Spinner/Spinner'
import { StateMessage } from '@/shared/components/StateMessage/StateMessage'
import { config } from '@/shared/config/env'
import { QUERY_KEYS } from '@/shared/constants/queryKeys'
import styles from '@/features/platform/pages/Platform.module.scss'

export function PaymentsPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [amount, setAmount] = useState(299)
  const [currency, setCurrency] = useState('SAR')
  const [method, setMethod] = useState('stripe')
  const [subscription, setSubscription] = useState(false)
  const [lastInvoice, setLastInvoice] = useState<string>('')

  const paymentsQuery = useQuery({
    queryKey: QUERY_KEYS.payments.mine,
    queryFn: paymentsApi.mine,
  })
  const cardsQuery = useQuery({
    queryKey: QUERY_KEYS.payments.cards,
    queryFn: paymentsApi.cards,
  })

  const checkoutMutation = useMutation({
    mutationFn: () =>
      paymentsApi.checkout({
        amount,
        currency,
        method,
        subscription,
      }),
    onSuccess: async (result) => {
      setLastInvoice(
        t('payments.checkoutResult', {
          invoice: result.payment.invoiceNumber,
          mode: result.mode,
          wallets: result.wallets.join(', '),
        }),
      )
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.payments.mine })
    },
  })

  const refundMutation = useMutation({
    mutationFn: (id: string) => paymentsApi.refund(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.payments.mine })
    },
  })

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>{t('platform.payments')}</p>
        <h1>{t('payments.title')}</h1>
        <p>{t('payments.subtitle')}</p>
      </header>

      <div className={styles.grid2}>
        <div className={styles.panel}>
          <h2>{t('payments.checkout')}</h2>
          <p className={styles.muted}>
            {config.stripePublishableKey
              ? t('payments.stripeReady')
              : t('payments.stripeMock')}
          </p>
          <div className={styles.grid}>
            <label>
              <span className={styles.muted}>{t('payments.amount')}</span>
              <input
                className={styles.input}
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </label>
            <label>
              <span className={styles.muted}>{t('payments.currency')}</span>
              <select
                className={styles.select}
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="SAR">SAR</option>
                <option value="AED">AED</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </label>
            <label>
              <span className={styles.muted}>{t('payments.method')}</span>
              <select className={styles.select} value={method} onChange={(e) => setMethod(e.target.value)}>
                <option value="stripe">Stripe</option>
                <option value="apple_pay">Apple Pay</option>
                <option value="google_pay">Google Pay</option>
                <option value="paypal">PayPal</option>
                <option value="card">Saved card</option>
              </select>
            </label>
            <label>
              <input
                type="checkbox"
                checked={subscription}
                onChange={(e) => setSubscription(e.target.checked)}
              />{' '}
              {t('payments.subscription')}
            </label>
            <Button
              type="button"
              disabled={checkoutMutation.isPending}
              onClick={() => checkoutMutation.mutate()}
            >
              {t('payments.pay')}
            </Button>
            {lastInvoice ? <p>{lastInvoice}</p> : null}
            {checkoutMutation.isError ? <StateMessage tone="error" title={t('errors.generic')} /> : null}
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.panel}>
            <h3>{t('payments.savedCards')}</h3>
            {cardsQuery.isLoading ? <Spinner /> : null}
            <ul className={styles.list}>
              {cardsQuery.data?.map((card) => (
                <li key={card.id} className={styles.listItem}>
                  <span>
                    {card.brand.toUpperCase()} ······ {card.last4}
                  </span>
                  <span>
                    {card.expMonth}/{card.expYear}
                    {card.isDefault ? ` · ${t('payments.default')}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.panel}>
            <h3>{t('payments.history')}</h3>
            {paymentsQuery.isLoading ? <Spinner /> : null}
            <ul className={styles.list}>
              {paymentsQuery.data?.map((p) => (
                <li key={p.id} className={styles.listItem}>
                  <div>
                    <strong>
                      {p.invoiceNumber} · {p.amount} {p.currency}
                    </strong>
                    <div className={styles.muted}>
                      {p.method} · {p.status}
                    </div>
                  </div>
                  {p.status === 'succeeded' ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => refundMutation.mutate(p.id)}
                    >
                      {t('payments.refund')}
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
