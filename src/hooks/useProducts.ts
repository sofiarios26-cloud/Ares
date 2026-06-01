import { useCallback, useEffect, useRef, useState } from 'react'
import { PAGE_SIZE } from '@/constants/marketplace'
import { productsService } from '@/services/products.service'
import type { ProductFilters, ProductWithSeller } from '@/types/marketplace'
import { mapAuthError } from '@/utils/auth-errors'

export function useProducts(initialFilters: ProductFilters = {}, enabled = true) {
  const [filters, setFilters] = useState<ProductFilters>(initialFilters)
  const [products, setProducts] = useState<ProductWithSeller[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const filtersKey = JSON.stringify(filters)
  const requestId = useRef(0)

  const fetchPage = useCallback(
    async (pageNum: number, append: boolean) => {
      const id = ++requestId.current
      try {
        if (append) {
          setIsLoadingMore(true)
        } else {
          setIsLoading(true)
        }
        setError(null)

        const result = await productsService.list(filters, pageNum, PAGE_SIZE)
        if (id !== requestId.current) return

        setProducts((prev) => (append ? [...prev, ...result.products] : result.products))
        setHasMore(result.hasMore)
        setPage(pageNum)
      } catch (err) {
        if (id !== requestId.current) return
        setError(err instanceof Error ? err.message : mapAuthError(''))
      } finally {
        if (id === requestId.current) {
          setIsLoading(false)
          setIsLoadingMore(false)
        }
      }
    },
    [filters],
  )

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false)
      setProducts([])
      return
    }
    setPage(0)
    setHasMore(true)
    fetchPage(0, false)
  }, [filtersKey, fetchPage, enabled])

  const loadMore = useCallback(() => {
    if (!enabled || isLoading || isLoadingMore || !hasMore) return
    fetchPage(page + 1, true)
  }, [enabled, fetchPage, hasMore, isLoading, isLoadingMore, page])

  const refresh = useCallback(() => {
    fetchPage(0, false)
  }, [fetchPage])

  const updateFilters = useCallback((next: Partial<ProductFilters>) => {
    setFilters((prev) => ({ ...prev, ...next }))
  }, [])

  return {
    products,
    filters,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
    setFilters: updateFilters,
  }
}
