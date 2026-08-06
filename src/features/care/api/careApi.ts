import { apiClient } from '@/shared/api/apiClient'
import type { CareDto, CareFilters, CreateCareInput } from '@/features/care/types/care'

function toQuery(filters: CareFilters): Record<string, string> {
  const query: Record<string, string> = {}

  if (filters.q) query.q = filters.q
  if (filters.specialty) query.specialty = filters.specialty
  if (filters.careMode) query.careMode = filters.careMode
  if (filters.city) query.city = filters.city
  if (filters.minPrice) query.minPrice = filters.minPrice
  if (filters.maxPrice) query.maxPrice = filters.maxPrice
  if (filters.featured) query.featured = 'true'
  if (filters.page) query.page = String(filters.page)
  if (filters.pageSize) query.pageSize = String(filters.pageSize)

  return query
}

export const careApi = {
  list(filters: CareFilters = {}) {
    return apiClient.get<{
      items: CareDto[]
      pagination: {
        page: number
        pageSize: number
        total: number
        totalPages: number
      }
    }>('/care', { params: toQuery(filters) })
  },
  getById(id: string) {
    return apiClient.get<{ care: CareDto }>(`/care/${id}`)
  },
  create(input: CreateCareInput) {
    return apiClient.post<{ care: CareDto }>('/care', input)
  },
}
