import { useCallback, useEffect, useState } from 'react'
import { notificationsService } from '@/services/notifications.service'
import { getSupabaseClient, isSupabaseReady } from '@/services/supabase/client'
import type { Notification } from '@/types/database'
import { mapAuthError } from '@/utils/auth-errors'

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!userId) {
      setNotifications([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await notificationsService.list(userId)
      setNotifications(data)
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
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void load()
        },
      )
      .subscribe()

    return () => {
      void client.removeChannel(channel)
    }
  }, [userId, load])

  const markAsRead = useCallback(async (id: string) => {
    await notificationsService.markAsRead(id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )
  }, [])

  const markAllAsRead = useCallback(async () => {
    if (!userId) return
    await notificationsService.markAllAsRead(userId)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [userId])

  return {
    notifications,
    isLoading,
    error,
    refresh: load,
    markAsRead,
    markAllAsRead,
  }
}
