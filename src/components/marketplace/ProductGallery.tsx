import { useState } from 'react'
import { LazyImage } from '@/components/ui/LazyImage'
import { cn } from '@/utils/cn'

type ProductGalleryProps = {
  images: string[]
  title: string
  className?: string
}

export function ProductGallery({ images, title, className }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = images[activeIndex] ?? images[0]

  if (!images.length) {
    return (
      <div
        className={cn(
          'aspect-[4/5] w-full rounded-app-xl bg-linear-to-br from-ares-dark-elevated via-ares-gold/15 to-ares-eco/10',
          className,
        )}
      />
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="overflow-hidden rounded-app-xl border border-white/6 shadow-card">
        {active ? (
          <LazyImage
            src={active}
            alt={title}
            aspectRatio="aspect-[4/5]"
            className="object-cover"
          />
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {images.map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={cn(
                'press-scale shrink-0 overflow-hidden rounded-xl border transition-all duration-300',
                i === activeIndex
                  ? 'border-ares-gold/50 ring-1 ring-ares-gold/30'
                  : 'border-white/10 opacity-70 hover:opacity-100',
              )}
            >
              <LazyImage
                src={img}
                alt={`${title} ${i + 1}`}
                aspectRatio="aspect-square"
                containerClassName="size-16"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
