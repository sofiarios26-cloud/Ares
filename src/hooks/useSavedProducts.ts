import { useCallback, useEffect, useState } from 'react'
import { savedService } from '@/services/saved.service'
import type { ProductWithSeller } from '@/types/marketplace'
import { mapAuthError } from '@/utils/auth-errors'

export function useSavedProducts(userId: string | undefined) {
  const [products, setProducts] = useState<ProductWithSeller[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!userId) {
      setProducts([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await savedService.list(userId)
      setProducts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : mapAuthError(''))
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  return { products, isLoading, error, refresh: load }
}
