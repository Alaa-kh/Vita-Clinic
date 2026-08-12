import { apiClient } from '@/shared/api/apiClient'

export interface Payment {
  id: string
  amount: number
  currency: string
  status: string
  method: string
  invoiceNumber: string
  createdAt: string
  refundedAt: string | null
}

export interface SavedCard {
  id: string
  brand: string
  last4: string
  expMonth: number
  expYear: number
  isDefault: boolean
}

export const paymentsApi = {
  mine: async () => {
    const { data } = await apiClient.get<{ items: Payment[] }>('/payments/mine')
    return data.items
  },
  cards: async () => {
    const { data } = await apiClient.get<{ items: SavedCard[] }>('/payments/cards')
    return data.items
  },
  checkout: async (payload: {
    amount: number
    currency?: string
    method?: string
    bookingId?: string | null
    subscription?: boolean
  }) => {
    const { data } = await apiClient.post<{
      payment: Payment
      clientSecret: string | null
      mode: string
      wallets: string[]
    }>('/payments/checkout', payload)
    return data
  },
  refund: async (id: string) => {
    const { data } = await apiClient.post<Payment>(`/payments/${id}/refund`)
    return data
  },
  invoice: async (id: string) => {
    const { data } = await apiClient.get(`/payments/invoices/${id}`)
    return data
  },
}
