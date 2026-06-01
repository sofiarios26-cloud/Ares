import { getSupabaseClient, isSupabaseReady } from '@/services/supabase/client'
import type { Message } from '@/types/database'
import type { Conversation } from '@/types/chat'
import type { SellerPreview } from '@/types/marketplace'
import { mapAuthError } from '@/utils/auth-errors'

const PROFILE_SELECT = 'id, username, avatar, location, rating, bio'

function partnerIdForMessage(message: Message, userId: string): string {
  return message.sender_id === userId ? message.receiver_id : message.sender_id
}

export const messagesService = {
  async listConversations(userId: string): Promise<Conversation[]> {
    if (!isSupabaseReady()) return []

    const { data, error } = await getSupabaseClient()
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    if (error) throw new Error(mapAuthError(error.message))
    if (!data?.length) return []

    const grouped = new Map<string, { lastMessage: Message; unreadCount: number }>()

    for (const message of data) {
      const partnerId = partnerIdForMessage(message, userId)
      const existing = grouped.get(partnerId)

      if (!existing) {
        grouped.set(partnerId, {
          lastMessage: message,
          unreadCount:
            message.receiver_id === userId && !message.read ? 1 : 0,
        })
      } else if (message.receiver_id === userId && !message.read) {
        existing.unreadCount += 1
      }
    }

    const partnerIds = [...grouped.keys()]
    const { data: profiles, error: profileError } = await getSupabaseClient()
      .from('profiles')
      .select(PROFILE_SELECT)
      .in('id', partnerIds)

    if (profileError) throw new Error(mapAuthError(profileError.message))

    const profileMap = new Map(
      (profiles ?? []).map((p) => [p.id, p as SellerPreview]),
    )

    return partnerIds
      .map((partnerId) => {
        const entry = grouped.get(partnerId)!
        const partner = profileMap.get(partnerId)
        if (!partner) return null
        return {
          partnerId,
          partner,
          lastMessage: entry.lastMessage,
          unreadCount: entry.unreadCount,
        }
      })
      .filter((c): c is Conversation => c !== null)
      .sort(
        (a, b) =>
          new Date(b.lastMessage.created_at).getTime() -
          new Date(a.lastMessage.created_at).getTime(),
      )
  },

  async getThread(userId: string, partnerId: string): Promise<Message[]> {
    if (!isSupabaseReady()) return []

    const { data, error } = await getSupabaseClient()
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`,
      )
      .order('created_at', { ascending: true })

    if (error) throw new Error(mapAuthError(error.message))
    return data ?? []
  },

  async sendMessage(
    senderId: string,
    receiverId: string,
    content: string,
  ): Promise<Message> {
    if (!isSupabaseReady()) {
      throw new Error('Supabase not configured')
    }

    const trimmed = content.trim()
    if (!trimmed) throw new Error('El mensaje no puede estar vacío')

    const { data, error } = await getSupabaseClient()
      .from('messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content: trimmed,
      })
      .select('*')
      .single()

    if (error) throw new Error(mapAuthError(error.message))
    return data
  },

  async markThreadAsRead(userId: string, partnerId: string): Promise<void> {
    if (!isSupabaseReady()) return

    const { error } = await getSupabaseClient()
      .from('messages')
      .update({ read: true })
      .eq('receiver_id', userId)
      .eq('sender_id', partnerId)
      .eq('read', false)

    if (error) throw new Error(mapAuthError(error.message))
  },

  async countUnread(userId: string): Promise<number> {
    if (!isSupabaseReady()) return 0

    const { count, error } = await getSupabaseClient()
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('read', false)

    if (error) throw new Error(mapAuthError(error.message))
    return count ?? 0
  },
}
