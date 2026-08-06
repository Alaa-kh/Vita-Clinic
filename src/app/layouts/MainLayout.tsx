import { useEffect, useId, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useAuthBootstrap } from '@/features/auth/hooks/useAuthBootstrap'
import { Button } from '@/shared/components/Button/Button'
import { ChatBot } from '@/shared/components/ChatBot/ChatBot'
import { Dialog } from '@/shared/components/Dialog/Dialog'
import { FloatingActions } from '@/shared/components/FloatingActions/FloatingActions'
import { PromoPopup } from '@/shared/components/PromoPopup/PromoPopup'
import { Spinner } from '@/shared/components/Spinner/Spinner'
import { ThemeToggle } from '@/shared/components/ThemeToggle/ThemeToggle'
import { ROUTES } from '@/shared/constants/routes'
import { useScrollToHash, useSectionNav } from '@/shared/hooks/useScrollToHash'
import { applyDocumentLocale } from '@/shared/i18n'
import styles from '@/app/layouts/MainLayout.module.scss'

const SERVICE_LINKS = [
  { id: 'dental', specialty: 'dentistry', titleKey: 'home.pillarDental', lineKey: 'home.pillarDentalLine' },
  { id: 'derm', specialty: 'dermatology', titleKey: 'home.pillarDerm', lineKey: 'home.pillarDermLine' },
  { id: 'medical', specialty: 'general', titleKey: 'home.pillarMedical', lineKey: 'home.pillarMedicalLine' },
  { id: 'hair', specialty: 'dermatology', titleKey: 'home.pillarHair', lineKey: 'home.pillarHairLine' },
] as const

export function MainLayout() {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const { isAuthenticated, isProvider, logout, bootstrapped, status } = useAuth()
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const servicesId = useId()
  const servicesRef = useRef<HTMLDivElement>(null)
  const { goToSection } = useSectionNav()
  useAuthBootstrap()
  useScrollToHash()

  useEffect(() => {
    setMenuOpen(false)
    setServicesOpen(false)
  }, [location.pathname, location.hash])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  useEffect(() => {
    if (!servicesOpen) return

    const onPointerDown = (event: MouseEvent) => {
      if (!servicesRef.current?.contains(event.target as Node)) {
        setServicesOpen(false)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setServicesOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [servicesOpen])

  const switchLocale = () => {
    const next = i18n.language === 'ar' ? 'en' : 'ar'
    void i18n.changeLanguage(next)
    applyDocumentLocale(next)
  }

  const goSection = (id: string) => {
    setMenuOpen(false)
    setServicesOpen(false)
    goToSection(id)
  }

  if (!bootstrapped || status === 'hydrating') {
    return <Spinner />
  }

  return (
    <div className={styles.shell}>
      <div className={styles.chrome}>
        <div className={styles.topBar}>
          <div className={`container ${styles.topBarInner}`}>
            <div className={styles.topMeta}>
              <a href={`tel:${t('footer.phone').replace(/\s/g, '')}`} className={styles.topLink}>
                <svg className={styles.topIcon} viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.2 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8Z"
                  />
                </svg>
                {t('footer.phone')}
              </a>
              <a
                href="https://wa.me/966500000000"
                className={styles.topLink}
                target="_blank"
                rel="noreferrer"
              >
                <svg className={styles.topIcon} viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M12 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.3-1.4A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3.1.8.8-3-.2-.3A8 8 0 1 1 12 20Zm4.4-5.7c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.7.9-.3.2-.5.1a6.5 6.5 0 0 1-1.9-1.2 7.2 7.2 0 0 1-1.3-1.7c-.1-.3 0-.4.1-.5l.4-.5.1-.3c0-.1 0-.3-.1-.4s-.5-1.3-.7-1.7-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3s-.8.8-.8 1.9.8 2.2.9 2.3a8.8 8.8 0 0 0 3.4 2.8c1.3.5 1.8.5 2.4.4.4-.1 1.4-.6 1.6-1.1s.2-1 .1-1.1-.2-.2-.4-.3Z"
                  />
                </svg>
                {t('header.whatsapp')}
              </a>
              <button type="button" className={styles.topLink} onClick={() => goSection('branches')}>
                <svg className={styles.topIcon} viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M12 2a7 7 0 0 0-7 7c0 5.3 7 13 7 13s7-7.7 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z"
                  />
                </svg>
                {t('header.nearestBranch')}
              </button>
            </div>
            <div className={styles.topActions}>
              <span className={styles.topHours}>{t('footer.hours')}</span>
              <ThemeToggle />
              <button type="button" className={styles.langButton} onClick={switchLocale}>
                {i18n.language === 'ar' ? t('app.english') : t('app.arabic')}
              </button>
            </div>
          </div>
        </div>

        <header className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          <NavLink to={ROUTES.home} className={styles.brand}>
            <span className={styles.brandMark} aria-hidden="true">
              +
            </span>
            <span className={styles.brandText}>
              <strong>{t('app.name')}</strong>
              <small>{t('header.brandLine')}</small>
            </span>
          </NavLink>

          <nav className={styles.navDesktop} aria-label="Main">
            <NavLink to={ROUTES.home} end>
              {t('nav.home')}
            </NavLink>

            <div className={styles.servicesWrap} ref={servicesRef}>
              <button
                type="button"
                className={`${styles.navButton} ${servicesOpen ? styles.navButtonOpen : ''}`}
                aria-expanded={servicesOpen}
                aria-controls={servicesId}
                onClick={() => setServicesOpen((open) => !open)}
              >
                {t('nav.services')}
                <span className={styles.chevron} aria-hidden="true" />
              </button>
              <div
                id={servicesId}
                className={`${styles.servicesMenu} ${servicesOpen ? styles.servicesMenuOpen : ''}`}
                hidden={!servicesOpen}
              >
                {SERVICE_LINKS.map((item) => (
                  <Link
                    key={item.id}
                    to={`${ROUTES.care}?specialty=${encodeURIComponent(item.specialty)}`}
                    className={styles.serviceItem}
                    onClick={() => setServicesOpen(false)}
                  >
                    <strong>{t(item.titleKey)}</strong>
                    <span>{t(item.lineKey)}</span>
                  </Link>
                ))}
                <button
                  type="button"
                  className={styles.serviceAll}
                  onClick={() => goSection('services')}
                >
                  {t('header.allServices')}
                </button>
              </div>
            </div>

            <button type="button" className={styles.navButton} onClick={() => goSection('offers')}>
              {t('nav.offers')}
            </button>
            <button type="button" className={styles.navButton} onClick={() => goSection('doctors')}>
              {t('nav.doctors')}
            </button>
            <button type="button" className={styles.navButton} onClick={() => goSection('branches')}>
              {t('nav.branches')}
            </button>
            <NavLink to={ROUTES.care}>{t('nav.findCare')}</NavLink>
            {isAuthenticated ? <NavLink to={ROUTES.favorites}>{t('nav.saved')}</NavLink> : null}
            {isProvider ? <NavLink to={ROUTES.createCare}>{t('nav.listService')}</NavLink> : null}
          </nav>

          <div className={styles.actions}>
            <div className={styles.actionsDesktop}>
              {isAuthenticated ? (
                <>
                  <NavLink to={ROUTES.profile} className={styles.accountLink}>
                    {t('nav.profile')}
                  </NavLink>
                  <Button type="button" variant="secondary" size="sm" onClick={() => setLogoutOpen(true)}>
                    {t('nav.logout')}
                  </Button>
                </>
              ) : (
                <NavLink to={ROUTES.login} className={styles.accountLink}>
                  {t('nav.login')}
                </NavLink>
              )}
              <NavLink to={ROUTES.care} className={styles.bookCta}>
                {t('header.bookAppointment')}
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
            <p className={styles.mobileGroup}>{t('nav.services')}</p>
            {SERVICE_LINKS.map((item) => (
              <NavLink
                key={`m-${item.id}`}
                to={`${ROUTES.care}?specialty=${encodeURIComponent(item.specialty)}`}
                onClick={() => setMenuOpen(false)}
              >
                {t(item.titleKey)}
              </NavLink>
            ))}
            <button type="button" onClick={() => goSection('offers')}>
              {t('nav.offers')}
            </button>
            <button type="button" onClick={() => goSection('doctors')}>
              {t('nav.doctors')}
            </button>
            <button type="button" onClick={() => goSection('branches')}>
              {t('nav.branches')}
            </button>
            <NavLink to={ROUTES.care} onClick={() => setMenuOpen(false)}>
              {t('nav.findCare')}
            </NavLink>
            {isAuthenticated ? (
              <NavLink to={ROUTES.favorites} onClick={() => setMenuOpen(false)}>
                {t('nav.saved')}
              </NavLink>
            ) : null}
            {isProvider ? (
              <NavLink to={ROUTES.createCare} onClick={() => setMenuOpen(false)}>
                {t('nav.listService')}
              </NavLink>
            ) : null}
            {isAuthenticated ? (
              <>
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
            <NavLink
              to={ROUTES.care}
              onClick={() => setMenuOpen(false)}
              className={styles.mobileBook}
            >
              {t('header.bookAppointment')}
            </NavLink>
          </nav>
        </div>
      </header>
      </div>

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
            <NavLink to={ROUTES.care}>{t('nav.findCare')}</NavLink>
            <button type="button" onClick={() => goSection('services')}>
              {t('nav.services')}
            </button>
            <button type="button" onClick={() => goSection('offers')}>
              {t('nav.offers')}
            </button>
            <button type="button" onClick={() => goSection('branches')}>
              {t('nav.branches')}
            </button>
          </div>
          <div>
            <h3>{t('footer.company')}</h3>
            <button type="button" onClick={() => goSection('doctors')}>
              {t('nav.doctors')}
            </button>
            <button type="button" onClick={() => goSection('faq')}>
              {t('nav.faq')}
            </button>
            <button type="button" onClick={() => goSection('testimonials')}>
              {t('footer.stories')}
            </button>
          </div>
          <div>
            <h3>{t('footer.contact')}</h3>
            <p>{t('footer.email')}</p>
            <p>{t('footer.phone')}</p>
            <p>{t('footer.hours')}</p>
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

      <PromoPopup />
      <FloatingActions />
      <ChatBot />
    </div>
  )
}
