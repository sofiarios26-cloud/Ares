import { useCallback, useEffect, useState } from 'react'
import { mercadopagoService } from '@/services/mercadopago.service'
import { ordersService } from '@/services/orders.service'
import type { OrderWithProduct } from '@/types/order'

export function useOrderSync(orderId: string | null, paymentId: string | null) {
  const [order, setOrder] = useState<OrderWithProduct | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(orderId))
  const [error, setError] = useState<string | null>(null)

  const sync = useCallback(async () => {
    if (!orderId && !paymentId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      if (paymentId) {
        const synced = await mercadopagoService.syncOrder({ paymentId })
        const full = await ordersService.getById(synced.id)
        setOrder(full)
        return
      }

      if (orderId) {
        await mercadopagoService.syncOrder({ orderId })
        const full = await ordersService.getById(orderId)
        setOrder(full)
      }
    } catch (err) {
      if (orderId) {
        try {
          const fallback = await ordersService.getById(orderId)
          setOrder(fallback)
        } catch {
          /* ignore fallback error */
        }
      }
      setError(err instanceof Error ? err.message : 'No se pudo verificar el pago')
    } finally {
      setIsLoading(false)
    }
  }, [orderId, paymentId])

  useEffect(() => {
    void sync()
  }, [sync])

  return { order, isLoading, error, refresh: sync }
}
