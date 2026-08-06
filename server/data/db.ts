import bcrypt from 'bcryptjs'
import { randomUUID } from 'node:crypto'
import type { CareRecord, Database, UserRecord } from '../types.js'

const db: Database = {
  users: [],
  care: [],
  favorites: [],
}

let seeded = false

export function getDb(): Database {
  return db
}

export function findUserByEmail(email: string): UserRecord | undefined {
  return db.users.find((user) => user.email.toLowerCase() === email.toLowerCase())
}

export function findUserById(id: string): UserRecord | undefined {
  return db.users.find((user) => user.id === id)
}

export function findCareById(id: string): CareRecord | undefined {
  return db.care.find((item) => item.id === id)
}

export function seedDatabase(): void {
  if (seeded) return

  const passwordHash = bcrypt.hashSync('Password123!', 10)

  const provider: UserRecord = {
    id: randomUUID(),
    email: 'provider@vita.care',
    passwordHash,
    fullName: 'د. مايا رحمة',
    role: 'provider',
    phone: '+966501112233',
    createdAt: new Date().toISOString(),
  }

  const patient: UserRecord = {
    id: randomUUID(),
    email: 'patient@vita.care',
    passwordHash,
    fullName: 'عمر فرحات',
    role: 'patient',
    phone: '+966509998877',
    createdAt: new Date().toISOString(),
  }

  db.users.push(provider, patient)

  const now = new Date().toISOString()
  const seedCare: Omit<CareRecord, 'id' | 'providerId' | 'createdAt' | 'updatedAt'>[] = [
    {
      title: 'زراعة الأسنان شامل الخطة العلاجية',
      description:
        'زراعة أسنان بتقنيات حديثة مع خطة علاجية كاملة ومتابعة بعد الإجراء في عيادات فيتا.',
      price: 1599,
      currency: 'SAR',
      careMode: 'in_person',
      specialty: 'dentistry',
      status: 'available',
      experienceYears: 12,
      languages: ['Arabic', 'English'],
      city: 'Riyadh',
      country: 'Saudi Arabia',
      clinicName: 'فيتا الأسنان — الرياض',
      address: 'حي النرجس، شارع أنس بن مالك',
      images: ['https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=1200&q=80'],
      tags: ['عرض الصيف', 'زراعة', 'خطة علاجية'],
      featured: true,
    },
    {
      title: 'تركيبات الزيركون الألمانية',
      description: 'تركيبات زيركون ألمانية عالية الجودة لمظهر طبيعي ومتانة طويلة الأمد.',
      price: 599,
      currency: 'SAR',
      careMode: 'in_person',
      specialty: 'dentistry',
      status: 'available',
      experienceYears: 10,
      languages: ['Arabic', 'English'],
      city: 'Jeddah',
      country: 'Saudi Arabia',
      clinicName: 'فيتا الأسنان — جدة',
      address: 'حي الشاطئ، شارع الأمير سلطان',
      images: ['https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1200&q=80'],
      tags: ['زيركون', 'عرض الصيف'],
      featured: true,
    },
    {
      title: 'تنظيف وتبييض الأسنان بالليزر',
      description: 'جلسة تنظيف عميق مع تبييض ليزر لنتيجة فورية وابتسامة أفتح.',
      price: 549,
      currency: 'SAR',
      careMode: 'in_person',
      specialty: 'dentistry',
      status: 'available',
      experienceYears: 8,
      languages: ['Arabic', 'English'],
      city: 'Khobar',
      country: 'Saudi Arabia',
      clinicName: 'فيتا الأسنان — الخبر',
      address: 'الخبر الشمالية، شارع البيبسي',
      images: ['https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=1200&q=80'],
      tags: ['تبييض', 'ليزر', 'عرض'],
      featured: true,
    },
    {
      title: 'تقويم الأسنان',
      description: 'تقويم شفاف أو تقليدي حسب الحالة مع متابعة دورية حتى النتيجة النهائية.',
      price: 2699,
      currency: 'SAR',
      careMode: 'in_person',
      specialty: 'dentistry',
      status: 'available',
      experienceYears: 11,
      languages: ['Arabic', 'English'],
      city: 'Dammam',
      country: 'Saudi Arabia',
      clinicName: 'فيتا الأسنان — الدمام',
      address: 'حي طيبة، طريق الملك فهد',
      images: ['https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=1200&q=80'],
      tags: ['تقويم', 'ابتسامة'],
      featured: true,
    },
    {
      title: '1 مل فيلر جوفيديرم',
      description: 'فيلر جوفيديرم أصلي لتعبئة وتحديد الوجه مع نتائج طبيعية.',
      price: 900,
      currency: 'SAR',
      careMode: 'in_person',
      specialty: 'dermatology',
      status: 'available',
      experienceYears: 9,
      languages: ['Arabic', 'English'],
      city: 'Riyadh',
      country: 'Saudi Arabia',
      clinicName: 'فيتا الجلدية — الرياض',
      address: 'حي البديعة',
      images: ['https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&q=80'],
      tags: ['فيلر', 'تجميل', 'عرض'],
      featured: true,
    },
    {
      title: 'بوتوكس وجه كامل مع ماسك كولاجين',
      description: 'بوتوكس لتهدئة التجاعيد مع ماسك كولاجين للنضارة بعد الجلسة.',
      price: 1100,
      currency: 'SAR',
      careMode: 'in_person',
      specialty: 'dermatology',
      status: 'available',
      experienceYears: 10,
      languages: ['Arabic', 'English'],
      city: 'Jeddah',
      country: 'Saudi Arabia',
      clinicName: 'فيتا الجلدية — جدة',
      address: 'حي المروة',
      images: ['https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1200&q=80'],
      tags: ['بوتوكس', 'نضارة'],
      featured: true,
    },
    {
      title: '3 جلسات ليزر إزالة الشعر',
      description: 'باقة ثلاث جلسات ليزر لمناطق مختارة بتقنيات آمنة للنساء والرجال.',
      price: 800,
      currency: 'SAR',
      careMode: 'in_person',
      specialty: 'dermatology',
      status: 'available',
      experienceYears: 7,
      languages: ['Arabic'],
      city: 'Riyadh',
      country: 'Saudi Arabia',
      clinicName: 'فيتا الليزر — الرياض',
      address: 'ظهرة لبن',
      images: ['https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=1200&q=80'],
      tags: ['ليزر', 'باقة'],
      featured: true,
    },
    {
      title: 'زراعة الشعر حتى 2000 بصيلة',
      description: 'زراعة شعر بتقنيات متقدمة ونتائج مضمونة مع متابعة ما بعد الزراعة.',
      price: 4999,
      currency: 'SAR',
      careMode: 'in_person',
      specialty: 'dermatology',
      status: 'available',
      experienceYears: 14,
      languages: ['Arabic', 'English'],
      city: 'Riyadh',
      country: 'Saudi Arabia',
      clinicName: 'فيتا زراعة الشعر',
      address: 'حي الملقا',
      images: ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80'],
      tags: ['زراعة شعر', 'حملة'],
      featured: true,
    },
    {
      title: 'جلسة بلازما للوجه أو الشعر',
      description: 'بلازما غنية بالصفائح لتحفيز النضارة أو تقوية فروة الرأس.',
      price: 500,
      currency: 'SAR',
      careMode: 'in_person',
      specialty: 'dermatology',
      status: 'available',
      experienceYears: 6,
      languages: ['Arabic'],
      city: 'Khobar',
      country: 'Saudi Arabia',
      clinicName: 'فيتا الجلدية — الخبر',
      address: 'العقربية',
      images: ['https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=1200&q=80'],
      tags: ['بلازما', 'عرض'],
      featured: false,
    },
    {
      title: 'كشف طبي عام مع استشارة',
      description: 'كشف مع طبيب عام وتشخيص أولي وخطة متابعة واضحة.',
      price: 150,
      currency: 'SAR',
      careMode: 'in_person',
      specialty: 'general',
      status: 'available',
      experienceYears: 12,
      languages: ['Arabic', 'English'],
      city: 'Dammam',
      country: 'Saudi Arabia',
      clinicName: 'فيتا الطبي — الدمام',
      address: 'الفيصلية',
      images: ['https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200&q=80'],
      tags: ['كشف', 'طبي'],
      featured: false,
    },
    {
      title: 'استشارة جلدية عن بُعد',
      description: 'استشارة فيديو آمنة مع أخصائي جلدية لمراجعة الصور والخطة العلاجية.',
      price: 120,
      currency: 'SAR',
      careMode: 'telehealth',
      specialty: 'dermatology',
      status: 'available',
      experienceYears: 9,
      languages: ['Arabic', 'English'],
      city: 'Remote',
      country: 'Online',
      clinicName: 'فيتا عن بُعد',
      address: 'جلسة فيديو مشفّرة',
      images: ['https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80'],
      tags: ['عن بعد', 'جلدية'],
      featured: true,
    },
    {
      title: 'د. سارة التركي — أسنان',
      description: 'استشارية أسنان خبرة واسعة في التجميل والزراعة وتقويم الحالات المعقدة.',
      price: 200,
      currency: 'SAR',
      careMode: 'in_person',
      specialty: 'dentistry',
      status: 'available',
      experienceYears: 15,
      languages: ['Arabic', 'English'],
      city: 'Jeddah',
      country: 'Saudi Arabia',
      clinicName: 'فيتا الأسنان — جدة المروة',
      address: 'شارع حراء، حي المروة',
      images: ['https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1200&q=80'],
      tags: ['طبيبة', 'استشارية'],
      featured: true,
    },
  ]

  for (const seed of seedCare) {
    db.care.push({
      ...seed,
      id: randomUUID(),
      providerId: provider.id,
      createdAt: now,
      updatedAt: now,
    })
  }

  if (db.care[0]) {
    db.favorites.push({ userId: patient.id, careId: db.care[0].id })
  }
  if (db.care[4]) {
    db.favorites.push({ userId: patient.id, careId: db.care[4].id })
  }

  seeded = true
}
