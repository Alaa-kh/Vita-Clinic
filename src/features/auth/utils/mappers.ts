import type { User, UserDto } from '@/features/auth/types/user'

export function mapUserDto(dto: UserDto): User {
  return {
    id: dto.id,
    email: dto.email,
    fullName: dto.fullName,
    role: dto.role,
    phone: dto.phone,
    createdAt: dto.createdAt,
  }
}
