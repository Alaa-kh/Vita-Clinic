import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Database } from '../types.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const STORE_PATH = path.resolve(__dirname, 'store.json')

type PersistSlice = Pick<
  Database,
  'products' | 'orders' | 'favorites' | 'carts' | 'notifications' | 'featureFlags'
>

export function loadPersistedSlice(): PersistSlice | null {
  try {
    if (!fs.existsSync(STORE_PATH)) return null
    const raw = fs.readFileSync(STORE_PATH, 'utf8')
    const parsed = JSON.parse(raw) as PersistSlice
    if (!Array.isArray(parsed.products) || parsed.products.length === 0) return null
    return parsed
  } catch {
    return null
  }
}

export function savePersistedSlice(db: Database): void {
  const slice: PersistSlice = {
    products: db.products,
    orders: db.orders,
    favorites: db.favorites,
    carts: db.carts,
    notifications: db.notifications,
    featureFlags: db.featureFlags,
  }
  fs.writeFileSync(STORE_PATH, JSON.stringify(slice, null, 2), 'utf8')
}

export function schedulePersist(db: Database): void {
  const run = () => {
    try {
      savePersistedSlice(db)
    } catch {
      // ignore disk errors in local demo mode
    }
  }
  run()
  setInterval(run, 15_000).unref?.()
}
