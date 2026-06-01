import { useNavigate } from 'react-router-dom'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { LazyImage } from '@/components/ui/LazyImage'
import type { OrderWithProduct } from '@/types/order'
import { formatPrice, formatRelativeDate } from '@/utils/format'

type OrderListItemProps = {
  order: OrderWithProduct
}

export function OrderListItem({ order }: OrderListItemProps) {
  const navigate = useNavigate()
  const image = order.product?.images?.[0]

  return (
    <button
      type="button"
      onClick={() => {
        if (order.product?.id) {
          navigate(`/products/${order.product.id}`)
        }
      }}
      className="press-scale flex w-full gap-3 rounded-app-xl border border-white/6 bg-ares-dark-elevated p-3 text-left transition-all duration-300 hover:border-ares-gold/25"
    >
      <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-white/5">
        {image ? (
          <LazyImage
            src={image}
            alt={order.product?.title ?? 'Producto'}
            className="size-full object-cover"
            containerClassName="size-full"
            aspectRatio="aspect-square"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-xs text-ares-gray">
            ARES
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate font-medium text-ares-white">
            {order.product?.title ?? 'Compra'}
          </p>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="text-sm text-ares-gold-light">{formatPrice(order.total)}</p>
        <p className="text-xs text-ares-gray">{formatRelativeDate(order.created_at)}</p>
      </div>
    </button>
  )
}
