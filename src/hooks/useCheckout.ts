import { useCallback, useState } from 'react'
import { mercadopagoService } from '@/services/mercadopago.service'

export function useCheckout() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startCheckout = useCallback(async (productId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const { initPoint } = await mercadopagoService.createCheckout(productId)
      window.location.assign(initPoint)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar el checkout')
      setIsLoading(false)
      return false
    }
  }, [])

  return { startCheckout, isLoading, error, clearError: () => setError(null) }
}
