import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useCart, useUpdateCartItem } from '@/features/shop/hooks/useCart'
import { Button } from '@/shared/components/Button/Button'
import { Spinner } from '@/shared/components/Spinner/Spinner'
import { StateMessage } from '@/shared/components/StateMessage/StateMessage'
import { ROUTES } from '@/shared/constants/routes'
import styles from '@/features/shop/pages/Shop.module.scss'

export function CartPage() {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const cartQuery = useCart()
  const updateItem = useUpdateCartItem()

  if (cartQuery.isLoading) return <Spinner />
  if (cartQuery.isError || !cartQuery.data) {
    return <StateMessage tone="error" title={t('errors.generic')} />
  }

  const cart = cartQuery.data
  const checkoutTo = isAuthenticated
    ? ROUTES.checkout
    : `${ROUTES.login}?next=${encodeURIComponent(ROUTES.checkout)}`

  return (
    <div className={`container ${styles.page}`} style={{ paddingTop: '2rem' }}>
      <header>
        <p className={styles.eyebrow}>{t('cart.eyebrow')}</p>
        <h1>{t('cart.title')}</h1>
      </header>

      {cart.items.length === 0 ? (
        <StateMessage title={t('cart.empty')} />
      ) : (
        <div className={styles.cartLayout}>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {cart.items.map((line) => (
              <div key={line.productId} className={styles.line}>
                {line.image ? <img src={line.image} alt="" /> : <div />}
                <div>
                  <strong>{line.title}</strong>
                  <div className={styles.muted}>
                    {line.storeName} · {line.price} {line.currency}
                  </div>
                </div>
                <div style={{ display: 'grid', gap: '0.5rem', justifyItems: 'end' }}>
                  <span className={styles.price}>
                    {line.lineTotal} {line.currency}
                  </span>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        updateItem.mutate({
                          productId: line.productId,
                          quantity: line.quantity - 1,
                        })
                      }
                    >
                      −
                    </Button>
                    <span>{line.quantity}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        updateItem.mutate({
                          productId: line.productId,
                          quantity: line.quantity + 1,
                        })
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className={styles.panel}>
            <h2>{t('cart.summary')}</h2>
            <p>
              {t('cart.subtotal')}:{' '}
              <strong>
                {cart.subtotal} {cart.currency}
              </strong>
            </p>
            <p className={styles.muted}>{t('cart.items', { count: cart.itemCount })}</p>
            {!isAuthenticated ? (
              <p className={styles.muted}>{t('cart.loginToCheckout')}</p>
            ) : null}
            <Link to={checkoutTo} className={styles.primaryCta}>
              {isAuthenticated ? t('cart.checkout') : t('cart.signInCheckout')}
            </Link>
          </aside>
        </div>
      )}
    </div>
  )
}
