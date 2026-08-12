import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

export function NavigationLoaderBridge() {
  const location = useLocation()
  const navType = useNavigationType()

  useEffect(() => {
    window.dispatchEvent(new Event('barq:nav-start'))
    const done = window.setTimeout(() => {
      window.dispatchEvent(new Event('barq:nav-done'))
    }, 280)
    return () => window.clearTimeout(done)
  }, [location.pathname, location.search, navType])

  return null
}
