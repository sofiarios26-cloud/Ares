import { cn } from '@/utils/cn'
import { getProfileInitial } from '@/utils/profile'

type ProfileAvatarProps = {
  name: string
  avatarUrl?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showStatus?: boolean
  className?: string
}

const sizes = {
  sm: 'size-9 text-sm ring-1',
  md: 'size-12 text-base ring-2',
  lg: 'size-20 text-2xl ring-2',
  xl: 'size-24 text-3xl ring-2',
}

export function ProfileAvatar({
  name,
  avatarUrl,
  size = 'md',
  showStatus = false,
  className,
}: ProfileAvatarProps) {
  const initial = getProfileInitial(name)

  return (
    <div className={cn('relative shrink-0', className)}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className={cn(
            'rounded-full object-cover ring-ares-gold/40',
            sizes[size],
          )}
          loading="lazy"
        />
      ) : (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-linear-to-br from-ares-gold-light/30 to-ares-eco/20 ring-ares-gold/40',
            sizes[size],
          )}
        >
          <span className="font-display font-bold text-ares-white">{initial}</span>
        </div>
      )}
      {showStatus ? (
        <span className="absolute -bottom-1 -right-1 rounded-full bg-ares-eco px-2 py-0.5 text-[9px] font-bold uppercase text-ares-dark">
          Activo
        </span>
      ) : null}
    </div>
  )
}
