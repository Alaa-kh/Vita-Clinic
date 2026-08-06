import { favoritesApi } from '@/features/favorites/api/favoritesApi'
import type { Care } from '@/features/care/types/care'
import { mapCareDto } from '@/features/care/utils/mappers'
import { mapApiError } from '@/shared/errors/mapApiError'

export const favoritesService = {
  async list(): Promise<Care[]> {
    try {
      const { data } = await favoritesApi.list()
      return data.items.map(mapCareDto)
    } catch (error) {
      throw mapApiError(error)
    }
  },

  async add(careId: string): Promise<Care> {
    try {
      const { data } = await favoritesApi.add(careId)
      return mapCareDto(data.care)
    } catch (error) {
      throw mapApiError(error)
    }
  },

  async remove(careId: string): Promise<void> {
    try {
      await favoritesApi.remove(careId)
    } catch (error) {
      throw mapApiError(error)
    }
  },
}
