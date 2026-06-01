import { useEffect, useState } from 'react'
import {
  CategoryChips,
  FilterBar,
  ProductFeed,
  SearchBar,
} from '@/components/marketplace'
import { Navbar } from '@/components/ui/Navbar'
import type { ProductSort } from '@/constants/marketplace'
import { useProducts } from '@/hooks/useProducts'

export function DiscoverPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [category, setCategory] = useState<string | undefined>()
  const [sort, setSort] = useState<ProductSort>('newest')

  const {
    products,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
    setFilters,
  } = useProducts({ sort: 'newest' })

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 350)
    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setFilters({
      search: debouncedSearch || undefined,
      category,
      sort,
    })
  }, [debouncedSearch, category, sort, setFilters])

  return (
    <div className="page-enter flex flex-1 flex-col">
      <Navbar title="Explorar" subtitle="Descubrí piezas" />

      <div className="flex flex-col gap-4 px-4 pb-4">
        <SearchBar value={search} onChange={setSearch} />
        <CategoryChips selected={category} onSelect={setCategory} />
        <FilterBar sort={sort} onSortChange={setSort} />

        <ProductFeed
          products={products}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          error={error}
          onLoadMore={loadMore}
          onRetry={refresh}
          emptyTitle="Sin resultados"
          emptyDescription="Probá otra búsqueda o categoría."
        />
      </div>
    </div>
  )
}
