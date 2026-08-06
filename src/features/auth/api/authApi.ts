import { apiClient } from '@/shared/api/apiClient'
import type {
  AuthResponseDto,
  LoginInput,
  RegisterInput,
  UserDto,
} from '@/features/auth/types/user'

export const authApi = {
  login(input: LoginInput) {
    return apiClient.post<AuthResponseDto>('/auth/login', input)
  },
  register(input: RegisterInput) {
    return apiClient.post<AuthResponseDto>('/auth/register', input)
  },
  me() {
    return apiClient.get<{ user: UserDto }>('/auth/me')
  },
  refresh(refreshToken: string) {
    return apiClient.post<AuthResponseDto>('/auth/refresh', { refreshToken })
  },
}
