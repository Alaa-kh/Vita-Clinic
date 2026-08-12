import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useAuthBootstrap } from '@/features/auth/hooks/useAuthBootstrap'
import { useCart } from '@/features/shop/hooks/useCart'
import { BrandMark } from '@/shared/components/BrandMark/BrandMark'
import { Button } from '@/shared/components/Button/Button'
import { Dialog } from '@/shared/components/Dialog/Dialog'
import { NavigationLoaderBridge } from '@/shared/components/PageLoader/NavigationLoaderBridge'
import { PageLoader, RouteProgress } from '@/shared/components/PageLoader/PageLoader'
import { ThemeToggle } from '@/shared/components/ThemeToggle/ThemeToggle'
import { ROUTES } from '@/shared/constants/routes'
import { applyDocumentLocale } from '@/shared/i18n'
import styles from '@/app/layouts/MainLayout.module.scss'

export function MainLayout() {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const { isAuthenticated, logout, bootstrapped, status } = useAuth()
  const cartQuery = useCart()
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useAuthBootstrap()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const switchLocale = () => {
    const next = i18n.language === 'ar' ? 'en' : 'ar'
    void i18n.changeLanguage(next)
    applyDocumentLocale(next)
  }

  if (!bootstrapped || status === 'hydrating') {
    return <PageLoader fullscreen />
  }

  const cartCount = cartQuery.data?.itemCount ?? 0

  return (
    <div className={styles.shell}>
      <RouteProgress />
      <NavigationLoaderBridge />
      <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}>
        <div className={`container ${styles.headerInner}`}>
          <NavLink to={ROUTES.home} className={styles.brand}>
            <span className={styles.brandMark} aria-hidden="true">
              <BrandMark />
            </span>
            <span className={styles.brandText}>
              <strong>{t('app.name')}</strong>
              <small>{t('header.brandLine')}</small>
            </span>
          </NavLink>

          <nav className={styles.navDesktop} aria-label="Main">
            <div className={styles.navPill}>
              <NavLink to={ROUTES.home} end>
                {t('nav.home')}
              </NavLink>
              <NavLink to={ROUTES.shop}>{t('nav.shop')}</NavLink>
              <NavLink to={ROUTES.maps}>{t('nav.track')}</NavLink>
              <NavLink to={ROUTES.platform}>{t('nav.platform')}</NavLink>
              {isAuthenticated ? <NavLink to={ROUTES.orders}>{t('nav.orders')}</NavLink> : null}
            </div>
          </nav>

          <div className={styles.actions}>
            <div className={styles.actionsDesktop}>
              <div className={styles.utility}>
                <ThemeToggle />
                <button type="button" className={styles.langButton} onClick={switchLocale}>
                  {i18n.language === 'ar' ? t('app.english') : t('app.arabic')}
                </button>
              </div>

              <NavLink to={ROUTES.cart} className={styles.cartLink}>
                {t('nav.cart')}
                {cartCount > 0 ? <span className={styles.cartBadge}>{cartCount}</span> : null}
              </NavLink>

              {isAuthenticated ? (
                <NavLink to={ROUTES.profile} className={styles.accountLink}>
                  {t('nav.profile')}
                </NavLink>
              ) : (
                <NavLink to={ROUTES.login} className={styles.accountLink}>
                  {t('nav.login')}
                </NavLink>
              )}

              <NavLink to={ROUTES.shop} className={styles.bookCta}>
                <span>{t('header.shopNow')}</span>
                <span className={styles.ctaBolt} aria-hidden="true">
                  ⚡
                </span>
              </NavLink>
            </div>

            <button
              type="button"
              className={styles.menuToggle}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? t('app.closeMenu') : t('app.openMenu')}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className={menuOpen ? styles.menuIconOpen : styles.menuIcon} />
            </button>
          </div>
        </div>

        <div
          id="mobile-menu"
          className={[styles.mobileMenu, menuOpen ? styles.mobileMenuOpen : ''].join(' ')}
        >
          <nav className={styles.mobileNav} aria-label="Mobile">
            <NavLink to={ROUTES.home} end onClick={() => setMenuOpen(false)}>
              {t('nav.home')}
            </NavLink>
            <NavLink to={ROUTES.shop} onClick={() => setMenuOpen(false)}>
              {t('nav.shop')}
            </NavLink>
            <NavLink to={ROUTES.maps} onClick={() => setMenuOpen(false)}>
              {t('nav.track')}
            </NavLink>
            <NavLink to={ROUTES.platform} onClick={() => setMenuOpen(false)}>
              {t('nav.platform')}
            </NavLink>
            <NavLink to={ROUTES.cart} onClick={() => setMenuOpen(false)}>
              {t('nav.cart')}
            </NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to={ROUTES.orders} onClick={() => setMenuOpen(false)}>
                  {t('nav.orders')}
                </NavLink>
                <NavLink to={ROUTES.profile} onClick={() => setMenuOpen(false)}>
                  {t('nav.profile')}
                </NavLink>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    setLogoutOpen(true)
                  }}
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <NavLink to={ROUTES.login} onClick={() => setMenuOpen(false)}>
                {t('nav.login')}
              </NavLink>
            )}
            <div className={styles.mobileUtils}>
              <ThemeToggle />
              <button type="button" className={styles.langButton} onClick={switchLocale}>
                {i18n.language === 'ar' ? t('app.english') : t('app.arabic')}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {menuOpen ? (
        <button
          type="button"
          className={styles.menuBackdrop}
          aria-label={t('app.closeMenu')}
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <main key={location.pathname} className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <div className={`container ${styles.footerGrid}`}>
          <div className={styles.footerBrand}>
            <strong>{t('app.name')}</strong>
            <p>{t('footer.blurb')}</p>
          </div>
          <div>
            <h3>{t('footer.explore')}</h3>
            <NavLink to={ROUTES.shop}>{t('nav.shop')}</NavLink>
            <NavLink to={ROUTES.maps}>{t('nav.track')}</NavLink>
            <NavLink to={ROUTES.platform}>{t('nav.platform')}</NavLink>
          </div>
          <div>
            <h3>{t('footer.company')}</h3>
            <NavLink to={ROUTES.orders}>{t('nav.orders')}</NavLink>
            <NavLink to={ROUTES.payments}>{t('platform.payments')}</NavLink>
          </div>
          <div>
            <h3>{t('footer.contact')}</h3>
            <p>{t('footer.email')}</p>
            <p>{t('footer.phone')}</p>
          </div>
        </div>
        <div className={`container ${styles.footerBottom}`}>
          <span>{t('footer.rights', { year: new Date().getFullYear() })}</span>
          <span>{t('app.tagline')}</span>
        </div>
      </footer>

      <Dialog
        open={logoutOpen}
        title={t('dialog.logoutTitle')}
        description={t('dialog.logoutBody')}
        onClose={() => setLogoutOpen(false)}
        size="sm"
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setLogoutOpen(false)}>
              {t('app.cancel')}
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                logout()
                setLogoutOpen(false)
              }}
            >
              {t('nav.logout')}
            </Button>
          </>
        }
      />
    </div>
  )
}
