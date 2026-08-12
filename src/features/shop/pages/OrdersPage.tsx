import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useOrders } from '@/features/shop/hooks/useCart'
import { Spinner } from '@/shared/components/Spinner/Spinner'
import { StateMessage } from '@/shared/components/StateMessage/StateMessage'
import { trackOrderPath } from '@/shared/constants/routes'
import styles from '@/features/shop/pages/Shop.module.scss'

export function OrdersPage() {
  const { t } = useTranslation()
  const ordersQuery = useOrders()

  if (ordersQuery.isLoading) return <Spinner />
  if (ordersQuery.isError) return <StateMessage tone="error" title={t('errors.generic')} />

  return (
    <div className={`container ${styles.page}`} style={{ paddingTop: '2rem' }}>
      <header>
        <p className={styles.eyebrow}>{t('orders.eyebrow')}</p>
        <h1>{t('orders.title')}</h1>
      </header>

      {!ordersQuery.data?.length ? <StateMessage title={t('orders.empty')} /> : null}

      <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1.25rem' }}>
        {ordersQuery.data?.map((order) => (
          <div key={order.id} className={styles.line} style={{ gridTemplateColumns: '1fr auto' }}>
            <div>
              <strong>
                #{order.id.slice(0, 8)} · {order.status}
              </strong>
              <div className={styles.muted}>
                {order.items.map((i) => `${i.title}×${i.quantity}`).join(', ')}
              </div>
              <div className={styles.muted}>
                ETA {order.etaMinutes} {t('shop.min')} · {order.total} {order.currency}
              </div>
            </div>
            <Link to={trackOrderPath(order.id)} className={styles.primaryCta}>
              {t('orders.track')}
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
