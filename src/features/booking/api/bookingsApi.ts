import { apiClient } from '@/shared/api/apiClient'

export interface Booking {
  id: string
  userId: string
  careId: string
  branchId: string | null
  date: string
  slot: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  recurrence: 'none' | 'weekly' | 'biweekly' | 'monthly'
  notes: string | null
  reminderAt: string | null
  createdAt: string
}

export const bookingsApi = {
  mine: async () => {
    const { data } = await apiClient.get<{ items: Booking[] }>('/bookings/mine')
    return data.items
  },
  availability: async (careId: string, date: string) => {
    const { data } = await apiClient.get<{
      slots: Array<{ slot: string; available: boolean }>
    }>('/bookings/availability', { params: { careId, date } })
    return data.slots
  },
  create: async (payload: {
    careId: string
    date: string
    slot: string
    branchId?: string | null
    recurrence?: Booking['recurrence']
    notes?: string
  }) => {
    const { data } = await apiClient.post<Booking>('/bookings', payload)
    return data
  },
  updateStatus: async (id: string, status: Booking['status']) => {
    const { data } = await apiClient.patch<Booking>(`/bookings/${id}/status`, { status })
    return data
  },
}
