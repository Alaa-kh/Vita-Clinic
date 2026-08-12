import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { authService } from '@/features/auth/services/authService'
import {
  clearSession,
  markBootstrapped,
  setHydrating,
  setUser,
} from '@/features/auth/store/authSlice'

export function useAuthBootstrap() {
  const dispatch = useAppDispatch()
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
  }, [accessToken, bootstrapped, dispatch])
}
