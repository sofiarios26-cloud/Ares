import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

export type EmptyStateProps = {
  icon?: ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 px-6 py-12 text-center',
        className,
      )}
    >
      {icon ? (
        <div className="flex size-16 items-center justify-center rounded-2xl glass-gold text-ares-gold-light">
          {icon}
        </div>
      ) : null}
      <div className="space-y-2">
        <h3 className="font-display text-lg font-semibold text-ares-white">{title}</h3>
        {description ? (
          <p className="max-w-xs text-sm leading-relaxed text-ares-gray">{description}</p>
        ) : null}
      </div>
      {actionLabel && onAction ? (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
