import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { clearSession } from '@/features/auth/store/authSlice'

export function useAuth() {
  const dispatch = useAppDispatch()
  const { user, accessToken, status, bootstrapped } = useAppSelector((state) => state.auth)

  const logout = useCallback(() => {
    dispatch(clearSession())
  }, [dispatch])

  return {
    user,
    accessToken,
    status,
    bootstrapped,
    isAuthenticated: status === 'authenticated' && Boolean(user),
    isMerchant: user?.role === 'merchant' || user?.role === 'admin',
    isProvider: user?.role === 'merchant' || user?.role === 'admin',
    logout,
  }
}
