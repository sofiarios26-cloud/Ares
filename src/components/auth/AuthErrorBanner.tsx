import { cn } from '@/utils/cn'

type AuthErrorBannerProps = {
  message: string | null
  className?: string
}

export function AuthErrorBanner({ message, className }: AuthErrorBannerProps) {
  if (!message) return null

  return (
    <div
      role="alert"
      className={cn(
        'rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300',
        className,
      )}
    >
      {message}
    </div>
  )
}
