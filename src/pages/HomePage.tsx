import { useState } from 'react'
import { CategoryChips, ProductFeed } from '@/components/marketplace'
import { NavbarActions } from '@/components/chat'
import { Card } from '@/components/ui/Card'
import { Navbar } from '@/components/ui/Navbar'
import { IconBag, IconLeaf } from '@/components/icons/NavIcons'
import { useProducts } from '@/hooks/useProducts'
import { useNavigate } from 'react-router-dom' 

export function HomePage() {
  const navigate = useNavigate()
  
    const [category, setCategory] = useState<string | undefined>()
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

  const handleCategory = (cat: string | undefined) => {
    setCategory(cat)
    setFilters({ category: cat, sort: 'newest' })
  }

  return (
    <div className="page-enter flex flex-1 flex-col">
      <Navbar
        subtitle="Cordoba, Argentina"
        rightSlot={
          <div className="flex items-center gap-1">
            <NavbarActions />
            <button
              type="button"
              onClick={() => navigate('/purchases')}
              className="press-scale flex size-9 items-center justify-center rounded-full glass transition-colors duration-300 hover:border-ares-gold/30"
              aria-label="Bolsa"
            >
              <IconBag className="size-5 text-ares-gold-light" />
            </button>
          </div>
        }
      />

      <div className="flex flex-col gap-6 px-4 pb-4">
        <section className="animate-slide-up space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ares-gray">
               VESTI DIFERENTE
              </p>
              <h2 className="font-display text-2xl font-bold text-ares-white">
                Destacados
              </h2>
            </div>
            <button
              type="button"
              onClick={refresh}
              className="text-xs font-medium text-ares-gold-light transition-colors duration-300 hover:text-ares-gold"
            >
              Actualizar
            </button>
          </div>

          <CategoryChips selected={category} onSelect={handleCategory} />
        </section>

        <ProductFeed
          products={products}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          error={error}
          onLoadMore={loadMore}
          onRetry={refresh}
        />

        <Card variant="glass" className="animate-slide-up-delayed">
          <p className="text-xs uppercase tracking-widest text-ares-eco">Impacto</p>
          <p className="mt-1 font-display text-lg font-semibold text-ares-white">
            Moda circular en tiempo real
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ares-gray">
            <IconLeaf className="size-3.5 text-ares-eco" />
            Cada pieza reutilizada reduce huella ambiental
          </p>
        </Card>
      </div>
    </div>
  )
}
