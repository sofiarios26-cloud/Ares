export const PRODUCT_CATEGORIES = [
  'Deportiva',
  'Vintage',
  'Mundial',
  'Invierno',
  'Verano',
  'Accesorios',
  'Urbano',
  'Calzado',
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

export const PRODUCT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Único'] as const

export type ProductSize = (typeof PRODUCT_SIZES)[number]

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Más recientes' },
  { value: 'oldest', label: 'Más antiguos' },
  { value: 'price_asc', label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
  { value: 'likes', label: 'Más likes' },
] as const

export type ProductSort = (typeof SORT_OPTIONS)[number]['value']

export const PAGE_SIZE = 10
export const MAX_PRODUCT_IMAGES = 6
