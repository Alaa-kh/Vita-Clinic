import { apiClient } from '@/shared/api/apiClient'

export const aiApi = {
  chat: async (message: string, locale: 'en' | 'ar' = 'en') => {
    const { data } = await apiClient.post<{
      reply: string
      provider: string
      recommendations: Array<{ id: string; title: string; price: number; currency: string }>
    }>('/ai/chat', { message, locale })
    return data
  },
  search: async (query: string) => {
    const { data } = await apiClient.post<{
      items: Array<{ id: string; title: string; score: number; city: string; price: number; currency: string }>
      mode: string
    }>('/ai/search', { query })
    return data
  },
  ocr: async (imageName?: string) => {
    const { data } = await apiClient.post('/ai/ocr', { imageName })
    return data as { text: string; confidence: number; provider: string }
  },
  transcribe: async (locale: 'en' | 'ar' = 'en') => {
    const { data } = await apiClient.post('/ai/speech/transcribe', { locale })
    return data as { text: string; confidence: number }
  },
  synthesize: async (text: string) => {
    const { data } = await apiClient.post('/ai/speech/synthesize', { text })
    return data as { note: string; text: string }
  },
  vision: async (label?: string) => {
    const { data } = await apiClient.post('/ai/vision', { label })
    return data as { labels: string[]; objects: Array<{ name: string; confidence: number }> }
  },
}
