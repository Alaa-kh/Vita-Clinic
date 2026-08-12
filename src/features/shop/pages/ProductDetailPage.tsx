import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAddToCart } from '@/features/shop/hooks/useCart'
import { useProduct } from '@/features/shop/hooks/useProducts'
import { Button } from '@/shared/components/Button/Button'
import { Spinner } from '@/shared/components/Spinner/Spinner'
import { StateMessage } from '@/shared/components/StateMessage/StateMessage'
import { ROUTES } from '@/shared/constants/routes'
import { isAppError } from '@/shared/errors/AppError'
import { errorMessageKey } from '@/shared/utils/errorMessageKey'
import styles from '@/features/shop/pages/Shop.module.scss'

export function ProductDetailPage() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  const productQuery = useProduct(id)
  const addToCart = useAddToCart()

  if (productQuery.isLoading) return <Spinner />
  if (productQuery.isError || !productQuery.data) {
    return <StateMessage tone="error" title={t('errors.notFound')} />
  }

  const product = productQuery.data

  return (
    <div className={`container ${styles.page}`} style={{ paddingTop: '2rem' }}>
      <div className={styles.cartLayout}>
        <div className={styles.card} style={{ gridTemplateRows: '320px auto' }}>
          <img
            src={product.images[0]}
            alt={product.title}
            onError={(e) => {
              e.currentTarget.src =
                'https://images.pexels.com/photos/4393021/pexels-photo-4393021.jpeg?auto=compress&cs=tinysrgb&w=1200'
            }}
          />
          <div className={styles.cardBody}>
            <p className={styles.eyebrow}>{t(`shop.categories.${product.category}`)}</p>
            <h1>{product.title}</h1>
            <p className={styles.muted}>{product.description}</p>
            <div className={styles.meta}>
              <span>
                {product.storeName} · {product.city}
              </span>
              <span className={styles.price}>
                {product.price} {product.currency}
              </span>
            </div>
            <p className={styles.muted}>
              {t('shop.etaPrep', { min: product.prepMinutes })} · ★ {product.rating} ·{' '}
              {t(`shop.fulfillment.${product.fulfillment}`)}
            </p>
            <div className={styles.actions}>
              <Button
                type="button"
                disabled={addToCart.isPending || product.status === 'out_of_stock'}
                onClick={() =>
                  addToCart.mutate({ productId: product.id, product })
                }
              >
                {t('shop.addToCart')}
              </Button>
              <Link to={ROUTES.cart} className={styles.secondaryCta} style={{ color: 'inherit' }}>
                {t('shop.viewCart')}
              </Link>
            </div>
            {addToCart.isSuccess ? <p className={styles.eta}>{t('shop.added')}</p> : null}
            {addToCart.isError ? (
              <p className={styles.muted} role="alert">
                {t(
                  isAppError(addToCart.error)
                    ? errorMessageKey(addToCart.error.code)
                    : 'errors.generic',
                )}
              </p>
            ) : null}
          </div>
        </div>
        <aside className={styles.panel}>
          <h2>{t('shop.deliveryInfo')}</h2>
          <p className={styles.muted}>{t('shop.deliveryInfoBody')}</p>
          <ul className={styles.muted}>
            <li>{product.address}</li>
            <li>
              {product.stock} {t('shop.inStock')}
            </li>
            <li>{product.tags.join(' · ')}</li>
          </ul>
        </aside>
      </div>
    </div>
  )
}
