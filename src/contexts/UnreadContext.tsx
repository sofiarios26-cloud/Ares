import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { messagesService } from '@/services/messages.service'
import { notificationsService } from '@/services/notifications.service'
import { getSupabaseClient, isSupabaseReady } from '@/services/supabase/client'
import { useAuth } from '@/hooks/useAuth'

type UnreadContextValue = {
  unreadMessages: number
  unreadNotifications: number
  refresh: () => Promise<void>
}

const UnreadContext = createContext<UnreadContextValue | null>(null)

export function UnreadProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  const refresh = useCallback(async () => {
    if (!user?.id || !isSupabaseReady()) {
      setUnreadMessages(0)
      setUnreadNotifications(0)
      return
    }

    try {
      const [messages, notifications] = await Promise.all([
        messagesService.countUnread(user.id),
        notificationsService.countUnread(user.id),
      ])
      setUnreadMessages(messages)
      setUnreadNotifications(notifications)
    } catch {
      /* keep previous counts */
    }
  }, [user?.id])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (!user?.id || !isSupabaseReady()) return

    const client = getSupabaseClient()
    const channel = client
      .channel(`unread:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        () => {
          void refresh()
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          void refresh()
        },
      )
      .subscribe()

    return () => {
      void client.removeChannel(channel)
    }
  }, [user?.id, refresh])

  const value = useMemo(
    () => ({ unreadMessages, unreadNotifications, refresh }),
    [unreadMessages, unreadNotifications, refresh],
  )

  return <UnreadContext.Provider value={value}>{children}</UnreadContext.Provider>
}

export function useUnreadCounts(): UnreadContextValue {
  const ctx = useContext(UnreadContext)
  if (!ctx) {
    return {
      unreadMessages: 0,
      unreadNotifications: 0,
      refresh: async () => {},
    }
  }
  return ctx
}
