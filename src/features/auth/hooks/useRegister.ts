import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@/app/store/hooks'
import { authService } from '@/features/auth/services/authService'
import { setSession } from '@/features/auth/store/authSlice'
import type { RegisterInput } from '@/features/auth/types/user'
import { ROUTES } from '@/shared/constants/routes'
import { isAppError } from '@/shared/errors/AppError'
import { errorMessageKey } from '@/shared/utils/errorMessageKey'

export function useRegister() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: (input: RegisterInput) => authService.register(input),
    onSuccess: (session) => {
      dispatch(setSession(session))
      navigate(ROUTES.home)
    },
  })

  const errorKey =
    mutation.error && isAppError(mutation.error)
      ? errorMessageKey(mutation.error.code)
      : mutation.error
        ? 'errors.generic'
        : null

  return {
    register: mutation.mutateAsync,
    isPending: mutation.isPending,
    errorKey,
  }
}
