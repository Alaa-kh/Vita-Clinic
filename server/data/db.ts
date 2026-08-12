import bcrypt from 'bcryptjs'
import { randomUUID } from 'node:crypto'
import { PRODUCT_SEEDS } from './productSeed.js'
import { loadPersistedSlice, schedulePersist } from './persist.js'
import { coordsForCity, seedPlatformCollections } from './platformSeed.js'
import type { Database, ProductRecord, UserRecord } from '../types.js'

const db: Database = {
  users: [],
  products: [],
  care: [],
  favorites: [],
  carts: [],
  orders: [],
  branches: [],
  bookings: [],
  payments: [],
  savedCards: [],
  notifications: [],
  chatMessages: [],
  sessions: [],
  auditLogs: [],
  files: [],
  liveTracks: [],
  otps: [],
  featureFlags: {},
  rateLimitHits: new Map(),
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

export function findProductById(id: string): ProductRecord | undefined {
  return db.products.find((item) => item.id === id)
}

export function findCareById(id: string): ProductRecord | undefined {
  return findProductById(id)
}

export function pushAudit(
  userId: string | null,
  action: string,
  resource: string,
  meta: Record<string, unknown> = {},
): void {
  db.auditLogs.unshift({
    id: randomUUID(),
    userId,
    action,
    resource,
    meta,
    createdAt: new Date().toISOString(),
  })
  if (db.auditLogs.length > 500) db.auditLogs.length = 500
}

export function getOrCreateCart(userId: string) {
  let cart = db.carts.find((c) => c.userId === userId)
  if (!cart) {
    cart = { userId, items: [], updatedAt: new Date().toISOString() }
    db.carts.push(cart)
  }
  return cart
}

export function seedDatabase(): void {
  if (seeded) return

  const passwordHash = bcrypt.hashSync('Password123!', 10)

  const merchant: UserRecord = {
    id: randomUUID(),
    email: 'merchant@barq.app',
    passwordHash,
    fullName: 'BARQ Merchant',
    role: 'merchant',
    phone: '+966501112233',
    totpSecret: null,
    totpEnabled: false,
    oauthProvider: null,
    createdAt: new Date().toISOString(),
  }

  const customer: UserRecord = {
    id: randomUUID(),
    email: 'customer@barq.app',
    passwordHash,
    fullName: 'Sara Al-Harbi',
    role: 'customer',
    phone: '+966509998877',
    totpSecret: null,
    totpEnabled: false,
    oauthProvider: null,
    createdAt: new Date().toISOString(),
  }

  const courier: UserRecord = {
    id: randomUUID(),
    email: 'courier@barq.app',
    passwordHash,
    fullName: 'Omar Courier',
    role: 'courier',
    phone: '+966507778899',
    totpSecret: null,
    totpEnabled: false,
    oauthProvider: null,
    createdAt: new Date().toISOString(),
  }

  const admin: UserRecord = {
    id: randomUUID(),
    email: 'admin@barq.app',
    passwordHash,
    fullName: 'BARQ Admin',
    role: 'admin',
    phone: '+966500000000',
    totpSecret: null,
    totpEnabled: false,
    oauthProvider: null,
    createdAt: new Date().toISOString(),
  }

  db.users.push(merchant, customer, courier, admin)
  seedPlatformCollections(db)

  const now = new Date().toISOString()
  const persisted = loadPersistedSlice()
  const canReuseCatalog =
    Boolean(persisted?.products?.length) &&
    (persisted?.products.length ?? 0) >= PRODUCT_SEEDS.length

  if (canReuseCatalog && persisted) {
    db.products = persisted.products
    db.orders = persisted.orders ?? []
    db.favorites = persisted.favorites ?? []
    db.carts = persisted.carts ?? []
    db.notifications = persisted.notifications ?? []
    db.featureFlags = {
      ...db.featureFlags,
      ...persisted.featureFlags,
      ecommerce: true,
      delivery: true,
      liveTracking: true,
      cart: true,
    }
  } else {
    for (const seed of PRODUCT_SEEDS) {
      const coords = coordsForCity(seed.city)
      const product: ProductRecord = {
        ...seed,
        ...coords,
        id: randomUUID(),
        merchantId: merchant.id,
        createdAt: now,
        updatedAt: now,
      }
      db.products.push(product)
    }

    if (persisted) {
      db.orders = persisted.orders ?? []
      db.carts = persisted.carts ?? []
    }

    if (db.products[0]) {
      db.favorites.push({ userId: customer.id, careId: db.products[0].id })
    }
    if (db.products[2]) {
      db.favorites.push({ userId: customer.id, careId: db.products[2].id })
    }

    db.notifications.push(
      {
        id: randomUUID(),
        userId: customer.id,
        title: 'Welcome to BARQ',
        body: 'Shop, checkout, and track live delivery on the map.',
        channel: 'in_app',
        read: false,
        scheduledFor: null,
        createdAt: now,
      },
      {
        id: randomUUID(),
        userId: customer.id,
        title: 'Free delivery today',
        body: 'Orders over 100 SAR — no delivery fee until midnight.',
        channel: 'push',
        read: false,
        scheduledFor: null,
        createdAt: now,
      },
    )

    db.featureFlags = {
      ...db.featureFlags,
      ecommerce: true,
      delivery: true,
      liveTracking: true,
      cart: true,
    }
  }

  // Keep care synced for legacy platform adapters
  db.care = db.products

  db.savedCards.push({
    id: randomUUID(),
    userId: customer.id,
    brand: 'visa',
    last4: '4242',
    expMonth: 12,
    expYear: 2028,
    isDefault: true,
  })

  schedulePersist(db)
  seeded = true
}
