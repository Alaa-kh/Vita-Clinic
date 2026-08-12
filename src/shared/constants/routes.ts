export const ROUTES = {
  home: '/',
  shop: '/shop',
  productDetail: '/shop/:id',
  cart: '/cart',
  checkout: '/checkout',
  orders: '/orders',
  trackOrder: '/orders/:id/track',
  favorites: '/favorites',
  createProduct: '/listings/new',
  /** @deprecated */
  care: '/shop',
  careDetail: '/shop/:id',
  createCare: '/listings/new',
  login: '/login',
  register: '/register',
  profile: '/profile',
  platform: '/platform',
  maps: '/platform/maps',
  booking: '/platform/booking',
  payments: '/platform/payments',
  chat: '/platform/chat',
  call: '/platform/call',
  ai: '/platform/ai',
  analytics: '/platform/analytics',
  notifications: '/platform/notifications',
  storage: '/platform/storage',
  security: '/platform/security',
} as const

export function productDetailPath(id: string): string {
  return `/shop/${id}`
}

export function trackOrderPath(id: string): string {
  return `/orders/${id}/track`
}

/** @deprecated */
export function careDetailPath(id: string): string {
  return productDetailPath(id)
}
