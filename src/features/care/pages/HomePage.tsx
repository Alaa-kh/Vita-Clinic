import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { CareCard } from '@/features/care/components/CareCard'
import { CareGrid } from '@/features/care/components/CareGrid'
import { useCareList } from '@/features/care/hooks/useCareList'
import type { Specialty } from '@/features/care/types/care'
import { Reveal } from '@/shared/components/Reveal/Reveal'
import { Spinner } from '@/shared/components/Spinner/Spinner'
import { StateMessage } from '@/shared/components/StateMessage/StateMessage'
import { ROUTES } from '@/shared/constants/routes'
import { isAppError } from '@/shared/errors/AppError'
import { errorMessageKey } from '@/shared/utils/errorMessageKey'
import styles from '@/features/care/pages/HomePage.module.scss'

const SERVICE_PILLARS: Array<{
  key: Specialty
  titleKey: string
  lineKey: string
  image: string
}> = [
  {
    key: 'dentistry',
    titleKey: 'home.pillarDental',
    lineKey: 'home.pillarDentalLine',
    image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=1200&q=80',
  },
  {
    key: 'dermatology',
    titleKey: 'home.pillarDerm',
    lineKey: 'home.pillarDermLine',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=1200&q=80',
  },
  {
    key: 'general',
    titleKey: 'home.pillarMedical',
    lineKey: 'home.pillarMedicalLine',
    image: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200&q=80',
  },
  {
    key: 'dermatology',
    titleKey: 'home.pillarHair',
    lineKey: 'home.pillarHairLine',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80',
  },
]

const CITIES = [
  { nameKey: 'home.cityRiyadh', query: 'Riyadh' },
  { nameKey: 'home.cityJeddah', query: 'Jeddah' },
  { nameKey: 'home.cityKhobar', query: 'Khobar' },
  { nameKey: 'home.cityDammam', query: 'Dammam' },
  { nameKey: 'home.cityRemote', query: 'Remote' },
] as const

const TESTIMONIALS = [
  { nameKey: 'home.t1Name', roleKey: 'home.t1Role', quoteKey: 'home.t1Quote' },
  { nameKey: 'home.t2Name', roleKey: 'home.t2Role', quoteKey: 'home.t2Quote' },
  { nameKey: 'home.t3Name', roleKey: 'home.t3Role', quoteKey: 'home.t3Quote' },
] as const

const FAQ_ITEMS = [
  { id: 'faq1', qKey: 'home.faq1Q', aKey: 'home.faq1A' },
  { id: 'faq2', qKey: 'home.faq2Q', aKey: 'home.faq2A' },
  { id: 'faq3', qKey: 'home.faq3Q', aKey: 'home.faq3A' },
  { id: 'faq4', qKey: 'home.faq4Q', aKey: 'home.faq4A' },
] as const

export function HomePage() {
  const { t } = useTranslation()
  const { isProvider, isAuthenticated } = useAuth()
  const offersQuery = useCareList({ featured: true, pageSize: 12 })
  const doctorsQuery = useCareList({ featured: true, pageSize: 6 })
  const telehealthQuery = useCareList({ careMode: 'telehealth', pageSize: 3 })
  const providerCta = isAuthenticated && isProvider ? ROUTES.createCare : ROUTES.register
  const [openFaqId, setOpenFaqId] = useState<string | null>(FAQ_ITEMS[0].id)

  const toggleFaq = (id: string) => {
    setOpenFaqId((current) => (current === id ? null : id))
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroVisual} aria-hidden="true">
          <img
            src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=2200&q=85"
            alt=""
          />
        </div>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.copy}>
            <h1 className={styles.brandMark}>{t('app.name')}</h1>
            <p className={styles.subhead}>{t('home.hero.subhead')}</p>
            <div className={styles.actions}>
              <Link to={ROUTES.care} className={styles.primaryCta}>
                {t('home.hero.ctaBook')}
              </Link>
              <a href="#branches" className={styles.secondaryCta}>
                {t('home.hero.ctaBranches')}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="offers" className={styles.offersSection}>
        <div className={`container ${styles.section}`}>
          <Reveal as="header" className={styles.sectionHeaderRow}>
            <div>
              <p className={styles.eyebrow}>{t('home.offersEyebrow')}</p>
              <h2>{t('home.offersTitle')}</h2>
              <p>{t('home.offersSub')}</p>
            </div>
            <Link to={ROUTES.care} className={styles.textLink}>
              {t('home.viewAllOffers')}
            </Link>
          </Reveal>

          {offersQuery.isLoading ? <Spinner /> : null}
          {offersQuery.isError ? (
            <StateMessage
              tone="error"
              title={t(
                isAppError(offersQuery.error)
                  ? errorMessageKey(offersQuery.error.code)
                  : 'errors.generic',
              )}
              onAction={() => void offersQuery.refetch()}
            />
          ) : null}
          {offersQuery.isSuccess && offersQuery.data.items.length > 0 ? (
            <div className={styles.offersTrack}>
              {offersQuery.data.items.map((item) => (
                <div key={item.id} className={styles.offerItem}>
                  <CareCard care={item} />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className={styles.campaign}>
        <div className={`container ${styles.campaignInner}`}>
          <Reveal className={styles.campaignVisual} variant="left">
            <img
              src="https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=1400&q=85"
              alt=""
              loading="lazy"
            />
          </Reveal>
          <Reveal className={styles.campaignCopy} variant="right">
            <p className={styles.eyebrow}>{t('home.campaignEyebrow')}</p>
            <h2>{t('home.campaignTitle')}</h2>
            <p>{t('home.campaignBody')}</p>
            <Link to={`${ROUTES.care}?specialty=dentistry`} className={styles.primaryCtaInline}>
              {t('home.campaignCta')}
            </Link>
          </Reveal>
        </div>
      </section>

      <section className={styles.statsBand} aria-label={t('home.statsLabel')}>
        <div className={`container ${styles.statsInner}`}>
          <Reveal className={styles.stat} delayMs={0} variant="scale">
            <strong>35+</strong>
            <span>{t('home.statsBranches')}</span>
          </Reveal>
          <Reveal className={styles.stat} delayMs={80} variant="scale">
            <strong>700+</strong>
            <span>{t('home.statsDoctors')}</span>
          </Reveal>
          <Reveal className={styles.stat} delayMs={160} variant="scale">
            <strong>2M+</strong>
            <span>{t('home.statsPatients')}</span>
          </Reveal>
          <Reveal className={styles.stat} delayMs={240} variant="scale">
            <strong>4</strong>
            <span>{t('home.statsDepartments')}</span>
          </Reveal>
        </div>
      </section>

      <section className={`container ${styles.aboutSection}`}>
        <Reveal className={styles.aboutInner}>
          <p className={styles.eyebrow}>{t('home.aboutTrustEyebrow')}</p>
          <h2>{t('home.aboutTrustTitle')}</h2>
          <p>{t('home.aboutTrustBody')}</p>
        </Reveal>
      </section>

      <section id="services" className={`container ${styles.section}`}>
        <Reveal as="header" className={styles.sectionHeader}>
          <p className={styles.eyebrow}>{t('home.servicesEyebrow')}</p>
          <h2>{t('home.servicesTitle')}</h2>
          <p>{t('home.servicesSub')}</p>
        </Reveal>
        <div className={styles.pillars}>
          {SERVICE_PILLARS.map((pillar, index) => (
            <Reveal
              key={pillar.titleKey}
              delayMs={index * 100}
              className={styles.pillarReveal}
              variant="scale"
            >
              <Link
                to={`${ROUTES.care}?specialty=${encodeURIComponent(pillar.key)}`}
                className={styles.pillar}
              >
                <img src={pillar.image} alt="" loading="lazy" />
                <div className={styles.pillarCopy}>
                  <h3>{t(pillar.titleKey)}</h3>
                  <p>{t(pillar.lineKey)}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className={styles.installmentStrip} aria-label={t('home.installmentTitle')}>
        <div className={`container ${styles.installmentInner}`}>
          <div className={styles.installmentCopy}>
            <strong>{t('home.installmentTitle')}</strong>
            <p>{t('home.installmentBody')}</p>
          </div>
          <Link to={ROUTES.care} className={styles.installmentCta}>
            {t('home.installmentCta')}
          </Link>
        </div>
      </section>

      <section id="doctors" className={`container ${styles.section}`}>
        <Reveal as="header" className={styles.sectionHeaderRow}>
          <div>
            <p className={styles.eyebrow}>{t('home.doctorsEyebrow')}</p>
            <h2>{t('home.doctorsTitle')}</h2>
            <p>{t('home.doctorsSub')}</p>
          </div>
          <Link to={ROUTES.care} className={styles.textLink}>
            {t('home.viewAllDoctors')}
          </Link>
        </Reveal>
        {doctorsQuery.isLoading ? <Spinner /> : null}
        {doctorsQuery.isSuccess && doctorsQuery.data.items.length === 0 ? (
          <StateMessage title={t('care.empty')} />
        ) : null}
        {doctorsQuery.isSuccess && doctorsQuery.data.items.length > 0 ? (
          <CareGrid items={doctorsQuery.data.items} />
        ) : null}
      </section>

      <section id="branches" className={styles.branchesSection}>
        <div className={`container ${styles.section}`}>
          <Reveal as="header" className={styles.sectionHeader}>
            <p className={styles.eyebrow}>{t('home.branchesEyebrow')}</p>
            <h2>{t('home.branchesTitle')}</h2>
            <p>{t('home.branchesSub')}</p>
          </Reveal>
          <div className={styles.cities}>
            {CITIES.map((city, index) => (
              <Reveal key={city.nameKey} delayMs={index * 80} variant="up">
                <Link
                  to={`${ROUTES.care}?city=${encodeURIComponent(city.query)}`}
                  className={styles.cityCard}
                >
                  <span>{t(city.nameKey)}</span>
                  <span className={styles.cityArrow} aria-hidden="true">
                    →
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {telehealthQuery.isSuccess && telehealthQuery.data.items.length > 0 ? (
        <section id="telehealth" className={`container ${styles.telehealthSection}`}>
          <Reveal as="header" className={styles.sectionHeaderRow}>
            <div>
              <p className={styles.eyebrow}>{t('home.telehealthEyebrow')}</p>
              <h2>{t('home.telehealthTitle')}</h2>
              <p>{t('home.telehealthSub')}</p>
            </div>
            <Link to={`${ROUTES.care}?careMode=telehealth`} className={styles.textLink}>
              {t('home.viewAll')}
            </Link>
          </Reveal>
          <CareGrid items={telehealthQuery.data.items} />
        </section>
      ) : null}

      <section id="testimonials" className={styles.testimonials}>
        <div className={`container ${styles.section}`}>
          <Reveal as="header" className={styles.sectionHeader}>
            <p className={styles.eyebrow}>{t('home.testimonialsEyebrow')}</p>
            <h2>{t('home.testimonialsTitle')}</h2>
          </Reveal>
          <div className={styles.testimonialGrid}>
            {TESTIMONIALS.map((item, index) => (
              <Reveal
                key={item.nameKey}
                delayMs={index * 120}
                className={styles.testimonial}
                variant="up"
              >
                <p className={styles.quote}>{t(item.quoteKey)}</p>
                <div className={styles.testimonialMeta}>
                  <strong>{t(item.nameKey)}</strong>
                  <span>{t(item.roleKey)}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className={styles.faqSection}>
        <div className={`container ${styles.faqLayout}`}>
          <Reveal className={styles.faqIntro} variant="left">
            <p className={styles.eyebrow}>{t('home.faqEyebrow')}</p>
            <h2>{t('home.faqTitle')}</h2>
            <p>{t('home.faqSub')}</p>
            <div className={styles.faqHelp}>
              <strong>{t('home.faqHelpTitle')}</strong>
              <p>{t('home.faqHelpBody')}</p>
              <div className={styles.faqHelpActions}>
                <a href="https://wa.me/966500000000" target="_blank" rel="noreferrer">
                  {t('home.faqHelpWhatsapp')}
                </a>
                <a href="tel:+966920000000">{t('home.faqHelpCall')}</a>
              </div>
            </div>
          </Reveal>

          <div className={styles.faqAccordion} role="list">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaqId === item.id
              const panelId = `${item.id}-panel`
              const buttonId = `${item.id}-button`

              return (
                <Reveal
                  key={item.id}
                  delayMs={index * 90}
                  variant="up"
                  className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ''}`}
                >
                  <div role="listitem">
                    <button
                      type="button"
                      id={buttonId}
                      className={styles.faqTrigger}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => toggleFaq(item.id)}
                    >
                      <span className={styles.faqIndex} aria-hidden="true">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className={styles.faqQuestion}>{t(item.qKey)}</span>
                      <span className={styles.faqToggle} aria-hidden="true">
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      className={styles.faqAnswer}
                      aria-hidden={!isOpen}
                    >
                      <div className={styles.faqAnswerInner}>
                        <p>{t(item.aKey)}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      <section className={styles.ctaBand}>
        <Reveal className={`container ${styles.ctaBandInner}`}>
          <div>
            <p className={styles.ctaBrand}>{t('app.name')}</p>
            <h2>{t('home.ctaBandTitle')}</h2>
            <p>{t('home.ctaBandBody')}</p>
          </div>
          <div className={styles.ctaBandActions}>
            <Link to={ROUTES.care} className={styles.primaryCta}>
              {t('home.ctaBandBook')}
            </Link>
            <Link to={providerCta} className={styles.secondaryCta}>
              {t('home.ctaBandJoin')}
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
