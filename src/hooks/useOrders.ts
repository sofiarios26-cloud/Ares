import { useCallback, useEffect, useState } from 'react'
import { ordersService } from '@/services/orders.service'
import type { OrderWithProduct } from '@/types/order'

export function useOrders(buyerId: string | undefined) {
  const [orders, setOrders] = useState<OrderWithProduct[]>([])
  const [isLoading, setIsLoading] = useState(Boolean(buyerId))
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!buyerId) {
      setOrders([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await ordersService.listByBuyer(buyerId)
      setOrders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar compras')
    } finally {
      setIsLoading(false)
    }
  }, [buyerId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { orders, isLoading, error, refresh }
}
