import { useState } from 'react'
import { cn } from '@/utils/cn'

type LazyImageProps = {
  src: string
  alt: string
  className?: string
  containerClassName?: string
  aspectRatio?: string
}

export function LazyImage({
  src,
  alt,
  className,
  containerClassName,
  aspectRatio = 'aspect-[4/5]',
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  return (
    <div className={cn('relative overflow-hidden bg-ares-dark-elevated', aspectRatio, containerClassName)}>
      {!loaded && !failed ? (
        <div className="absolute inset-0 animate-shimmer bg-linear-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%]" />
      ) : null}
      {failed ? (
        <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-ares-dark-elevated via-ares-gold/10 to-ares-eco/10">
          <span className="text-xs text-ares-gray">Sin imagen</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            'size-full object-cover transition-opacity duration-500',
            loaded ? 'opacity-100' : 'opacity-0',
            className,
          )}
        />
      )}
    </div>
  )
}
