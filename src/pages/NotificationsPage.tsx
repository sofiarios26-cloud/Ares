import { NotificationItem } from '@/components/chat'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Navbar } from '@/components/ui/Navbar'
import { PageLoader } from '@/components/ui/Spinner'
import { IconBell } from '@/components/icons/NavIcons'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/hooks/useNotifications'
import { useUnreadCounts } from '@/contexts/UnreadContext'

export function NotificationsPage() {
  const { user } = useAuth()
  const { refresh: refreshUnread } = useUnreadCounts()
  const {
    notifications,
    isLoading,
    error,
    refresh,
    markAsRead,
    markAllAsRead,
  } = useNotifications(user?.id)

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAll = async () => {
    await markAllAsRead()
    await refreshUnread()
  }

  return (
    <div className="page-enter flex min-h-dvh flex-col">
      <Navbar
        title="Notificaciones"
        showBack
        rightSlot={
          unreadCount > 0 ? (
            <button
              type="button"
              onClick={() => void handleMarkAll()}
              className="text-xs text-ares-gold-light transition-colors duration-300 hover:text-ares-gold"
            >
              Leer todo
            </button>
          ) : (
            <button
              type="button"
              onClick={() => refresh()}
              className="text-xs text-ares-gold-light transition-colors duration-300 hover:text-ares-gold"
            >
              Actualizar
            </button>
          )
        }
      />

      <div className="flex flex-1 flex-col gap-3 px-4 pb-4">
        {isLoading ? (
          <PageLoader />
        ) : error ? (
          <EmptyState
            icon={<IconBell className="size-7 text-red-400" />}
            title="Error al cargar"
            description={error}
            actionLabel="Reintentar"
            onAction={refresh}
          />
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={<IconBell className="size-7 text-ares-gold-light" />}
            title="Sin notificaciones"
            description="Te avisaremos cuando recibas mensajes, likes o guardados."
          />
        ) : (
          <>
            {unreadCount > 0 ? (
              <Button variant="outline" size="sm" onClick={() => void handleMarkAll()}>
                Marcar {unreadCount} como leídas
              </Button>
            ) : null}
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={async (id) => {
                  await markAsRead(id)
                  await refreshUnread()
                }}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
