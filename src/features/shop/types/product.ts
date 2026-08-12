export type ProductCategory =
  | 'food'
  | 'grocery'
  | 'electronics'
  | 'fashion'
  | 'pharmacy'
  | 'home'
  | 'beauty'
  | 'sports'

export type Fulfillment = 'delivery' | 'pickup' | 'both'
export type ProductStatus = 'in_stock' | 'low_stock' | 'out_of_stock'
export type CurrencyCode = 'USD' | 'AED' | 'SAR' | 'EUR'

export interface ProductDto {
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
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  title: string
  description: string
  price: number
  currency: CurrencyCode
  category: ProductCategory
  fulfillment: Fulfillment
  status: ProductStatus
  stock: number
  storeName: string
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
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductFilters {
  q?: string
  category?: ProductCategory | ''
  fulfillment?: Fulfillment | ''
  city?: string
  minPrice?: string
  maxPrice?: string
  featured?: boolean
  page?: number
  pageSize?: number
}

export interface ProductListResult {
  items: Product[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface CartLine {
  productId: string
  title: string
  price: number
  currency: string
  image: string | null
  quantity: number
  lineTotal: number
  prepMinutes: number
  storeName: string
  merchantId: string
}

export interface CartSummary {
  items: CartLine[]
  subtotal: number
  currency: string
  itemCount: number
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'

export interface Order {
  id: string
  userId: string
  merchantId: string
  courierId: string | null
  items: Array<{
    productId: string
    title: string
    quantity: number
    unitPrice: number
    currency: string
  }>
  status: OrderStatus
  subtotal: number
  deliveryFee: number
  total: number
  currency: string
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
