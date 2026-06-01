import { Badge } from '@/components/ui/Badge'
import { ORDER_STATUS_LABELS, ORDER_STATUS_VARIANTS } from '@/constants/orders'
import type { OrderStatus } from '@/types/order'

type OrderStatusBadgeProps = {
  status: OrderStatus | string
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const key = status as OrderStatus
  const label = ORDER_STATUS_LABELS[key] ?? status
  const variant = ORDER_STATUS_VARIANTS[key] ?? 'neutral'

  return <Badge variant={variant}>{label}</Badge>
}
