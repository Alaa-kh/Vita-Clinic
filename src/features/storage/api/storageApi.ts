import { apiClient } from '@/shared/api/apiClient'

export const storageApi = {
  list: async () => {
    const { data } = await apiClient.get<{
      items: Array<{
        id: string
        originalName: string
        mimeType: string
        size: number
        url: string
        compressed: boolean
        createdAt: string
      }>
    }>('/storage')
    return data.items
  },
  upload: async (file: File, compress = true) => {
    const form = new FormData()
    form.append('file', file)
    const { data } = await apiClient.post(`/storage/upload?compress=${compress}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data as {
      file: {
        id: string
        originalName: string
        url: string
        mimeType: string
        size: number
        compressed: boolean
      }
      cloud: { provider: string }
    }
  },
}
