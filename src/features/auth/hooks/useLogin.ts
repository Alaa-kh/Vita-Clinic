import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppDispatch } from '@/app/store/hooks'
import { authService } from '@/features/auth/services/authService'
import { setSession } from '@/features/auth/store/authSlice'
import type { LoginInput } from '@/features/auth/types/user'
import { syncGuestCartToServer } from '@/features/shop/hooks/useCart'
import { QUERY_KEYS } from '@/shared/constants/queryKeys'
import { ROUTES } from '@/shared/constants/routes'
import { isAppError } from '@/shared/errors/AppError'
import { errorMessageKey } from '@/shared/utils/errorMessageKey'

export function useLogin() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),
    onSuccess: async (session) => {
      dispatch(setSession(session))
      try {
        await syncGuestCartToServer()
      } catch {
        // Guest merge is best-effort; cart UI will still refresh.
      }
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart.all })
      const next = params.get('next')
      navigate(next && next.startsWith('/') ? next : ROUTES.home)
    },
  })

  const errorKey =
    mutation.error && isAppError(mutation.error)
      ? errorMessageKey(mutation.error.code)
      : mutation.error
        ? 'errors.generic'
        : null

  return {
    login: mutation.mutateAsync,
    isPending: mutation.isPending,
    errorKey,
  }
}
