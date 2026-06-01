import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconArrowLeft } from '@/components/icons/NavIcons'
import { cn } from '@/utils/cn'

export type NavbarProps = {
  title?: string
  subtitle?: string
  showBack?: boolean
  transparent?: boolean
  rightSlot?: ReactNode
  leftSlot?: ReactNode
  className?: string
}

export function Navbar({
  title,
  subtitle,
  showBack = false,
  transparent = false,
  rightSlot,
  leftSlot,
  className,
}: NavbarProps) {
  const navigate = useNavigate()

  return (
    <header
      className={cn(
        'safe-top sticky top-0 z-30 flex h-14 items-center justify-between gap-3 px-4',
        transparent ? 'bg-transparent' : 'glass border-b border-white/6',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {leftSlot}
        {showBack ? (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="press-scale flex size-9 shrink-0 items-center justify-center rounded-full bg-white/5 transition-colors duration-300 hover:bg-ares-gold/15"
            aria-label="Volver"
          >
            <IconArrowLeft className="size-5 text-ares-white" />
          </button>
        ) : null}
        <div className="min-w-0">
          {title ? (
            <h1 className="truncate font-display text-base font-semibold tracking-tight text-ares-white">
              {title}
            </h1>
          ) : (
            <span className="font-display text-lg font-bold tracking-tight text-gradient-gold">
              ARES
            </span>
          )}
          {subtitle ? (
            <p className="truncate text-[10px] uppercase tracking-widest text-ares-gray">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
      {rightSlot ? <div className="flex shrink-0 items-center gap-2">{rightSlot}</div> : null}
    </header>
  )
}
