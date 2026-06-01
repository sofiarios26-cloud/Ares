import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { ProductCard } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import { IconDiscover, IconLeaf } from '@/components/icons/NavIcons'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import type { ProductWithSeller } from '@/types/marketplace'
import { formatPrice } from '@/utils/format'
import { cn } from '@/utils/cn'

type ProductFeedProps = {
  products: ProductWithSeller[]
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  error: string | null
  onLoadMore: () => void
  onRetry?: () => void
  emptyTitle?: string
  emptyDescription?: string
  className?: string
}

export function ProductFeed({
  products,
  isLoading,
  isLoadingMore,
  hasMore,
  error,
  onLoadMore,
  onRetry,
  emptyTitle = 'Sin piezas aún',
  emptyDescription = 'Sé el primero en publicar moda circular en ARES.',
  className,
}: ProductFeedProps) {
  const navigate = useNavigate()
  const sentinelRef = useInfiniteScroll({
    onLoadMore,
    hasMore,
    isLoading: isLoading || isLoadingMore,
  })

  if (isLoading) {
    return (
      <div className={cn('grid gap-4', className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <EmptyState
        icon={<IconDiscover className="size-7 text-red-400" />}
        title="Error al cargar"
        description={error}
        actionLabel="Reintentar"
        onAction={onRetry}
      />
    )
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={<IconDiscover className="size-7 text-ares-gold-light" />}
        title={emptyTitle}
        description={emptyDescription}
      />
    )
  }

  return (
    <div className={cn('grid gap-4', className)}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          title={product.title}
          brand={product.brand ?? 'ARES'}
          price={formatPrice(product.price)}
          imageUrl={product.images[0]}
          likes={product.likes}
          badge={
            product.category === 'Eco' ? (
              <Badge variant="eco" icon={<IconLeaf className="size-3" />}>
                Eco
              </Badge>
            ) : product.category === 'Premium' ? (
              <Badge variant="gold">Premium</Badge>
            ) : (
              <Badge variant="neutral">{product.category}</Badge>
            )
          }
          onClick={() => navigate(`/products/${product.id}`)}
        />
      ))}

      <div ref={sentinelRef} className="flex justify-center py-4">
        {isLoadingMore ? <Spinner size="sm" label="" /> : null}
        {!hasMore && products.length > 0 ? (
          <p className="text-xs text-ares-gray">No hay más piezas</p>
        ) : null}
      </div>
    </div>
  )
}
