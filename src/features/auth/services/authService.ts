import { authApi } from '@/features/auth/api/authApi'
import type { AuthSession, LoginInput, RegisterInput, User } from '@/features/auth/types/user'
import { mapUserDto } from '@/features/auth/utils/mappers'
import { mapApiError } from '@/shared/errors/mapApiError'

export const authService = {
  async login(input: LoginInput): Promise<AuthSession> {
    try {
      const { data } = await authApi.login(input)
      return {
        user: mapUserDto(data.user),
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      }
    } catch (error) {
      throw mapApiError(error)
    }
  },

  async register(input: RegisterInput): Promise<AuthSession> {
    try {
      const { data } = await authApi.register(input)
      return {
        user: mapUserDto(data.user),
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      }
    } catch (error) {
      throw mapApiError(error)
    }
  },

  async getCurrentUser(): Promise<User> {
    try {
      const { data } = await authApi.me()
      return mapUserDto(data.user)
    } catch (error) {
      throw mapApiError(error)
    }
  },
}
