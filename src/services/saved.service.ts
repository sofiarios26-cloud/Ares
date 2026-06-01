import { getSupabaseClient, isSupabaseReady } from '@/services/supabase/client'
import { notificationsService } from '@/services/notifications.service'
import { productsService } from '@/services/products.service'
import { profilesService } from '@/services/profiles.service'
import type { ProductWithSeller } from '@/types/marketplace'
import { mapAuthError } from '@/utils/auth-errors'

export const savedService = {
  async isSaved(userId: string, productId: string): Promise<boolean> {
    if (!isSupabaseReady()) return false

    const { data, error } = await getSupabaseClient()
      .from('saved_products')
      .select('user_id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle()

    if (error) throw new Error(mapAuthError(error.message))
    return Boolean(data)
  },

  async save(userId: string, productId: string): Promise<void> {
    if (!isSupabaseReady()) {
      throw new Error('Supabase not configured')
    }

    const { error } = await getSupabaseClient()
      .from('saved_products')
      .insert({ user_id: userId, product_id: productId })

    if (error && !error.message.includes('duplicate')) {
      throw new Error(mapAuthError(error.message))
    }

    if (error?.message.includes('duplicate')) return

    try {
      const product = await productsService.getById(productId)
      if (!product || product.user_id === userId) return

      const actor = await profilesService.getById(userId)
      if (!actor) return

      await notificationsService.notifySave(product.user_id, {
        productId,
        productTitle: product.title,
        actorId: userId,
        actorUsername: actor.username,
      })
    } catch {
      /* notification is best-effort */
    }
  },

  async unsave(userId: string, productId: string): Promise<void> {
    if (!isSupabaseReady()) {
      throw new Error('Supabase not configured')
    }

    const { error } = await getSupabaseClient()
      .from('saved_products')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId)

    if (error) throw new Error(mapAuthError(error.message))
  },

  async list(userId: string): Promise<ProductWithSeller[]> {
    if (!isSupabaseReady()) return []

    const { data, error } = await getSupabaseClient()
      .from('saved_products')
      .select('product_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(mapAuthError(error.message))
    if (!data?.length) return []

    const products = await Promise.all(
      data.map((row) => productsService.getById(row.product_id)),
    )

    return products.filter((p): p is ProductWithSeller => p !== null)
  },

  async countByUser(userId: string): Promise<number> {
    if (!isSupabaseReady()) return 0

    const { count, error } = await getSupabaseClient()
      .from('saved_products')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (error) throw new Error(mapAuthError(error.message))
    return count ?? 0
  },

  async getSavedProductIds(userId: string, productIds: string[]): Promise<Set<string>> {
    if (!isSupabaseReady() || productIds.length === 0) return new Set()

    const { data, error } = await getSupabaseClient()
      .from('saved_products')
      .select('product_id')
      .eq('user_id', userId)
      .in('product_id', productIds)

    if (error) throw new Error(mapAuthError(error.message))
    return new Set((data ?? []).map((row) => row.product_id))
  },
}
