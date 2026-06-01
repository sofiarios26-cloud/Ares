import { cn } from '@/utils/cn'

export type SkeletonProps = {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-app-lg bg-linear-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] animate-shimmer',
        className,
      )}
    />
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-app-xl border border-white/6 bg-ares-dark-elevated">
      <Skeleton className="aspect-[4/5] w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-5 w-2/3" />
      </div>
    </div>
  )
}
