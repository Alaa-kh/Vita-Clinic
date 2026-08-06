import { apiClient } from '@/shared/api/apiClient'
import type { CareDto } from '@/features/care/types/care'

export const favoritesApi = {
  list() {
    return apiClient.get<{ items: CareDto[] }>('/favorites')
  },
  add(careId: string) {
    return apiClient.post<{ care: CareDto }>(`/favorites/${careId}`)
  },
  remove(careId: string) {
    return apiClient.delete(`/favorites/${careId}`)
  },
}
