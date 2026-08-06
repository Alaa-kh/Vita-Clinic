import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { favoritesService } from '@/features/favorites/services/favoritesService'
import { QUERY_KEYS } from '@/shared/constants/queryKeys'
import { ROUTES } from '@/shared/constants/routes'

export function useToggleFavorite() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({ careId, isFavorite }: { careId: string; isFavorite: boolean }) => {
      if (isFavorite) {
        await favoritesService.remove(careId)
        return false
      }
      await favoritesService.add(careId)
      return true
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.care.all }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.favorites.all }),
      ])
    },
  })

  const toggleFavorite = async (careId: string, isFavorite: boolean) => {
    if (!isAuthenticated) {
      navigate(ROUTES.login)
      return
    }
    await mutation.mutateAsync({ careId, isFavorite })
  }

  return {
    toggleFavorite,
    isPending: mutation.isPending,
  }
}
