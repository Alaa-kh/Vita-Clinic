export type UserRole = 'patient' | 'provider'

export interface UserRecord {
  id: string
  email: string
  passwordHash: string
  fullName: string
  role: UserRole
  phone: string | null
  createdAt: string
}

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

export interface CareRecord {
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
  createdAt: string
  updatedAt: string
}

export interface Database {
  users: UserRecord[]
  care: CareRecord[]
  favorites: Array<{ userId: string; careId: string }>
}
