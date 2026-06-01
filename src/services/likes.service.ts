import { getSupabaseClient, isSupabaseReady } from '@/services/supabase/client'
import { notificationsService } from '@/services/notifications.service'
import { productsService } from '@/services/products.service'
import { profilesService } from '@/services/profiles.service'
import { mapAuthError } from '@/utils/auth-errors'

export const likesService = {
  async isLiked(userId: string, productId: string): Promise<boolean> {
    if (!isSupabaseReady()) return false

    const { data, error } = await getSupabaseClient()
      .from('likes')
      .select('user_id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle()

    if (error) throw new Error(mapAuthError(error.message))
    return Boolean(data)
  },

  async like(userId: string, productId: string): Promise<void> {
    if (!isSupabaseReady()) {
      throw new Error('Supabase not configured')
    }

    const { error } = await getSupabaseClient()
      .from('likes')
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

      await notificationsService.notifyLike(product.user_id, {
        productId,
        productTitle: product.title,
        actorId: userId,
        actorUsername: actor.username,
      })
    } catch {
      /* notification is best-effort */
    }
  },

  async unlike(userId: string, productId: string): Promise<void> {
    if (!isSupabaseReady()) {
      throw new Error('Supabase not configured')
    }

    const { error } = await getSupabaseClient()
      .from('likes')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId)

    if (error) throw new Error(mapAuthError(error.message))
  },

  async getLikedProductIds(userId: string, productIds: string[]): Promise<Set<string>> {
    if (!isSupabaseReady() || productIds.length === 0) return new Set()

    const { data, error } = await getSupabaseClient()
      .from('likes')
      .select('product_id')
      .eq('user_id', userId)
      .in('product_id', productIds)

    if (error) throw new Error(mapAuthError(error.message))
    return new Set((data ?? []).map((row) => row.product_id))
  },
}
