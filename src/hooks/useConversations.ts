import { useCallback, useEffect, useState } from 'react'
import { messagesService } from '@/services/messages.service'
import { getSupabaseClient, isSupabaseReady } from '@/services/supabase/client'
import type { Conversation } from '@/types/chat'
import { mapAuthError } from '@/utils/auth-errors'

export function useConversations(userId: string | undefined) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!userId) {
      setConversations([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await messagesService.listConversations(userId)
      setConversations(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : mapAuthError(''))
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!userId || !isSupabaseReady()) return

    const client = getSupabaseClient()
    const channel = client
      .channel(`inbox:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        (payload) => {
          const row = payload.new as { sender_id?: string; receiver_id?: string } | null
          const old = payload.old as { sender_id?: string; receiver_id?: string } | null
          const involved =
            row?.sender_id === userId ||
            row?.receiver_id === userId ||
            old?.sender_id === userId ||
            old?.receiver_id === userId
          if (involved) void load()
        },
      )
      .subscribe()

    return () => {
      void client.removeChannel(channel)
    }
  }, [userId, load])

  return { conversations, isLoading, error, refresh: load }
}
