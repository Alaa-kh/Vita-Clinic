import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, useRoutes } from 'react-router-dom'
import { AuthLayout } from '@/app/layouts/AuthLayout'
import { MainLayout } from '@/app/layouts/MainLayout'
import { GuestRoute } from '@/app/router/GuestRoute'
import { ProtectedRoute } from '@/app/router/ProtectedRoute'
import { Spinner } from '@/shared/components/Spinner/Spinner'
import { ROUTES } from '@/shared/constants/routes'

const HomePage = lazy(() =>
  import('@/features/care/pages/HomePage').then((m) => ({ default: m.HomePage })),
)
const CarePage = lazy(() =>
  import('@/features/care/pages/CarePage').then((m) => ({ default: m.CarePage })),
)
const CareDetailPage = lazy(() =>
  import('@/features/care/pages/CareDetailPage').then((m) => ({ default: m.CareDetailPage })),
)
const CreateCarePage = lazy(() =>
  import('@/features/care/pages/CreateCarePage').then((m) => ({ default: m.CreateCarePage })),
)
const FavoritesPage = lazy(() =>
  import('@/features/favorites/pages/FavoritesPage').then((m) => ({
    default: m.FavoritesPage,
  })),
)
const ProfilePage = lazy(() =>
  import('@/features/profile/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })),
)
const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const RegisterPage = lazy(() =>
  import('@/features/auth/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })),
)

function Lazy({ children }: { children: ReactNode }) {
  return <Suspense fallback={<Spinner />}>{children}</Suspense>
}

export function AppRouter() {
  return useRoutes([
    {
      element: <MainLayout />,
      children: [
        {
          path: ROUTES.home,
          element: (
            <Lazy>
              <HomePage />
            </Lazy>
          ),
        },
        {
          path: ROUTES.care,
          element: (
            <Lazy>
              <CarePage />
            </Lazy>
          ),
        },
        {
          path: ROUTES.careDetail,
          element: (
            <Lazy>
              <CareDetailPage />
            </Lazy>
          ),
        },
        {
          element: <ProtectedRoute />,
          children: [
            {
              path: ROUTES.favorites,
              element: (
                <Lazy>
                  <FavoritesPage />
                </Lazy>
              ),
            },
            {
              path: ROUTES.profile,
              element: (
                <Lazy>
                  <ProfilePage />
                </Lazy>
              ),
            },
          ],
        },
        {
          element: <ProtectedRoute roles={['provider']} />,
          children: [
            {
              path: ROUTES.createCare,
              element: (
                <Lazy>
                  <CreateCarePage />
                </Lazy>
              ),
            },
          ],
        },
      ],
    },
    {
      element: <AuthLayout />,
      children: [
        {
          element: <GuestRoute />,
          children: [
            {
              path: ROUTES.login,
              element: (
                <Lazy>
                  <LoginPage />
                </Lazy>
              ),
            },
            {
              path: ROUTES.register,
              element: (
                <Lazy>
                  <RegisterPage />
                </Lazy>
              ),
            },
          ],
        },
      ],
    },
    {
      path: '*',
      element: <Navigate to={ROUTES.home} replace />,
    },
  ])
}
