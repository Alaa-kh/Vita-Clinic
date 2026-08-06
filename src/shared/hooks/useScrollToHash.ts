import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/routes'

/** Smooth-scroll to an on-page section, navigating home first when needed. */
export function scrollToSection(sectionId: string): void {
  const element = document.getElementById(sectionId)
  if (!element) return

  const headerOffset = 80
  const top = element.getBoundingClientRect().top + window.scrollY - headerOffset
  window.scrollTo({ top, behavior: 'smooth' })
}

export function useScrollToHash(): void {
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) return

    const sectionId = location.hash.replace(/^#/, '')
    const timer = window.setTimeout(() => {
      scrollToSection(sectionId)
    }, 100)

    return () => window.clearTimeout(timer)
  }, [location.pathname, location.hash])
}

interface UseSectionNavResult {
  goToSection: (sectionId: string) => void
}

export function useSectionNav(): UseSectionNavResult {
  const location = useLocation()
  const navigate = useNavigate()

  const goToSection = (sectionId: string) => {
    const hash = `#${sectionId}`

    if (location.pathname !== ROUTES.home) {
      navigate({ pathname: ROUTES.home, hash })
      return
    }

    if (location.hash !== hash) {
      navigate({ pathname: ROUTES.home, hash }, { replace: true })
    }

    window.requestAnimationFrame(() => {
      scrollToSection(sectionId)
    })
  }

  return { goToSection }
}
