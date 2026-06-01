import { cn } from '@/utils/cn'

type SpinnerSize = 'sm' | 'md' | 'lg'

const sizes: Record<SpinnerSize, string> = {
  sm: 'size-5 border-2',
  md: 'size-8 border-2',
  lg: 'size-12 border-[3px]',
}

export type SpinnerProps = {
  size?: SpinnerSize
  className?: string
  label?: string
}

export function Spinner({ size = 'md', className, label = 'Cargando' }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn('flex flex-col items-center gap-3', className)}
    >
      <div
        className={cn(
          'animate-spin rounded-full border-ares-gold/30 border-t-ares-gold-light',
          sizes[size],
        )}
      />
      {label ? (
        <span className="text-xs font-medium tracking-wide text-ares-gray">{label}</span>
      ) : null}
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex min-h-[50dvh] flex-1 items-center justify-center">
      <Spinner size="lg" label="Cargando ARES" />
    </div>
  )
}
