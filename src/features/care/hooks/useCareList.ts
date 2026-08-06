import { useQuery } from '@tanstack/react-query'
import { careService } from '@/features/care/services/careService'
import type { CareFilters } from '@/features/care/types/care'
import { QUERY_KEYS } from '@/shared/constants/queryKeys'

export function useCareList(filters: CareFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.care.list(filters),
    queryFn: () => careService.list(filters),
  })
}
