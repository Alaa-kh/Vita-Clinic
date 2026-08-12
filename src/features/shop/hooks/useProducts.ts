import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { productsApi } from '@/features/shop/api/shopApi'
import type { ProductFilters } from '@/features/shop/types/product'
import { QUERY_KEYS } from '@/shared/constants/queryKeys'

export function useProductList(filters: ProductFilters = {}) {
  const { i18n } = useTranslation()
  return useQuery({
    queryKey: [...QUERY_KEYS.products.list(filters), i18n.language],
    queryFn: () => productsApi.list(filters),
  })
}

export function useProduct(id: string) {
  const { i18n } = useTranslation()
  return useQuery({
    queryKey: [...QUERY_KEYS.products.detail(id), i18n.language],
    queryFn: () => productsApi.detail(id),
    enabled: Boolean(id),
  })
}
