import type { Care, CareDto } from '@/features/care/types/care'

export function mapCareDto(dto: CareDto): Care {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    price: dto.price,
    currency: dto.currency,
    careMode: dto.careMode,
    specialty: dto.specialty,
    status: dto.status,
    experienceYears: dto.experienceYears,
    languages: dto.languages,
    city: dto.city,
    country: dto.country,
    clinicName: dto.clinicName,
    address: dto.address,
    images: dto.images,
    tags: dto.tags,
    providerId: dto.providerId,
    featured: dto.featured,
    isFavorite: dto.isFavorite,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  }
}
