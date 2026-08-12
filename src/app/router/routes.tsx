import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, useRoutes } from 'react-router-dom'
import { AuthLayout } from '@/app/layouts/AuthLayout'
import { MainLayout } from '@/app/layouts/MainLayout'
import { GuestRoute } from '@/app/router/GuestRoute'
import { ProtectedRoute } from '@/app/router/ProtectedRoute'
import { PageLoader } from '@/shared/components/PageLoader/PageLoader'
import { ROUTES } from '@/shared/constants/routes'

const StoreHomePage = lazy(() =>
  import('@/features/shop/pages/StoreHomePage').then((m) => ({ default: m.StoreHomePage })),
)
const ShopPage = lazy(() =>
  import('@/features/shop/pages/ShopPage').then((m) => ({ default: m.ShopPage })),
)
const ProductDetailPage = lazy(() =>
  import('@/features/shop/pages/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })),
)
const CartPage = lazy(() =>
  import('@/features/shop/pages/CartPage').then((m) => ({ default: m.CartPage })),
)
const CheckoutPage = lazy(() =>
  import('@/features/shop/pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage })),
)
const OrdersPage = lazy(() =>
  import('@/features/shop/pages/OrdersPage').then((m) => ({ default: m.OrdersPage })),
)
const TrackOrderPage = lazy(() =>
  import('@/features/shop/pages/TrackOrderPage').then((m) => ({ default: m.TrackOrderPage })),
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
const PlatformHubPage = lazy(() =>
  import('@/features/platform/pages/PlatformHubPage').then((m) => ({ default: m.PlatformHubPage })),
)
const MapsPage = lazy(() =>
  import('@/features/maps/pages/MapsPage').then((m) => ({ default: m.MapsPage })),
)
const BookingPage = lazy(() =>
  import('@/features/booking/pages/BookingPage').then((m) => ({ default: m.BookingPage })),
)
const PaymentsPage = lazy(() =>
  import('@/features/payments/pages/PaymentsPage').then((m) => ({ default: m.PaymentsPage })),
)
const ChatPage = lazy(() =>
  import('@/features/realtime/pages/ChatPage').then((m) => ({ default: m.ChatPage })),
)
const CallPage = lazy(() =>
  import('@/features/realtime/pages/CallPage').then((m) => ({ default: m.CallPage })),
)
const AiPage = lazy(() =>
  import('@/features/ai/pages/AiPage').then((m) => ({ default: m.AiPage })),
)
const AnalyticsPage = lazy(() =>
  import('@/features/analytics/pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })),
)
const NotificationsPage = lazy(() =>
  import('@/features/notifications/pages/NotificationsPage').then((m) => ({
    default: m.NotificationsPage,
  })),
)
const StoragePage = lazy(() =>
  import('@/features/storage/pages/StoragePage').then((m) => ({ default: m.StoragePage })),
)
const SecurityPage = lazy(() =>
  import('@/features/security/pages/SecurityPage').then((m) => ({ default: m.SecurityPage })),
)

function Lazy({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
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
              <StoreHomePage />
            </Lazy>
          ),
        },
        {
          path: ROUTES.shop,
          element: (
            <Lazy>
              <ShopPage />
            </Lazy>
          ),
        },
        {
          path: ROUTES.productDetail,
          element: (
            <Lazy>
              <ProductDetailPage />
            </Lazy>
          ),
        },
        {
          path: ROUTES.platform,
          element: (
            <Lazy>
              <PlatformHubPage />
            </Lazy>
          ),
        },
        {
          path: ROUTES.maps,
          element: (
            <Lazy>
              <MapsPage />
            </Lazy>
          ),
        },
        {
          path: ROUTES.ai,
          element: (
            <Lazy>
              <AiPage />
            </Lazy>
          ),
        },
        {
          path: ROUTES.cart,
          element: (
            <Lazy>
              <CartPage />
            </Lazy>
          ),
        },
        {
          element: <ProtectedRoute />,
          children: [
            {
              path: ROUTES.checkout,
              element: (
                <Lazy>
                  <CheckoutPage />
                </Lazy>
              ),
            },
            {
              path: ROUTES.orders,
              element: (
                <Lazy>
                  <OrdersPage />
                </Lazy>
              ),
            },
            {
              path: ROUTES.trackOrder,
              element: (
                <Lazy>
                  <TrackOrderPage />
                </Lazy>
              ),
            },
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
            {
              path: ROUTES.booking,
              element: (
                <Lazy>
                  <BookingPage />
                </Lazy>
              ),
            },
            {
              path: ROUTES.payments,
              element: (
                <Lazy>
                  <PaymentsPage />
                </Lazy>
              ),
            },
            {
              path: ROUTES.chat,
              element: (
                <Lazy>
                  <ChatPage />
                </Lazy>
              ),
            },
            {
              path: ROUTES.call,
              element: (
                <Lazy>
                  <CallPage />
                </Lazy>
              ),
            },
            {
              path: ROUTES.analytics,
              element: (
                <Lazy>
                  <AnalyticsPage />
                </Lazy>
              ),
            },
            {
              path: ROUTES.notifications,
              element: (
                <Lazy>
                  <NotificationsPage />
                </Lazy>
              ),
            },
            {
              path: ROUTES.storage,
              element: (
                <Lazy>
                  <StoragePage />
                </Lazy>
              ),
            },
            {
              path: ROUTES.security,
              element: (
                <Lazy>
                  <SecurityPage />
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
