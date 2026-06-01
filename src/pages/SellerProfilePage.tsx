import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ProductFeed } from '@/components/marketplace'
import { ProfileAvatar } from '@/components/profile/ProfileAvatar'
import { Badge } from '@/components/ui/Badge'
import { Navbar } from '@/components/ui/Navbar'
import { PageLoader } from '@/components/ui/Spinner'
import { IconLeaf } from '@/components/icons/NavIcons'
import { useProducts } from '@/hooks/useProducts'
import { profilesService } from '@/services/profiles.service'
import type { Profile } from '@/types/database'

export function SellerProfilePage() {
  const { username } = useParams<{ username: string }>()
  const [seller, setSeller] = useState<Profile | null>(null)
  const [isLoadingSeller, setIsLoadingSeller] = useState(true)
  const [sellerError, setSellerError] = useState<string | null>(null)

  const {
    products,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
  } = useProducts({ userId: seller?.id, sort: 'newest' }, Boolean(seller?.id))

  useEffect(() => {
    if (!username) return

    setIsLoadingSeller(true)
    profilesService
      .getByUsername(username)
      .then((data) => {
        if (!data) setSellerError('Vendedor no encontrado')
        setSeller(data)
      })
      .catch((err) => {
        setSellerError(err instanceof Error ? err.message : 'Error')
      })
      .finally(() => setIsLoadingSeller(false))
  }, [username])

  if (isLoadingSeller) return <PageLoader />

  if (sellerError || !seller) {
    return (
      <div className="page-enter flex flex-1 flex-col">
        <Navbar title="Vendedor" showBack />
        <p className="px-4 text-sm text-ares-gray">{sellerError ?? 'No encontrado'}</p>
      </div>
    )
  }


  return (
    <div className="page-enter flex flex-1 flex-col">
      <Navbar title={`@${seller.username}`} showBack />

      <div className="flex flex-col gap-5 px-4 pb-4">
        <section className="flex flex-col items-center gap-3 pt-2 text-center">
          <ProfileAvatar name={seller.username} avatarUrl={seller.avatar} size="lg" />
          <div>
            <h2 className="font-display text-xl font-bold text-ares-white">
              @{seller.username}
            </h2>
            <p className="text-sm text-ares-gray">
              {seller.location ?? 'ARES'} ·{' '}
              {seller.rating > 0 ? `${seller.rating.toFixed(1)} ★` : 'Nuevo vendedor'}
            </p>
          </div>
          {seller.bio ? (
            <p className="max-w-sm text-sm leading-relaxed text-ares-gray">{seller.bio}</p>
          ) : null}
          <Badge variant="eco" icon={<IconLeaf className="size-3" />}>
            Vendedor ARES
          </Badge>
        </section>

        <ProductFeed
          products={products}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          error={error}
          onLoadMore={loadMore}
          onRetry={refresh}
          emptyTitle="Sin publicaciones"
          emptyDescription="Este vendedor aún no publicó piezas."
        />
      </div>
    </div>
  )
}
