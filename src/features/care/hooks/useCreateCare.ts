import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { careService } from '@/features/care/services/careService'
import type { CreateCareInput } from '@/features/care/types/care'
import { QUERY_KEYS } from '@/shared/constants/queryKeys'
import { careDetailPath } from '@/shared/constants/routes'
import { isAppError } from '@/shared/errors/AppError'
import { errorMessageKey } from '@/shared/utils/errorMessageKey'

export function useCreateCare() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: (input: CreateCareInput) => careService.create(input),
    onSuccess: async (care) => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.care.all })
      navigate(careDetailPath(care.id))
    },
  })

  const errorKey =
    mutation.error && isAppError(mutation.error)
      ? errorMessageKey(mutation.error.code)
      : mutation.error
        ? 'errors.generic'
        : null

  return {
    createCare: mutation.mutateAsync,
    isPending: mutation.isPending,
    errorKey,
  }
}
