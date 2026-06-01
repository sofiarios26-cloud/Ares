import {
  NOTIFICATION_TYPES,
  type MessageNotificationPayload,
  type ProductNotificationPayload,
} from '@/constants/notifications'
import { getSupabaseClient, isSupabaseReady } from '@/services/supabase/client'
import type { Notification } from '@/types/database'
import { mapAuthError } from '@/utils/auth-errors'

export type CreateNotificationInput = {
  userId: string
  type: string
  content: string
}

export const notificationsService = {
  async list(userId: string): Promise<Notification[]> {
    if (!isSupabaseReady()) return []

    const { data, error } = await getSupabaseClient()
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw new Error(mapAuthError(error.message))
    return data ?? []
  },

  async create({ userId, type, content }: CreateNotificationInput): Promise<void> {
    if (!isSupabaseReady()) return

    const { error } = await getSupabaseClient()
      .from('notifications')
      .insert({ user_id: userId, type, content })

    if (error) throw new Error(mapAuthError(error.message))
  },

  async markAsRead(notificationId: string): Promise<void> {
    if (!isSupabaseReady()) return

    const { error } = await getSupabaseClient()
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)

    if (error) throw new Error(mapAuthError(error.message))
  },

  async markAllAsRead(userId: string): Promise<void> {
    if (!isSupabaseReady()) return

    const { error } = await getSupabaseClient()
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) throw new Error(mapAuthError(error.message))
  },

  async countUnread(userId: string): Promise<number> {
    if (!isSupabaseReady()) return 0

    const { count, error } = await getSupabaseClient()
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) throw new Error(mapAuthError(error.message))
    return count ?? 0
  },

  async notifyMessage(
    receiverId: string,
    senderId: string,
    preview: string,
  ): Promise<void> {
    if (receiverId === senderId) return

    const payload: MessageNotificationPayload = {
      senderId,
      preview: preview.slice(0, 120),
    }

    await this.create({
      userId: receiverId,
      type: NOTIFICATION_TYPES.MESSAGE,
      content: JSON.stringify(payload),
    })
  },

  async notifyLike(
    ownerId: string,
    payload: ProductNotificationPayload,
  ): Promise<void> {
    if (ownerId === payload.actorId) return

    await this.create({
      userId: ownerId,
      type: NOTIFICATION_TYPES.LIKE,
      content: JSON.stringify(payload),
    })
  },

  async notifySave(
    ownerId: string,
    payload: ProductNotificationPayload,
  ): Promise<void> {
    if (ownerId === payload.actorId) return

    await this.create({
      userId: ownerId,
      type: NOTIFICATION_TYPES.SAVE,
      content: JSON.stringify(payload),
    })
  },
}
