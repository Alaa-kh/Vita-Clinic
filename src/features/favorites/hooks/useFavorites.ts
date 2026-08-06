import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { favoritesService } from '@/features/favorites/services/favoritesService'
import { QUERY_KEYS } from '@/shared/constants/queryKeys'

export function useFavorites() {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: QUERY_KEYS.favorites.all,
    queryFn: () => favoritesService.list(),
    enabled: isAuthenticated,
  })
}
