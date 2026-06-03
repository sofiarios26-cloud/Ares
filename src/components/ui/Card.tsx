import type { HTMLAttributes, ReactNode } from 'react'
import { LazyImage } from '@/components/ui/LazyImage'
import { cn } from '@/utils/cn'

type CardVariant = 'default' | 'glass' | 'elevated'

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-ares-dark-elevated border-white/6 shadow-card',
  glass: 'glass shadow-premium',
  elevated:
    'bg-ares-dark-elevated border-ares-gold/10 shadow-[0_16px_48px_rgba(0,0,0,0.5)]',
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
}

export function Card({
  variant = 'default',
  padding = 'md',
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-app-xl border transition-all duration-300',
        variantStyles[variant],
        paddingStyles[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export type ProductCardProps = {
  title: string
  brand: string
  price: string
  imageUrl?: string | null
  imageGradient?: string
  likes?: number
  badge?: ReactNode
  className?: string
  onClick?: () => void
  onDelete?: () => void
}

export function ProductCard({
  title,
  brand,
  price,
  imageUrl,
  imageGradient = 'from-ares-dark-elevated via-ares-gold/20 to-ares-eco/20',
  likes,
  badge,
  className,
  onClick,
  onDelete,
}: ProductCardProps & { onDelete?: () => void }) {
  return (
    <div className="relative">
     {onDelete && (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation()
      if (confirm('¿Eliminar esta publicación?')) {
        onDelete()
      }
    }}
    className="absolute right-2 top-2 z-[999] rounded-full bg-red-500 px-2 py-1 text-xs text-white shadow"
  >
    🗑
  </button>
)}

      <button
        type="button"
        onClick={onClick}
        className={cn(
          'press-scale group w-full overflow-hidden rounded-app-xl border border-white/6 bg-ares-dark-elevated text-left shadow-card',
          'transition-all duration-300 hover:border-ares-gold/25 hover:shadow-gold',
          className,
        )}
      >
        <div className="relative aspect-[4/5] w-full">
          {imageUrl ? (
            <LazyImage
              src={imageUrl}
              alt={title}
              aspectRatio="aspect-[4/5]"
              containerClassName="absolute inset-0"
              className="transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className={cn('absolute inset-0 bg-linear-to-br', imageGradient)} />
          )}

          <div className="absolute inset-0 bg-linear-to-t from-ares-dark via-transparent to-transparent opacity-80" />

          {badge ? <div className="absolute left-3 top-3 z-10">{badge}</div> : null}

          {likes !== undefined && likes > 0 ? (
            <div className="absolute right-3 top-3 z-10 rounded-full glass px-2 py-0.5 text-[10px] font-semibold text-ares-white">
              ♥ {likes}
            </div>
          ) : null}

          <div className="absolute bottom-3 left-3 right-3 z-10">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ares-gold-light">
              {brand}
            </p>
            <h3 className="font-display text-lg font-semibold text-ares-white">
              {title}
            </h3>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="font-display text-xl font-bold text-ares-gold-light">
            {price}
          </span>
          <span className="text-xs text-ares-gray transition-colors duration-300 group-hover:text-ares-eco">
            Ver pieza →
          </span>
        </div>
      </button>
    </div>
  )
}