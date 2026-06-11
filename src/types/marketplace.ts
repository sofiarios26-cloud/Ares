import type { Product, Profile } from '@/types/database'
import type { ProductSort } from '@/constants/marketplace'

export type SellerPreview = Pick<
  Profile,
  'id' | 'username' | 'avatar' | 'location' | 'rating' | 'bio'
>

export type ProductWithSeller = Product & {
  seller: SellerPreview | null
}

export type ProductFilters = {
  search?: string
  category?: string
  sort?: ProductSort
  userId?: string
}

export type CreateProductInput = {
  title: string
  description: string
  category: string
  size: string
  brand: string
  color: string
  location: string
  price: number
  images: string[]
}
