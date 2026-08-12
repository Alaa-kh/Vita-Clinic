import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useProductList } from '@/features/shop/hooks/useProducts'
import type { ProductCategory } from '@/features/shop/types/product'
import { Button } from '@/shared/components/Button/Button'
import { Reveal } from '@/shared/components/Reveal/Reveal'
import { ProductGridSkeleton } from '@/shared/components/Skeleton/Skeleton'
import { StateMessage } from '@/shared/components/StateMessage/StateMessage'
import { productDetailPath } from '@/shared/constants/routes'
import styles from '@/features/shop/pages/Shop.module.scss'

const CATEGORIES: Array<ProductCategory | ''> = [
  '',
  'food',
  'grocery',
  'electronics',
  'fashion',
  'pharmacy',
  'home',
  'beauty',
  'sports',
]

const CITIES = [
  { value: 'Riyadh', labelKey: 'shop.cities.riyadh' },
  { value: 'Jeddah', labelKey: 'shop.cities.jeddah' },
  { value: 'Khobar', labelKey: 'shop.cities.khobar' },
  { value: 'Dammam', labelKey: 'shop.cities.dammam' },
] as const

const PAGE_SIZE = 12

export function ShopPage() {
  const { t, i18n } = useTranslation()
  const [params, setParams] = useSearchParams()
  const qParam = params.get('q') ?? ''
  const category = (params.get('category') ?? '') as ProductCategory | ''
  const city = params.get('city') ?? ''
  const page = Math.max(1, Number(params.get('page') ?? '1') || 1)
  const [qDraft, setQDraft] = useState(qParam)

  useEffect(() => {
    setQDraft(qParam)
  }, [qParam])

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = new URLSearchParams(params)
      const trimmed = qDraft.trim()
      if (trimmed) next.set('q', trimmed)
      else next.delete('q')
      if ((params.get('q') ?? '') !== trimmed) {
        next.delete('page')
      }
      if (next.toString() !== params.toString()) setParams(next, { replace: true })
    }, 320)
    return () => window.clearTimeout(handle)
  }, [qDraft, params, setParams])

  const filters = useMemo(
    () => ({
      q: qParam || undefined,
      category: category || undefined,
      city: city || undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    [qParam, category, city, page],
  )

  const list = useProductList(filters)

  const patchParams = (mutate: (next: URLSearchParams) => void) => {
    const next = new URLSearchParams(params)
    mutate(next)
    setParams(next)
  }

  return (
    <div className={`container ${styles.page}`} style={{ paddingTop: '2rem' }}>
      <Reveal as="header" className={styles.shopIntro}>
        <p className={styles.eyebrow}>{t('shop.eyebrow')}</p>
        <h1>{t('shop.title')}</h1>
        <p className={styles.muted}>{t('shop.subtitle')}</p>
      </Reveal>

      <Reveal className={styles.filterDock} delayMs={80}>
        <div className={styles.filterSearch}>
          <label className={styles.filterLabel} htmlFor="shop-search">
            {t('shop.search')}
          </label>
          <input
            id="shop-search"
            className={styles.filterInput}
            value={qDraft}
            placeholder={t('shop.searchHint')}
            onChange={(e) => setQDraft(e.target.value)}
          />
        </div>

        <div className={styles.filterChips} role="list">
          {CATEGORIES.map((c) => {
            const active = category === c
            return (
              <button
                key={c || 'all'}
                type="button"
                role="listitem"
                className={`${styles.filterChip} ${active ? styles.filterChipActive : ''}`}
                onClick={() =>
                  patchParams((next) => {
                    if (c) next.set('category', c)
                    else next.delete('category')
                    next.delete('page')
                  })
                }
              >
                {c ? t(`shop.categories.${c}`) : t('shop.allCategories')}
              </button>
            )
          })}
        </div>

        <div className={styles.filterRow}>
          <label className={styles.filterField}>
            <span>{t('shop.city')}</span>
            <select
              className={styles.filterSelect}
              value={city}
              onChange={(e) =>
                patchParams((next) => {
                  if (e.target.value) next.set('city', e.target.value)
                  else next.delete('city')
                  next.delete('page')
                })
              }
            >
              <option value="">{t('shop.allCities')}</option>
              {CITIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {t(item.labelKey)}
                </option>
              ))}
            </select>
          </label>

          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setQDraft('')
              setParams(new URLSearchParams())
            }}
          >
            {t('app.clearFilters')}
          </Button>
        </div>
      </Reveal>

      {list.isLoading ? <ProductGridSkeleton count={12} /> : null}
      {list.isError ? <StateMessage tone="error" title={t('errors.generic')} /> : null}
      {list.isSuccess && list.data.items.length === 0 ? (
        <StateMessage title={t('shop.empty')} />
      ) : null}

      {list.isSuccess ? (
        <>
          <p className={styles.resultMeta}>
            {t('shop.results', { count: list.data.pagination.total })}
          </p>
          <div className={styles.grid} key={`${i18n.language}-${page}-${category}-${city}-${qParam}`}>
            {list.data.items.map((item, index) => (
              <Link
                key={item.id}
                to={productDetailPath(item.id)}
                className={styles.card}
                style={{ animationDelay: `${index * 45}ms` }}
              >
                <div className={styles.cardMedia}>
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.pexels.com/photos/4393021/pexels-photo-4393021.jpeg?auto=compress&cs=tinysrgb&w=800'
                    }}
                  />
                </div>
                <div className={styles.cardBody}>
                  <h3>{item.title}</h3>
                  <p className={styles.storeLine}>{item.storeName}</p>
                  <div className={styles.meta}>
                    <span>
                      ★ {item.rating} · {item.prepMinutes} {t('shop.min')}
                    </span>
                    <span className={styles.price}>
                      {item.price} {item.currency}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {list.data.pagination.totalPages > 1 ? (
            <div className={styles.pagination}>
              <Button
                type="button"
                variant="secondary"
                disabled={list.data.pagination.page <= 1}
                onClick={() =>
                  patchParams((next) => {
                    next.set('page', String(list.data.pagination.page - 1))
                  })
                }
              >
                {t('app.back')}
              </Button>
              <span>
                {list.data.pagination.page} / {list.data.pagination.totalPages}
              </span>
              <Button
                type="button"
                variant="secondary"
                disabled={list.data.pagination.page >= list.data.pagination.totalPages}
                onClick={() =>
                  patchParams((next) => {
                    next.set('page', String(list.data.pagination.page + 1))
                  })
                }
              >
                {t('app.next')}
              </Button>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
