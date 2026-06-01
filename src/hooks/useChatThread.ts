import { useCallback, useEffect, useRef, useState } from 'react'
import { messagesService } from '@/services/messages.service'
import { notificationsService } from '@/services/notifications.service'
import { profilesService } from '@/services/profiles.service'
import { getSupabaseClient, isSupabaseReady } from '@/services/supabase/client'
import type { ChatMessage } from '@/types/chat'
import type { SellerPreview } from '@/types/marketplace'
import { mapAuthError } from '@/utils/auth-errors'

export function useChatThread(
  userId: string | undefined,
  partnerId: string | undefined,
) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [partner, setPartner] = useState<SellerPreview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const load = useCallback(async () => {
    if (!userId || !partnerId) {
      setMessages([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const [thread, profile] = await Promise.all([
        messagesService.getThread(userId, partnerId),
        profilesService.getById(partnerId),
      ])

      setPartner(profile)
      setMessages(
        thread.map((m) => ({
          ...m,
          isOwn: m.sender_id === userId,
        })),
      )

      await messagesService.markThreadAsRead(userId, partnerId)
    } catch (err) {
      setError(err instanceof Error ? err.message : mapAuthError(''))
    } finally {
      setIsLoading(false)
    }
  }, [userId, partnerId])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!isLoading && messages.length) {
      scrollToBottom()
    }
  }, [isLoading, messages.length, scrollToBottom])

  useEffect(() => {
    if (!userId || !partnerId || !isSupabaseReady()) return

    const client = getSupabaseClient()
    const channel = client
      .channel(`thread:${userId}:${partnerId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const msg = payload.new as ChatMessage & {
            sender_id: string
            receiver_id: string
          }
          const isThread =
            (msg.sender_id === userId && msg.receiver_id === partnerId) ||
            (msg.sender_id === partnerId && msg.receiver_id === userId)

          if (!isThread) return

          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev
            return [...prev, { ...msg, isOwn: msg.sender_id === userId }]
          })

          if (msg.receiver_id === userId) {
            void messagesService.markThreadAsRead(userId, partnerId)
          }

          scrollToBottom()
        },
      )
      .subscribe()

    return () => {
      void client.removeChannel(channel)
    }
  }, [userId, partnerId, scrollToBottom])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!userId || !partnerId) return

      setIsSending(true)
      setError(null)

      try {
        const sent = await messagesService.sendMessage(userId, partnerId, content)
        await notificationsService.notifyMessage(partnerId, userId, content)

        setMessages((prev) => {
          if (prev.some((m) => m.id === sent.id)) return prev
          return [...prev, { ...sent, isOwn: true }]
        })
        scrollToBottom()
      } catch (err) {
        setError(err instanceof Error ? err.message : mapAuthError(''))
        throw err
      } finally {
        setIsSending(false)
      }
    },
    [userId, partnerId, scrollToBottom],
  )

  return {
    messages,
    partner,
    isLoading,
    isSending,
    error,
    sendMessage,
    refresh: load,
    bottomRef,
  }
}
