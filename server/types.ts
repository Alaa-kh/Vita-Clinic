export type UserRole = 'customer' | 'merchant' | 'courier' | 'admin'

export interface UserRecord {
  id: string
  email: string
  passwordHash: string
  fullName: string
  role: UserRole
  phone: string | null
  totpSecret: string | null
  totpEnabled: boolean
  oauthProvider: 'google' | 'apple' | null
  createdAt: string
}

export type ProductStatus = 'in_stock' | 'low_stock' | 'out_of_stock'
export type Fulfillment = 'delivery' | 'pickup' | 'both'
export type ProductCategory =
  | 'food'
  | 'grocery'
  | 'electronics'
  | 'fashion'
  | 'pharmacy'
  | 'home'
  | 'beauty'
  | 'sports'
export type CurrencyCode = 'USD' | 'AED' | 'SAR' | 'EUR'

export interface ProductRecord {
  id: string
  title: string
  titleAr: string
  description: string
  descriptionAr: string
  price: number
  currency: CurrencyCode
  category: ProductCategory
  fulfillment: Fulfillment
  status: ProductStatus
  stock: number
  storeName: string
  storeNameAr: string
  city: string
  country: string
  address: string
  images: string[]
  tags: string[]
  merchantId: string
  featured: boolean
  rating: number
  prepMinutes: number
  lat: number
  lng: number
  createdAt: string
  updatedAt: string
}

/** @deprecated alias kept for maps/analytics adapters */
export type CareRecord = ProductRecord
export type CareStatus = ProductStatus
export type CareMode = Fulfillment
export type Specialty = ProductCategory

export interface BranchRecord {
  id: string
  name: string
  city: string
  address: string
  phone: string
  lat: number
  lng: number
  hours: string
  geofenceRadiusM: number
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type BookingRecurrence = 'none' | 'weekly' | 'biweekly' | 'monthly'

export interface BookingRecord {
  id: string
  userId: string
  careId: string
  branchId: string | null
  date: string
  slot: string
  status: BookingStatus
  recurrence: BookingRecurrence
  notes: string | null
  reminderAt: string | null
  createdAt: string
  updatedAt: string
}

export type PaymentStatus = 'pending' | 'succeeded' | 'refunded' | 'failed'
export type PaymentMethod = 'card' | 'apple_pay' | 'google_pay' | 'paypal' | 'stripe'

export interface PaymentRecord {
  id: string
  userId: string
  bookingId: string | null
  orderId: string | null
  amount: number
  currency: CurrencyCode
  status: PaymentStatus
  method: PaymentMethod
  stripePaymentIntentId: string | null
  invoiceNumber: string
  createdAt: string
  refundedAt: string | null
}

export interface SavedCardRecord {
  id: string
  userId: string
  brand: string
  last4: string
  expMonth: number
  expYear: number
  isDefault: boolean
}

export interface NotificationRecord {
  id: string
  userId: string
  title: string
  body: string
  channel: 'in_app' | 'email' | 'sms' | 'push'
  read: boolean
  scheduledFor: string | null
  createdAt: string
}

export interface ChatMessageRecord {
  id: string
  roomId: string
  senderId: string
  senderName: string
  body: string
  createdAt: string
}

export interface DeviceSessionRecord {
  id: string
  userId: string
  deviceLabel: string
  ip: string
  userAgent: string
  lastActiveAt: string
  createdAt: string
  revokedAt: string | null
}

export interface AuditLogRecord {
  id: string
  userId: string | null
  action: string
  resource: string
  meta: Record<string, unknown>
  createdAt: string
}

export interface FileRecord {
  id: string
  userId: string
  originalName: string
  mimeType: string
  size: number
  url: string
  compressed: boolean
  createdAt: string
}

export interface LiveTrackRecord {
  id: string
  userId: string
  orderId: string | null
  lat: number
  lng: number
  heading: number
  speed: number
  updatedAt: string
}

export interface CartItemRecord {
  productId: string
  quantity: number
}

export interface CartRecord {
  userId: string
  items: CartItemRecord[]
  updatedAt: string
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'

export interface OrderItemRecord {
  productId: string
  title: string
  quantity: number
  unitPrice: number
  currency: CurrencyCode
}

export interface OrderRecord {
  id: string
  userId: string
  merchantId: string
  courierId: string | null
  items: OrderItemRecord[]
  status: OrderStatus
  subtotal: number
  deliveryFee: number
  total: number
  currency: CurrencyCode
  deliveryAddress: string
  city: string
  lat: number
  lng: number
  notes: string | null
  etaMinutes: number
  etaAt: string
  createdAt: string
  updatedAt: string
}

export interface Database {
  users: UserRecord[]
  products: ProductRecord[]
  /** @deprecated use products */
  care: ProductRecord[]
  favorites: Array<{ userId: string; careId: string }>
  carts: CartRecord[]
  orders: OrderRecord[]
  branches: BranchRecord[]
  bookings: BookingRecord[]
  payments: PaymentRecord[]
  savedCards: SavedCardRecord[]
  notifications: NotificationRecord[]
  chatMessages: ChatMessageRecord[]
  sessions: DeviceSessionRecord[]
  auditLogs: AuditLogRecord[]
  files: FileRecord[]
  liveTracks: LiveTrackRecord[]
  otps: Array<{ email: string; code: string; expiresAt: number }>
  featureFlags: Record<string, boolean>
  rateLimitHits: Map<string, number[]>
}
