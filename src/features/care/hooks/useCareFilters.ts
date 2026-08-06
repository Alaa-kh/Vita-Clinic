import { useCallback, useMemo, useState } from 'react'
import type { CareFilters, CareMode, Specialty } from '@/features/care/types/care'

const DEFAULT_FILTERS: CareFilters = {
  q: '',
  specialty: '',
  careMode: '',
  city: '',
  minPrice: '',
  maxPrice: '',
  page: 1,
  pageSize: 12,
}

export function useCareFilters(initial?: Partial<CareFilters>) {
  const [filters, setFilters] = useState<CareFilters>({
    ...DEFAULT_FILTERS,
    ...initial,
  })

  const setQuery = useCallback((q: string) => {
    setFilters((prev) => ({ ...prev, q, page: 1 }))
  }, [])

  const setSpecialty = useCallback((specialty: Specialty | '') => {
    setFilters((prev) => ({ ...prev, specialty, page: 1 }))
  }, [])

  const setCareMode = useCallback((careMode: CareMode | '') => {
    setFilters((prev) => ({ ...prev, careMode, page: 1 }))
  }, [])

  const setCity = useCallback((city: string) => {
    setFilters((prev) => ({ ...prev, city, page: 1 }))
  }, [])

  const setMinPrice = useCallback((minPrice: string) => {
    setFilters((prev) => ({ ...prev, minPrice, page: 1 }))
  }, [])

  const setMaxPrice = useCallback((maxPrice: string) => {
    setFilters((prev) => ({ ...prev, maxPrice, page: 1 }))
  }, [])

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }, [])

  const clear = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS })
  }, [])

  const queryFilters = useMemo(() => filters, [filters])

  return {
    filters: queryFilters,
    setQuery,
    setSpecialty,
    setCareMode,
    setCity,
    setMinPrice,
    setMaxPrice,
    setPage,
    clear,
  }
}
