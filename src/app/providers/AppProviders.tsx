import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState, type ReactNode } from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from '@/app/store/store'
import { clearSession, updateTokens } from '@/features/auth/store/authSlice'
import { bindAuthTokenHandlers } from '@/shared/api/apiClient'
import { ThemeProvider } from '@/shared/theme/ThemeProvider'
import '@/shared/i18n'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  useEffect(() => {
    bindAuthTokenHandlers({
      getAccessToken: () => store.getState().auth.accessToken,
      getRefreshToken: () => store.getState().auth.refreshToken,
      setTokens: (accessToken, refreshToken) => {
        store.dispatch(updateTokens({ accessToken, refreshToken }))
      },
      clearAuth: () => {
        store.dispatch(clearSession())
      },
    })
  }, [])

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
            {children}
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  )
}
