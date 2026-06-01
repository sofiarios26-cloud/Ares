import { PAGE_SIZE } from '@/constants/marketplace'
import { getSupabaseClient, isSupabaseReady } from '@/services/supabase/client'
import type { Product } from '@/types/database'
import type {
  CreateProductInput,
  ProductFilters,
  ProductWithSeller,
} from '@/types/marketplace'
import { mapAuthError } from '@/utils/auth-errors'

const SELLER_SELECT = 'id, username, avatar, location, rating, bio'

type ProductRow = Product & {
  profiles: ProductWithSeller['seller']
}

function mapProduct(row: ProductRow): ProductWithSeller {
  const { profiles, ...product } = row
  return { ...product, seller: profiles }
}

function buildProductsQuery(filters: ProductFilters) {
  let query = getSupabaseClient()
    .from('products')
    .select(`*, profiles!products_user_id_fkey(${SELLER_SELECT})`)

  if (filters.category) {
    query = query.eq('category', filters.category)
  }

  if (filters.userId) {
    query = query.eq('user_id', filters.userId)
  }

  if (filters.search?.trim()) {
    const term = filters.search.trim().replace(/[%_]/g, '')
    const pattern = `%${term}%`
    query = query.or(
      `title.ilike.${pattern},brand.ilike.${pattern},description.ilike.${pattern},category.ilike.${pattern}`,
    )
  }

  switch (filters.sort ?? 'newest') {
    case 'oldest':
      query = query.order('created_at', { ascending: true })
      break
    case 'price_asc':
      query = query.order('price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('price', { ascending: false })
      break
    case 'likes':
      query = query.order('likes', { ascending: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  return query
}

export const productsService = {
  async list(
    filters: ProductFilters = {},
    page = 0,
    pageSize = PAGE_SIZE,
  ): Promise<{ products: ProductWithSeller[]; hasMore: boolean }> {
    if (!isSupabaseReady()) {
      throw new Error('Supabase not configured')
    }

    const from = page * pageSize
    const to = from + pageSize - 1

    const { data, error } = await buildProductsQuery(filters).range(from, to)

    if (error) throw new Error(mapAuthError(error.message))

    const products = (data ?? []).map((row) => mapProduct(row as ProductRow))
    return { products, hasMore: products.length === pageSize }
  },

  async getById(id: string): Promise<ProductWithSeller | null> {
    if (!isSupabaseReady()) return null

    const { data, error } = await getSupabaseClient()
      .from('products')
      .select(`*, profiles!products_user_id_fkey(${SELLER_SELECT})`)
      .eq('id', id)
      .maybeSingle()

    if (error) throw new Error(mapAuthError(error.message))
    if (!data) return null
    return mapProduct(data as ProductRow)
  },

  async getRelated(
    productId: string,
    category: string,
    limit = 4,
  ): Promise<ProductWithSeller[]> {
    if (!isSupabaseReady()) return []

    const { data, error } = await getSupabaseClient()
      .from('products')
      .select(`*, profiles!products_user_id_fkey(${SELLER_SELECT})`)
      .eq('category', category)
      .neq('id', productId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw new Error(mapAuthError(error.message))
    return (data ?? []).map((row) => mapProduct(row as ProductRow))
  },

  async create(userId: string, input: CreateProductInput): Promise<ProductWithSeller> {
    if (!isSupabaseReady()) {
      throw new Error('Supabase not configured')
    }

    const { data, error } = await getSupabaseClient()
      .from('products')
      .insert({
        user_id: userId,
        title: input.title,
        description: input.description,
        category: input.category,
        condition: input.condition,
        size: input.size,
        brand: input.brand,
        color: input.color,
        location: input.location,
        price: input.price,
        images: input.images,
      })
      .select(`*, profiles!products_user_id_fkey(${SELLER_SELECT})`)
      .single()

    if (error) throw new Error(mapAuthError(error.message))
    return mapProduct(data as ProductRow)
  },

  async countByUser(userId: string): Promise<number> {
    if (!isSupabaseReady()) return 0

    const { count, error } = await getSupabaseClient()
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (error) throw new Error(mapAuthError(error.message))
    return count ?? 0
  },
}
