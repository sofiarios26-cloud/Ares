import type { OrderStatus } from '@/types/order'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  cancelled: 'Cancelado',
}

export const ORDER_STATUS_VARIANTS: Record<
  OrderStatus,
  'gold' | 'eco' | 'neutral' | 'outline'
> = {
  pending: 'outline',
  approved: 'eco',
  rejected: 'neutral',
  cancelled: 'neutral',
}
