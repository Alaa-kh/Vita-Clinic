import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCart, useCheckout } from '@/features/shop/hooks/useCart'
import { Button } from '@/shared/components/Button/Button'
import { Spinner } from '@/shared/components/Spinner/Spinner'
import { StateMessage } from '@/shared/components/StateMessage/StateMessage'
import { ROUTES, trackOrderPath } from '@/shared/constants/routes'
import styles from '@/features/shop/pages/Shop.module.scss'

export function CheckoutPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const cartQuery = useCart()
  const checkout = useCheckout()
  const [address, setAddress] = useState('King Fahd Rd, Riyadh')
  const [city, setCity] = useState('Riyadh')
  const [notes, setNotes] = useState('')
  const [method, setMethod] = useState('stripe')

  if (cartQuery.isLoading) return <Spinner />
  if (!cartQuery.data?.items.length) {
    return (
      <div className={`container ${styles.page}`} style={{ paddingTop: '2rem' }}>
        <StateMessage title={t('cart.empty')} />
        <Link to={ROUTES.shop}>{t('shop.title')}</Link>
      </div>
    )
  }

  return (
    <div className={`container ${styles.page}`} style={{ paddingTop: '2rem' }}>
      <header>
        <p className={styles.eyebrow}>{t('checkout.eyebrow')}</p>
        <h1>{t('checkout.title')}</h1>
      </header>

      <div className={styles.cartLayout}>
        <div className={styles.panel}>
          <label>
            <span className={styles.muted}>{t('checkout.address')}</span>
            <input className={styles.input} value={address} onChange={(e) => setAddress(e.target.value)} />
          </label>
          <label style={{ display: 'block', marginTop: '1rem' }}>
            <span className={styles.muted}>{t('checkout.city')}</span>
            <input className={styles.input} value={city} onChange={(e) => setCity(e.target.value)} />
          </label>
          <label style={{ display: 'block', marginTop: '1rem' }}>
            <span className={styles.muted}>{t('checkout.notes')}</span>
            <input className={styles.input} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
          <label style={{ display: 'block', marginTop: '1rem' }}>
            <span className={styles.muted}>{t('checkout.payment')}</span>
            <select className={styles.select} value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="stripe">Stripe</option>
              <option value="apple_pay">Apple Pay</option>
              <option value="google_pay">Google Pay</option>
              <option value="paypal">PayPal</option>
              <option value="card">Saved card</option>
            </select>
          </label>
          <div style={{ marginTop: '1.25rem' }}>
            <Button
              type="button"
              disabled={checkout.isPending}
              onClick={() =>
                checkout.mutate(
                  {
                    deliveryAddress: address,
                    city,
                    notes: notes || undefined,
                    paymentMethod: method,
                  },
                  {
                    onSuccess: (result) => {
                      void navigate(trackOrderPath(result.order.id))
                    },
                  },
                )
              }
            >
              {t('checkout.placeOrder')}
            </Button>
          </div>
          {checkout.isError ? <StateMessage tone="error" title={t('errors.generic')} /> : null}
        </div>

        <aside className={styles.panel}>
          <h2>{t('cart.summary')}</h2>
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '0.5rem' }}>
            {cartQuery.data.items.map((line) => (
              <li key={line.productId} className={styles.meta}>
                <span>
                  {line.title} × {line.quantity}
                </span>
                <span>
                  {line.lineTotal} {line.currency}
                </span>
              </li>
            ))}
          </ul>
          <p>
            <strong>
              {cartQuery.data.subtotal} {cartQuery.data.currency}
            </strong>{' '}
            + {t('checkout.deliveryFee')}
          </p>
        </aside>
      </div>
    </div>
  )
}
