import { apiClient } from '@/shared/api/apiClient'
import type {
  CartSummary,
  Order,
  Product,
  ProductDto,
  ProductFilters,
  ProductListResult,
} from '@/features/shop/types/product'
import { mapProductDto } from '@/features/shop/utils/mappers'
import i18n from '@/shared/i18n'

function locale(): string {
  return i18n.language || 'en'
}

export const productsApi = {
  list: async (filters: ProductFilters = {}): Promise<ProductListResult> => {
    const { data } = await apiClient.get<{
      items: ProductDto[]
      pagination: ProductListResult['pagination']
    }>('/products', { params: filters })
    return {
      items: data.items.map((item) => mapProductDto(item, locale())),
      pagination: data.pagination,
    }
  },
  detail: async (id: string): Promise<Product> => {
    const { data } = await apiClient.get<{ product: ProductDto }>(`/products/${id}`)
    return mapProductDto(data.product, locale())
  },
}

export const cartApi = {
  get: async (): Promise<CartSummary> => {
    const { data } = await apiClient.get<CartSummary>('/cart')
    return data
  },
  add: async (productId: string, quantity = 1) => {
    const { data } = await apiClient.post('/cart/items', { productId, quantity })
    return data
  },
  update: async (productId: string, quantity: number) => {
    const { data } = await apiClient.patch(`/cart/items/${productId}`, { quantity })
    return data
  },
  clear: async () => {
    const { data } = await apiClient.delete('/cart')
    return data
  },
}

export const ordersApi = {
  mine: async (): Promise<Order[]> => {
    const { data } = await apiClient.get<{ items: Order[] }>('/orders/mine')
    return data.items
  },
  detail: async (id: string): Promise<Order> => {
    const { data } = await apiClient.get<{ order: Order }>(`/orders/${id}`)
    return data.order
  },
  checkout: async (payload: {
    deliveryAddress: string
    city?: string
    lat?: number
    lng?: number
    notes?: string
    paymentMethod?: string
  }) => {
    const { data } = await apiClient.post<{ order: Order; invoiceNumber: string }>(
      '/orders/checkout',
      payload,
    )
    return data
  },
  track: async (id: string) => {
    const { data } = await apiClient.get<{
      order: Order
      courier: { lat: number; lng: number; speed: number; heading: number } | null
      store: { lat: number; lng: number; name: string }
      dropoff: { lat: number; lng: number; address: string }
    }>(`/orders/${id}/track`)
    return data
  },
}
