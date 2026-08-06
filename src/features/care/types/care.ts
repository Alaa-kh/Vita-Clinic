export type CareStatus = 'available' | 'busy' | 'unavailable'
export type CareMode = 'in_person' | 'telehealth' | 'home_visit'
export type Specialty =
  | 'general'
  | 'cardiology'
  | 'dermatology'
  | 'pediatrics'
  | 'orthopedics'
  | 'dentistry'
  | 'ophthalmology'
  | 'neurology'
  | 'mental'
  | 'gynecology'
  | 'ent'
  | 'emergency'
export type CurrencyCode = 'USD' | 'AED' | 'SAR' | 'EUR'

export interface Care {
  id: string
  title: string
  description: string
  price: number
  currency: CurrencyCode
  careMode: CareMode
  specialty: Specialty
  status: CareStatus
  experienceYears: number
  languages: string[]
  city: string
  country: string
  clinicName: string
  address: string
  images: string[]
  tags: string[]
  providerId: string
  featured: boolean
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}

export interface CareDto {
  id: string
  title: string
  description: string
  price: number
  currency: CurrencyCode
  careMode: CareMode
  specialty: Specialty
  status: CareStatus
  experienceYears: number
  languages: string[]
  city: string
  country: string
  clinicName: string
  address: string
  images: string[]
  tags: string[]
  providerId: string
  featured: boolean
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}

export interface CareFilters {
  q?: string
  specialty?: Specialty | ''
  careMode?: CareMode | ''
  city?: string
  minPrice?: string
  maxPrice?: string
  featured?: boolean
  page?: number
  pageSize?: number
}

export interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface CareListResult {
  items: Care[]
  pagination: Pagination
}

export interface CreateCareInput {
  title: string
  description: string
  price: number
  currency: CurrencyCode
  careMode: CareMode
  specialty: Specialty
  experienceYears: number
  languages: string[]
  city: string
  country: string
  clinicName: string
  address: string
  images: string[]
  tags: string[]
  featured: boolean
}
