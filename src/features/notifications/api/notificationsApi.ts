import { apiClient } from '@/shared/api/apiClient'

export interface AppNotification {
  id: string
  title: string
  body: string
  channel: string
  read: boolean
  scheduledFor: string | null
  createdAt: string
}

export const notificationsApi = {
  list: async () => {
    const { data } = await apiClient.get<{ items: AppNotification[]; unread: number }>(
      '/notifications',
    )
    return data
  },
  markRead: async (id: string) => {
    const { data } = await apiClient.post(`/notifications/${id}/read`)
    return data
  },
  markAllRead: async () => {
    const { data } = await apiClient.post('/notifications/read-all')
    return data
  },
  schedule: async (payload: {
    title: string
    body: string
    channel?: string
    scheduledFor?: string | null
  }) => {
    const { data } = await apiClient.post('/notifications/schedule', payload)
    return data
  },
}
