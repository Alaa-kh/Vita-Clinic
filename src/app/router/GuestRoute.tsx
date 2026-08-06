import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ROUTES } from '@/shared/constants/routes'

export function GuestRoute() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to={ROUTES.home} replace />
  }

  return <Outlet />
}
