import { useNavigate } from 'react-router-dom'
import { ProfileAvatar } from '@/components/profile/ProfileAvatar'
import type { Conversation } from '@/types/chat'
import { formatRelativeDate } from '@/utils/format'
import { cn } from '@/utils/cn'

type ConversationItemProps = {
  conversation: Conversation
  currentUserId: string
}

export function ConversationItem({ conversation, currentUserId }: ConversationItemProps) {
  const navigate = useNavigate()
  const { partner, lastMessage, unreadCount } = conversation
  const isOwn = lastMessage.sender_id === currentUserId
  const preview = isOwn ? `Vos: ${lastMessage.content}` : lastMessage.content

  return (
    <button
      type="button"
      onClick={() => navigate(`/inbox/${partner.id}`)}
      className={cn(
        'press-scale flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all duration-300',
        unreadCount > 0
          ? 'border-ares-gold/25 bg-ares-gold/5'
          : 'border-white/6 bg-ares-dark-elevated hover:border-ares-gold/20',
      )}
    >
      <ProfileAvatar name={partner.username} avatarUrl={partner.avatar} size="md" />

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-semibold text-ares-white">@{partner.username}</p>
          <span className="shrink-0 text-[10px] text-ares-gray">
            {formatRelativeDate(lastMessage.created_at)}
          </span>
        </div>
        <p className="truncate text-sm text-ares-gray">{preview}</p>
      </div>

      {unreadCount > 0 ? (
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-ares-gold text-[10px] font-bold text-ares-dark">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      ) : null}
    </button>
  )
}
