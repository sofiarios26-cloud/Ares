import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconBell, IconMessage } from '@/components/icons/NavIcons'
import { ProfileAvatar } from '@/components/profile/ProfileAvatar'
import { useAuth } from '@/hooks/useAuth'
import { useUnreadCounts } from '@/contexts/UnreadContext'
import { getAvatarUrl, getDisplayName } from '@/utils/profile'
import { cn } from '@/utils/cn'

function BadgeDot({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <span className="absolute -right-0.5 -top-0.5 flex min-w-[16px] items-center justify-center rounded-full bg-ares-gold px-1 text-[9px] font-bold text-ares-dark">
      {count > 99 ? '99+' : count}
    </span>
  )
}

export function NavbarActions() {
  const navigate = useNavigate()
  const { isAuthenticated, profile, user } = useAuth()
  const { unreadMessages, unreadNotifications } = useUnreadCounts()

  if (!isAuthenticated) return null

  const displayName = getDisplayName(profile, user)
  const avatarUrl = getAvatarUrl(profile, user)

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => navigate('/profile')}
        className="press-scale hidden sm:flex"
        aria-label="Mi perfil"
      >
        <ProfileAvatar name={displayName} avatarUrl={avatarUrl} size="sm" />
      </button>
      <button
        type="button"
        onClick={() => navigate('/inbox')}
        className="press-scale relative flex size-9 items-center justify-center rounded-full glass transition-colors duration-300 hover:border-ares-gold/30"
        aria-label="Mensajes"
      >
        <IconMessage className="size-5 text-ares-gold-light" />
        <BadgeDot count={unreadMessages} />
      </button>
      <button
        type="button"
        onClick={() => navigate('/notifications')}
        className="press-scale relative flex size-9 items-center justify-center rounded-full glass transition-colors duration-300 hover:border-ares-gold/30"
        aria-label="Notificaciones"
      >
        <IconBell className="size-5 text-ares-gold-light" />
        <BadgeDot count={unreadNotifications} />
      </button>
    </div>
  )
}

export function NavbarIconButton({
  onClick,
  label,
  children,
  className,
}: {
  onClick?: () => void
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'press-scale flex size-9 items-center justify-center rounded-full glass transition-colors duration-300 hover:border-ares-gold/30',
        className,
      )}
      aria-label={label}
    >
      {children}
    </button>
  )
}
