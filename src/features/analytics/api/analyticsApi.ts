import { apiClient } from '@/shared/api/apiClient'

export const analyticsApi = {
  dashboard: async () => {
    const { data } = await apiClient.get<{
      kpis: Array<{ id: string; label: string; value: number; delta: number; unit?: string }>
      charts: {
        revenueSeries: Array<{ date: string; revenue: number }>
        bySpecialty: Array<{ name: string; value: number }>
        careModes: Array<{ name: string; value: number }>
      }
      realtime: {
        onlineUsers: number
        apiHealth: string
        queueDepth: number
        cacheHitRate: number
      }
    }>('/analytics/dashboard')
    return data
  },
  exportReport: async (format: 'csv' | 'excel' | 'pdf') => {
    if (format === 'pdf') {
      const { data } = await apiClient.get(`/analytics/export/${format}`)
      return data
    }
    const { data } = await apiClient.get<string>(`/analytics/export/${format}`, {
      responseType: 'text',
    })
    return data
  },
}
