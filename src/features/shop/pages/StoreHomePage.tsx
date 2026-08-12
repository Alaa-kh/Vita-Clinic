import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useProductList } from '@/features/shop/hooks/useProducts'
import { Reveal } from '@/shared/components/Reveal/Reveal'
import { ProductGridSkeleton } from '@/shared/components/Skeleton/Skeleton'
import { StateMessage } from '@/shared/components/StateMessage/StateMessage'
import { ROUTES, productDetailPath } from '@/shared/constants/routes'
import { isAppError } from '@/shared/errors/AppError'
import { errorMessageKey } from '@/shared/utils/errorMessageKey'
import hero1 from '@/assets/hero/hero-1.jpg'
import hero2 from '@/assets/hero/hero-2.jpg'
import hero3 from '@/assets/hero/hero-3.jpg'
import styles from '@/features/shop/pages/Shop.module.scss'

const HERO_FRAMES = [hero1, hero2, hero3] as const

const CATEGORIES = [
  { key: 'food', titleKey: 'shop.catFood', lineKey: 'shop.catFoodLine' },
  { key: 'grocery', titleKey: 'shop.catGrocery', lineKey: 'shop.catGroceryLine' },
  { key: 'electronics', titleKey: 'shop.catElectronics', lineKey: 'shop.catElectronicsLine' },
  { key: 'fashion', titleKey: 'shop.catFashion', lineKey: 'shop.catFashionLine' },
  { key: 'pharmacy', titleKey: 'shop.catPharmacy', lineKey: 'shop.catPharmacyLine' },
  { key: 'beauty', titleKey: 'shop.catBeauty', lineKey: 'shop.catBeautyLine' },
  { key: 'home', titleKey: 'shop.catHome', lineKey: 'shop.catHomeLine' },
  { key: 'sports', titleKey: 'shop.catSports', lineKey: 'shop.catSportsLine' },
] as const

const SERVICES = [
  { key: 'delivery', titleKey: 'home.services.delivery', bodyKey: 'home.services.deliveryBody' },
  { key: 'track', titleKey: 'home.services.track', bodyKey: 'home.services.trackBody' },
  { key: 'pay', titleKey: 'home.services.pay', bodyKey: 'home.services.payBody' },
  { key: 'support', titleKey: 'home.services.support', bodyKey: 'home.services.supportBody' },
  { key: 'stores', titleKey: 'home.services.stores', bodyKey: 'home.services.storesBody' },
  { key: 'returns', titleKey: 'home.services.returns', bodyKey: 'home.services.returnsBody' },
] as const

const STEPS = [
  { key: 'browse', titleKey: 'home.steps.browse', bodyKey: 'home.steps.browseBody' },
  { key: 'checkout', titleKey: 'home.steps.checkout', bodyKey: 'home.steps.checkoutBody' },
  { key: 'track', titleKey: 'home.steps.track', bodyKey: 'home.steps.trackBody' },
  { key: 'enjoy', titleKey: 'home.steps.enjoy', bodyKey: 'home.steps.enjoyBody' },
] as const

const STORES = [
  { nameKey: 'home.stores.kitchen', cityKey: 'shop.cities.riyadh', to: `${ROUTES.shop}?category=food` },
  { nameKey: 'home.stores.mart', cityKey: 'shop.cities.jeddah', to: `${ROUTES.shop}?category=grocery` },
  { nameKey: 'home.stores.tech', cityKey: 'shop.cities.khobar', to: `${ROUTES.shop}?category=electronics` },
  { nameKey: 'home.stores.pharma', cityKey: 'shop.cities.dammam', to: `${ROUTES.shop}?category=pharmacy` },
] as const

export function StoreHomePage() {
  const { t, i18n } = useTranslation()
  const featured = useProductList({ featured: true, pageSize: 8 })
  const foodDeals = useProductList({ category: 'food', pageSize: 4 })

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroVisual} aria-hidden="true">
          {HERO_FRAMES.map((src, index) => (
            <img
              key={src}
              src={src}
              alt=""
              className={styles.heroSlide}
              style={{ animationDelay: `${index * 5.5}s` }}
              decoding={index === 0 ? 'sync' : 'async'}
            />
          ))}
        </div>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <p className={styles.liveBadge}>
              <span className={styles.stampDot} aria-hidden="true" />
              {t('home.liveStamp')}
            </p>
            <h1 className={styles.brandMark}>{t('app.name')}</h1>
            <p className={styles.subhead}>{t('home.hero.subhead')}</p>
            <div className={styles.actions}>
              <Link to={ROUTES.shop} className={styles.primaryCta}>
                {t('home.hero.ctaShop')}
              </Link>
              <Link to={ROUTES.maps} className={styles.secondaryCta}>
                {t('home.hero.ctaTrack')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={`container ${styles.section}`}>
        <Reveal className={styles.trustRow}>
          <div>
            <strong>{t('home.trust.eta')}</strong>
            <span>{t('home.trust.etaBody')}</span>
          </div>
          <div>
            <strong>{t('home.trust.stores')}</strong>
            <span>{t('home.trust.storesBody')}</span>
          </div>
          <div>
            <strong>{t('home.trust.pay')}</strong>
            <span>{t('home.trust.payBody')}</span>
          </div>
          <div>
            <strong>{t('home.trust.support')}</strong>
            <span>{t('home.trust.supportBody')}</span>
          </div>
        </Reveal>
      </section>

      <section className={`container ${styles.section}`}>
        <Reveal as="header" className={styles.sectionHeader}>
          <p className={styles.eyebrow}>{t('home.categoriesEyebrow')}</p>
          <h2>{t('home.categoriesTitle')}</h2>
          <p className={styles.muted}>{t('home.categoriesSub')}</p>
        </Reveal>
        <div className={styles.catsWide}>
          {CATEGORIES.map((cat, index) => (
            <Link
              key={cat.key}
              to={`${ROUTES.shop}?category=${cat.key}`}
              className={styles.cat}
              style={{ '--i': index } as CSSProperties}
            >
              <span className={styles.catIndex} aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <strong>{t(cat.titleKey)}</strong>
              <span>{t(cat.lineKey)}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={`container ${styles.section}`}>
        <Reveal as="header" className={styles.sectionHeader}>
          <p className={styles.eyebrow}>{t('home.servicesEyebrow')}</p>
          <h2>{t('home.servicesTitle')}</h2>
          <p className={styles.muted}>{t('home.servicesSub')}</p>
        </Reveal>
        <div className={styles.serviceGrid}>
          {SERVICES.map((service, index) => (
            <Reveal key={service.key} className={styles.serviceCard} delayMs={index * 60}>
              <strong>{t(service.titleKey)}</strong>
              <p>{t(service.bodyKey)}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className={`container ${styles.section}`}>
        <Reveal as="header" className={styles.sectionHeader}>
          <p className={styles.eyebrow}>{t('home.howEyebrow')}</p>
          <h2>{t('home.howTitle')}</h2>
          <p className={styles.muted}>{t('home.howSub')}</p>
        </Reveal>
        <div className={styles.steps}>
          {STEPS.map((step, index) => (
            <Reveal key={step.key} className={styles.step} delayMs={index * 70}>
              <span className={styles.stepNum}>{String(index + 1).padStart(2, '0')}</span>
              <strong>{t(step.titleKey)}</strong>
              <p>{t(step.bodyKey)}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className={`container ${styles.section}`}>
        <Reveal as="header" className={styles.sectionHeaderRow}>
          <div>
            <p className={styles.eyebrow}>{t('home.featuredEyebrow')}</p>
            <h2>{t('home.featuredTitle')}</h2>
            <p className={styles.muted}>{t('home.featuredSub')}</p>
          </div>
          <Link to={ROUTES.shop} className={styles.textLink}>
            {t('home.viewAll')}
          </Link>
        </Reveal>

        {featured.isLoading ? <ProductGridSkeleton count={8} /> : null}
        {featured.isError ? (
          <StateMessage
            tone="error"
            title={t(
              isAppError(featured.error)
                ? errorMessageKey(featured.error.code)
                : 'errors.generic',
            )}
            onAction={() => void featured.refetch()}
          />
        ) : null}
        {featured.isSuccess ? (
          <div className={styles.productGrid} key={`featured-${i18n.language}`}>
            {featured.data.items.map((item, index) => (
              <Link
                key={item.id}
                to={productDetailPath(item.id)}
                className={styles.productCard}
                style={{ '--i': index } as CSSProperties}
              >
                <div className={styles.productMedia}>
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = hero1
                    }}
                  />
                </div>
                <div className={styles.productBody}>
                  <h3>{item.title}</h3>
                  <p className={styles.storeLine}>{item.storeName}</p>
                  <div className={styles.productMeta}>
                    <span className={styles.eta}>
                      {item.prepMinutes} {t('shop.min')}
                    </span>
                    <span className={styles.price}>
                      {item.price} {item.currency}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      <section className={`container ${styles.section}`}>
        <Reveal as="header" className={styles.sectionHeaderRow}>
          <div>
            <p className={styles.eyebrow}>{t('home.dealsEyebrow')}</p>
            <h2>{t('home.dealsTitle')}</h2>
            <p className={styles.muted}>{t('home.dealsSub')}</p>
          </div>
          <Link to={`${ROUTES.shop}?category=food`} className={styles.textLink}>
            {t('home.viewAll')}
          </Link>
        </Reveal>
        {foodDeals.isLoading ? <ProductGridSkeleton count={4} /> : null}
        {foodDeals.isSuccess ? (
          <div className={styles.productGrid} key={`deals-${i18n.language}`}>
            {foodDeals.data.items.map((item, index) => (
              <Link
                key={item.id}
                to={productDetailPath(item.id)}
                className={styles.productCard}
                style={{ '--i': index } as CSSProperties}
              >
                <div className={styles.productMedia}>
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = hero1
                    }}
                  />
                </div>
                <div className={styles.productBody}>
                  <h3>{item.title}</h3>
                  <p className={styles.storeLine}>{item.storeName}</p>
                  <div className={styles.productMeta}>
                    <span className={styles.eta}>
                      {item.prepMinutes} {t('shop.min')}
                    </span>
                    <span className={styles.price}>
                      {item.price} {item.currency}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      <section className={`container ${styles.section}`}>
        <Reveal as="header" className={styles.sectionHeader}>
          <p className={styles.eyebrow}>{t('home.storesEyebrow')}</p>
          <h2>{t('home.storesTitle')}</h2>
          <p className={styles.muted}>{t('home.storesSub')}</p>
        </Reveal>
        <div className={styles.storeGrid}>
          {STORES.map((store, index) => (
            <Link
              key={store.nameKey}
              to={store.to}
              className={styles.storeCard}
              style={{ '--i': index } as CSSProperties}
            >
              <strong>{t(store.nameKey)}</strong>
              <span>{t(store.cityKey)}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.strip}>
        <div className={`container ${styles.stripInner}`}>
          <div>
            <p className={styles.eyebrowLight}>{t('app.name')}</p>
            <h2>{t('home.deliveryTitle')}</h2>
            <p className={styles.stripMuted}>{t('home.deliveryBody')}</p>
          </div>
          <Link to={ROUTES.shop} className={styles.primaryCta}>
            {t('home.deliveryCta')}
          </Link>
        </div>
      </section>
    </div>
  )
}
