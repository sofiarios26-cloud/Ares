import { getSupabaseClient, isSupabaseReady } from '@/services/supabase/client'
import type { Order } from '@/types/database'
import type { OrderWithProduct } from '@/types/order'
import { mapAuthError } from '@/utils/auth-errors'

type OrderRow = Order & {
  products: OrderWithProduct['product']
}

function mapOrder(row: OrderRow): OrderWithProduct {
  const { products, ...order } = row
  return { ...order, product: products }
}

export const ordersService = {
  async listByBuyer(buyerId: string): Promise<OrderWithProduct[]> {
    if (!isSupabaseReady()) return []

    const { data, error } = await getSupabaseClient()
      .from('orders')
      .select(`
        *,
        products (
          id,
          title,
          price,
          images,
          category
        )
      `)
      .eq('buyer_id', buyerId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(mapAuthError(error.message))
    return (data as OrderRow[]).map(mapOrder)
  },

  async getById(orderId: string): Promise<OrderWithProduct | null> {
    if (!isSupabaseReady()) return null

    const { data, error } = await getSupabaseClient()
      .from('orders')
      .select(`
        *,
        products (
          id,
          title,
          price,
          images,
          category
        )
      `)
      .eq('id', orderId)
      .maybeSingle()

    if (error) throw new Error(mapAuthError(error.message))
    if (!data) return null
    return mapOrder(data as OrderRow)
  },

  async hasApprovedOrder(productId: string): Promise<boolean> {
    if (!isSupabaseReady()) return false

    const { data, error } = await getSupabaseClient()
      .from('orders')
      .select('id')
      .eq('product_id', productId)
      .eq('status', 'approved')
      .maybeSingle()

    if (error) return false
    return Boolean(data)
  },
}
