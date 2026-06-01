import { useNavigate } from 'react-router-dom'
import {
  NOTIFICATION_TYPES,
  type MessageNotificationPayload,
  type ProductNotificationPayload,
} from '@/constants/notifications'
import type { Notification } from '@/types/database'
import { formatRelativeDate } from '@/utils/format'
import { cn } from '@/utils/cn'

type NotificationItemProps = {
  notification: Notification
  onRead: (id: string) => void
}

function parsePayload<T>(content: string): T | null {
  try {
    return JSON.parse(content) as T
  } catch {
    return null
  }
}

function getNotificationLabel(notification: Notification): {
  title: string
  subtitle: string
} {
  switch (notification.type) {
    case NOTIFICATION_TYPES.MESSAGE: {
      const payload = parsePayload<MessageNotificationPayload>(notification.content)
      return {
        title: 'Nuevo mensaje',
        subtitle: payload?.preview ?? notification.content,
      }
    }
    case NOTIFICATION_TYPES.LIKE: {
      const payload = parsePayload<ProductNotificationPayload>(notification.content)
      return {
        title: `@${payload?.actorUsername ?? 'usuario'} dio like`,
        subtitle: payload?.productTitle ?? 'Tu pieza recibió un like',
      }
    }
    case NOTIFICATION_TYPES.SAVE: {
      const payload = parsePayload<ProductNotificationPayload>(notification.content)
      return {
        title: `@${payload?.actorUsername ?? 'usuario'} guardó tu pieza`,
        subtitle: payload?.productTitle ?? 'Tu pieza fue guardada',
      }
    }
    default:
      return { title: 'Notificación', subtitle: notification.content }
  }
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const navigate = useNavigate()
  const { title, subtitle } = getNotificationLabel(notification)

  const handleClick = () => {
    void onRead(notification.id)

    if (notification.type === NOTIFICATION_TYPES.MESSAGE) {
      const payload = parsePayload<MessageNotificationPayload>(notification.content)
      if (payload?.senderId) {
        navigate(`/inbox/${payload.senderId}`)
        return
      }
      navigate('/inbox')
      return
    }

    const productPayload = parsePayload<ProductNotificationPayload>(notification.content)
    if (productPayload?.productId) {
      navigate(`/products/${productPayload.productId}`)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'press-scale flex w-full flex-col gap-1 rounded-2xl border px-4 py-3 text-left transition-all duration-300',
        notification.read
          ? 'border-white/6 bg-ares-dark-elevated opacity-75'
          : 'border-ares-gold/25 bg-ares-gold/5',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold text-ares-white">{title}</p>
        <span className="shrink-0 text-[10px] text-ares-gray">
          {formatRelativeDate(notification.created_at)}
        </span>
      </div>
      <p className="line-clamp-2 text-sm text-ares-gray">{subtitle}</p>
    </button>
  )
}
