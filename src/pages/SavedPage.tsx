import { ProductFeed } from '@/components/marketplace'
import { Navbar } from '@/components/ui/Navbar'
import { useAuth } from '@/hooks/useAuth'
import { useSavedProducts } from '@/hooks/useSavedProducts'

export function SavedPage() {
  const { user } = useAuth()
  const { products, isLoading, error, refresh } = useSavedProducts(user?.id)

  return (
    <div className="page-enter flex flex-1 flex-col">
      <Navbar
        title="Guardados"
        rightSlot={
          <button
            type="button"
            onClick={refresh}
            className="text-xs text-ares-gold-light transition-colors duration-300 hover:text-ares-gold"
          >
            Actualizar
          </button>
        }
      />

      <div className="px-4 pb-4">
        <ProductFeed
          products={products}
          isLoading={isLoading}
          isLoadingMore={false}
          hasMore={false}
          error={error}
          onLoadMore={() => {}}
          onRetry={refresh}
          emptyTitle="Nada guardado aún"
          emptyDescription="Tocá guardar en cualquier pieza para verla acá."
        />
      </div>
    </div>
  )
}
