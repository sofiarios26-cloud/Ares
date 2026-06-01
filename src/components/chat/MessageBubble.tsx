import type { ChatMessage } from '@/types/chat'
import { cn } from '@/utils/cn'

type MessageBubbleProps = {
  message: ChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const time = new Date(message.created_at).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div
      className={cn(
        'flex max-w-[85%] flex-col gap-1',
        message.isOwn ? 'ml-auto items-end' : 'mr-auto items-start',
      )}
    >
      <div
        className={cn(
          'rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-card',
          message.isOwn
            ? 'rounded-br-md bg-linear-to-br from-ares-gold-light to-ares-gold text-ares-dark'
            : 'rounded-bl-md glass text-ares-white',
        )}
      >
        {message.content}
      </div>
      <span className="px-1 text-[10px] text-ares-gray">{time}</span>
    </div>
  )
}
