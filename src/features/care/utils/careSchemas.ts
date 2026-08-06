import { z } from 'zod'

export const createCareSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(20),
  price: z.coerce.number().min(0),
  currency: z.enum(['USD', 'AED', 'SAR', 'EUR']),
  careMode: z.enum(['in_person', 'telehealth', 'home_visit']),
  specialty: z.enum([
    'general',
    'cardiology',
    'dermatology',
    'pediatrics',
    'orthopedics',
    'dentistry',
    'ophthalmology',
    'neurology',
    'mental',
    'gynecology',
    'ent',
    'emergency',
  ]),
  experienceYears: z.coerce.number().min(0).max(60),
  languages: z.string().min(2),
  city: z.string().min(2),
  country: z.string().min(2),
  clinicName: z.string().min(2),
  address: z.string().min(5),
  imageUrl: z.string().url().or(z.literal('')),
  tags: z.string(),
  featured: z.boolean(),
})

export type CreateCareFormValues = z.infer<typeof createCareSchema>
