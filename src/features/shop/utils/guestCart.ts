import { STORAGE_KEYS } from '@/shared/constants/storageKeys'
import type { CartLine, CartSummary, Product } from '@/features/shop/types/product'

interface GuestCartItem {
  productId: string
  quantity: number
  snapshot: Pick<
    Product,
    | 'title'
    | 'price'
    | 'currency'
    | 'images'
    | 'prepMinutes'
    | 'storeName'
    | 'merchantId'
    | 'lat'
    | 'lng'
  >
}

function readRaw(): GuestCartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.guestCart)
    if (!raw) return []
    const parsed = JSON.parse(raw) as GuestCartItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeRaw(items: GuestCartItem[]): void {
  localStorage.setItem(STORAGE_KEYS.guestCart, JSON.stringify(items))
}

export function getGuestCartSummary(): CartSummary {
  const items = readRaw()
  const lines: CartLine[] = items.map((item) => ({
    productId: item.productId,
    title: item.snapshot.title,
    price: item.snapshot.price,
    currency: item.snapshot.currency,
    image: item.snapshot.images[0] ?? null,
    quantity: item.quantity,
    lineTotal: item.snapshot.price * item.quantity,
    prepMinutes: item.snapshot.prepMinutes,
    storeName: item.snapshot.storeName,
    merchantId: item.snapshot.merchantId,
  }))

  return {
    items: lines,
    subtotal: lines.reduce((sum, line) => sum + line.lineTotal, 0),
    currency: lines[0]?.currency ?? 'SAR',
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
  }
}

export function addGuestCartItem(product: Product, quantity = 1): CartSummary {
  const items = readRaw()
  const existing = items.find((item) => item.productId === product.id)
  if (existing) {
    existing.quantity = Math.min(99, existing.quantity + quantity)
  } else {
    items.push({
      productId: product.id,
      quantity,
      snapshot: {
        title: product.title,
        price: product.price,
        currency: product.currency,
        images: product.images,
        prepMinutes: product.prepMinutes,
        storeName: product.storeName,
        merchantId: product.merchantId,
        lat: product.lat,
        lng: product.lng,
      },
    })
  }
  writeRaw(items)
  return getGuestCartSummary()
}

export function updateGuestCartItem(productId: string, quantity: number): CartSummary {
  let items = readRaw()
  if (quantity <= 0) {
    items = items.filter((item) => item.productId !== productId)
  } else {
    const line = items.find((item) => item.productId === productId)
    if (line) line.quantity = Math.min(99, quantity)
  }
  writeRaw(items)
  return getGuestCartSummary()
}

export function clearGuestCart(): void {
  localStorage.removeItem(STORAGE_KEYS.guestCart)
}

export function getGuestCartEntries(): Array<{ productId: string; quantity: number }> {
  return readRaw().map(({ productId, quantity }) => ({ productId, quantity }))
}
