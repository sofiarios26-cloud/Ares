import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

type BadgeVariant = 'gold' | 'eco' | 'neutral' | 'outline'

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant
  icon?: ReactNode
}

const variantStyles: Record<BadgeVariant, string> = {
  gold: 'bg-ares-gold/15 text-ares-gold-light border-ares-gold/30',
  eco: 'bg-ares-eco/15 text-ares-eco border-ares-eco/30',
  neutral: 'bg-white/5 text-ares-gray-light border-white/10',
  outline: 'bg-transparent text-ares-white border-ares-gray/40',
}

export function Badge({
  variant = 'neutral',
  icon,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </span>
  )
}
