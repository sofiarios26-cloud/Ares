import { useCallback, useEffect, useState } from 'react'
import { productsService } from '@/services/products.service'
import type { ProductWithSeller } from '@/types/marketplace'
import { mapAuthError } from '@/utils/auth-errors'

export function useProduct(productId: string | undefined) {
  const [product, setProduct] = useState<ProductWithSeller | null>(null)
  const [related, setRelated] = useState<ProductWithSeller[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!productId) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await productsService.getById(productId)
      if (!data) {
        setError('Producto no encontrado')
        setProduct(null)
        setRelated([])
        return
      }

      setProduct(data)
      const relatedProducts = await productsService.getRelated(
        data.id,
        data.category,
      )
      setRelated(relatedProducts)
    } catch (err) {
      setError(err instanceof Error ? err.message : mapAuthError(''))
    } finally {
      setIsLoading(false)
    }
  }, [productId])

  useEffect(() => {
    load()
  }, [load])

  return { product, related, isLoading, error, refresh: load }
}
