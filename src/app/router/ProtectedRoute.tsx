import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ROUTES } from '@/shared/constants/routes'

interface ProtectedRouteProps {
  roles?: Array<'patient' | 'provider'>
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to={ROUTES.home} replace />
  }

  return <Outlet />
}
