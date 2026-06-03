import { useCallback, useEffect, useRef, useState } from 'react'
import { messagesService } from '@/services/messages.service'
import { notificationsService } from '@/services/notifications.service'
import { profilesService } from '@/services/profiles.service'
import { getSupabaseClient, isSupabaseReady } from '@/services/supabase/client'
import type { ChatMessage } from '@/types/chat'
import type { Message } from '@/types/database'
import type { SellerPreview } from '@/types/marketplace'
import { mapAuthError } from '@/utils/auth-errors'

function sortByCreatedAt(messages: ChatMessage[]): ChatMessage[] {
  return [...messages].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )
}

function toChatMessage(message: Message, userId: string): ChatMessage {
  return { ...message, isOwn: message.sender_id === userId }
}

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
  const userIdRef = useRef(userId)
  const partnerIdRef = useRef(partnerId)

  userIdRef.current = userId
  partnerIdRef.current = partnerId

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    })
  }, [])

  const upsertMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => {
      const index = prev.findIndex((m) => m.id === message.id)
      if (index >= 0) {
        const next = [...prev]
        next[index] = message
        return sortByCreatedAt(next)
      }
      return sortByCreatedAt([...prev, message])
    })
  }, [])

  const removeMessageById = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId))
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
      setMessages(thread.map((m) => toChatMessage(m, userId)))

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
          const msg = payload.new as Message
          const currentUserId = userIdRef.current
          const currentPartnerId = partnerIdRef.current

          if (!currentUserId || !currentPartnerId) return

          const isThread =
            (msg.sender_id === currentUserId &&
              msg.receiver_id === currentPartnerId) ||
            (msg.sender_id === currentPartnerId &&
              msg.receiver_id === currentUserId)

          if (!isThread) return

          upsertMessage(toChatMessage(msg, currentUserId))

          if (msg.receiver_id === currentUserId) {
            void messagesService.markThreadAsRead(currentUserId, currentPartnerId)
          }

          scrollToBottom()
        },
      )
      .subscribe((status) => {
        console.log('CHAT STATUS:', status)
      })
    return () => {
      void client.removeChannel(channel)
    }
  }, [userId, partnerId, scrollToBottom, upsertMessage])

  const sendMessage = useCallback(
    async (content: string) => {
      const currentUserId = userIdRef.current
      const currentPartnerId = partnerIdRef.current

      if (!currentUserId || !currentPartnerId) return

      const trimmed = content.trim()
      if (!trimmed) return

      const tempId = `pending-${crypto.randomUUID()}`
      const optimistic: ChatMessage = {
        id: tempId,
        sender_id: currentUserId,
        receiver_id: currentPartnerId,
        content: trimmed,
        read: false,
        created_at: new Date().toISOString(),
        isOwn: true,
      }

      setIsSending(true)
      setError(null)
      upsertMessage(optimistic)
      scrollToBottom()

      try {
        const sent = await messagesService.sendMessage(
          currentUserId,
          currentPartnerId,
          trimmed,
        )

        removeMessageById(tempId)
        upsertMessage(toChatMessage(sent, currentUserId))
        scrollToBottom()

        void notificationsService
          .notifyMessage(currentPartnerId, currentUserId, trimmed)
          .catch(() => {
            /* notification failure must not block chat UI */
          })
      } catch (err) {
        removeMessageById(tempId)
        setError(err instanceof Error ? err.message : mapAuthError(''))
        throw err
      } finally {
        setIsSending(false)
      }
    },
    [removeMessageById, scrollToBottom, upsertMessage],
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
