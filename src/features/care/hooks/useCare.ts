import { useQuery } from '@tanstack/react-query'
import { careService } from '@/features/care/services/careService'
import { QUERY_KEYS } from '@/shared/constants/queryKeys'

export function useCare(id: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.care.detail(id ?? ''),
    queryFn: () => careService.getById(id!),
    enabled: Boolean(id),
  })
}
