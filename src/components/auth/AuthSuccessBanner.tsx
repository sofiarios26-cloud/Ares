import { cn } from '@/utils/cn'

type AuthSuccessBannerProps = {
  message: string | null
  className?: string
}

export function AuthSuccessBanner({ message, className }: AuthSuccessBannerProps) {
  if (!message) return null

  return (
    <div
      role="status"
      className={cn(
        'rounded-2xl border border-ares-eco/30 bg-ares-eco/10 px-4 py-3 text-sm text-ares-eco',
        className,
      )}
    >
      {message}
    </div>
  )
}
