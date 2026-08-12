import type { CareFilters } from '@/features/care/types/care'
import type { ProductFilters } from '@/features/shop/types/product'

export const QUERY_KEYS = {
  care: {
    all: ['care'] as const,
    list: (filters: CareFilters) => ['care', 'list', filters] as const,
    detail: (id: string) => ['care', 'detail', id] as const,
  },
  products: {
    all: ['products'] as const,
    list: (filters: ProductFilters) => ['products', 'list', filters] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
  },
  cart: {
    all: ['cart'] as const,
  },
  orders: {
    mine: ['orders', 'mine'] as const,
    detail: (id: string) => ['orders', 'detail', id] as const,
    track: (id: string) => ['orders', 'track', id] as const,
  },
  favorites: {
    all: ['favorites'] as const,
  },
  auth: {
    me: ['auth', 'me'] as const,
  },
  bookings: {
    mine: ['bookings', 'mine'] as const,
    slots: (careId: string, date: string) => ['bookings', 'slots', careId, date] as const,
  },
  payments: {
    mine: ['payments', 'mine'] as const,
    cards: ['payments', 'cards'] as const,
  },
  maps: {
    branches: ['maps', 'branches'] as const,
    providers: ['maps', 'providers'] as const,
    heatmap: ['maps', 'heatmap'] as const,
    clusters: (zoom: number) => ['maps', 'clusters', zoom] as const,
  },
  notifications: {
    all: ['notifications'] as const,
  },
  analytics: {
    dashboard: ['analytics', 'dashboard'] as const,
  },
  storage: {
    files: ['storage', 'files'] as const,
  },
  security: {
    sessions: ['security', 'sessions'] as const,
    audit: ['security', 'audit'] as const,
    permissions: ['security', 'permissions'] as const,
  },
  platform: {
    flags: ['platform', 'flags'] as const,
  },
} as const
