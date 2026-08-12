export type UserRole = 'customer' | 'merchant' | 'courier' | 'admin'

export interface User {
  id: string
  email: string
  fullName: string
  role: UserRole
  phone: string | null
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthSession extends AuthTokens {
  user: User
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  email: string
  password: string
  fullName: string
  role: UserRole
  phone?: string
}

export interface UserDto {
  id: string
  email: string
  fullName: string
  role: UserRole
  phone: string | null
  createdAt: string
}

export interface AuthResponseDto {
  user: UserDto
  accessToken: string
  refreshToken: string
}
