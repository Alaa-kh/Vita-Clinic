import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { authService } from '@/features/auth/services/authService'
import {
  clearSession,
  markBootstrapped,
  setHydrating,
  setUser,
} from '@/features/auth/store/authSlice'
import { syncGuestCartToServer } from '@/features/shop/hooks/useCart'
import { QUERY_KEYS } from '@/shared/constants/queryKeys'

export function useAuthBootstrap() {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const { accessToken, bootstrapped } = useAppSelector((state) => state.auth)

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      if (bootstrapped) return

      if (!accessToken) {
        dispatch(markBootstrapped())
        return
      }

      dispatch(setHydrating())

      try {
        const user = await authService.getCurrentUser()
        if (!cancelled) {
          dispatch(setUser(user))
          try {
            await syncGuestCartToServer()
          } catch {
            // best-effort merge
          }
          await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart.all })
        }
      } catch {
        if (!cancelled) {
          dispatch(clearSession())
        }
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
    }
  }, [accessToken, bootstrapped, dispatch, queryClient])
}
