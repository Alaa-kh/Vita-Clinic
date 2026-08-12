import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { cartApi, ordersApi } from '@/features/shop/api/shopApi'
import type { Product } from '@/features/shop/types/product'
import {
  addGuestCartItem,
  clearGuestCart,
  getGuestCartEntries,
  getGuestCartSummary,
  updateGuestCartItem,
} from '@/features/shop/utils/guestCart'
import { QUERY_KEYS } from '@/shared/constants/queryKeys'

export function useCart() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: [...QUERY_KEYS.cart.all, isAuthenticated ? 'user' : 'guest'],
    queryFn: async () => {
      if (isAuthenticated) return cartApi.get()
      return getGuestCartSummary()
    },
  })
}

export function useAddToCart() {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      productId,
      quantity = 1,
      product,
    }: {
      productId: string
      quantity?: number
      product?: Product
    }) => {
      if (isAuthenticated) {
        return cartApi.add(productId, quantity)
      }
      if (!product) {
        throw new Error('Product snapshot required for guest cart')
      }
      return addGuestCartItem(product, quantity)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart.all })
    },
  })
}

export function useUpdateCartItem() {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      if (isAuthenticated) {
        return cartApi.update(productId, quantity)
      }
      return updateGuestCartItem(productId, quantity)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart.all })
    },
  })
}

export async function syncGuestCartToServer(): Promise<void> {
  const entries = getGuestCartEntries()
  if (!entries.length) return
  for (const entry of entries) {
    await cartApi.add(entry.productId, entry.quantity)
  }
  clearGuestCart()
}

export function useOrders() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: QUERY_KEYS.orders.mine,
    queryFn: ordersApi.mine,
    enabled: isAuthenticated,
  })
}

export function useCheckout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ordersApi.checkout,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart.all })
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders.mine })
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.payments.mine })
    },
  })
}
