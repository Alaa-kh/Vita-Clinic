import type { CareFilters } from '@/features/care/types/care'

export const QUERY_KEYS = {
  care: {
    all: ['care'] as const,
    list: (filters: CareFilters) => ['care', 'list', filters] as const,
    detail: (id: string) => ['care', 'detail', id] as const,
  },
  favorites: {
    all: ['favorites'] as const,
  },
  auth: {
    me: ['auth', 'me'] as const,
  },
} as const
