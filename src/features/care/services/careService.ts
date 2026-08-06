import { careApi } from '@/features/care/api/careApi'
import type {
  Care,
  CareFilters,
  CareListResult,
  CreateCareInput,
} from '@/features/care/types/care'
import { mapCareDto } from '@/features/care/utils/mappers'
import { mapApiError } from '@/shared/errors/mapApiError'

export const careService = {
  async list(filters: CareFilters = {}): Promise<CareListResult> {
    try {
      const { data } = await careApi.list(filters)
      return {
        items: data.items.map(mapCareDto),
        pagination: data.pagination,
      }
    } catch (error) {
      throw mapApiError(error)
    }
  },

  async getById(id: string): Promise<Care> {
    try {
      const { data } = await careApi.getById(id)
      return mapCareDto(data.care)
    } catch (error) {
      throw mapApiError(error)
    }
  },

  async create(input: CreateCareInput): Promise<Care> {
    try {
      const { data } = await careApi.create(input)
      return mapCareDto(data.care)
    } catch (error) {
      throw mapApiError(error)
    }
  },
}
