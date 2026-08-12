import type { Product, ProductDto } from '@/features/shop/types/product'

function isArabicLocale(locale: string): boolean {
  return locale.toLowerCase().startsWith('ar')
}

export function mapProductDto(dto: ProductDto, locale: string): Product {
  const arabic = isArabicLocale(locale)
  return {
    id: dto.id,
    title: arabic ? dto.titleAr || dto.title : dto.title,
    description: arabic ? dto.descriptionAr || dto.description : dto.description,
    price: dto.price,
    currency: dto.currency,
    category: dto.category,
    fulfillment: dto.fulfillment,
    status: dto.status,
    stock: dto.stock,
    storeName: arabic ? dto.storeNameAr || dto.storeName : dto.storeName,
    city: dto.city,
    country: dto.country,
    address: dto.address,
    images: dto.images.filter(Boolean),
    tags: dto.tags,
    merchantId: dto.merchantId,
    featured: dto.featured,
    rating: dto.rating,
    prepMinutes: dto.prepMinutes,
    lat: dto.lat,
    lng: dto.lng,
    isFavorite: dto.isFavorite,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  }
}
