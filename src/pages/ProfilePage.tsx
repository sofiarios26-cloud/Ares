import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProductFeed } from '@/components/marketplace'
import { NavbarActions } from '@/components/chat'
import { AuthErrorBanner } from '@/components/auth/AuthErrorBanner'
import { AuthSuccessBanner } from '@/components/auth/AuthSuccessBanner'
import { EditProfileModal, ProfileAvatar } from '@/components/profile'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Navbar } from '@/components/ui/Navbar'
import { IconLeaf } from '@/components/icons/NavIcons'
import { useAuth } from '@/hooks/useAuth'
import { useProducts } from '@/hooks/useProducts'
import { productsService } from '@/services/products.service'
import { savedService } from '@/services/saved.service'
import { getAvatarUrl, getDisplayName } from '@/utils/profile'
import { mapAuthError } from '@/utils/auth-errors'

export function ProfilePage() {
  const navigate = useNavigate()
  const { profile, user, signOut, refreshProfile } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [productCount, setProductCount] = useState<number | null>(null)
  const [savedCount, setSavedCount] = useState<number | null>(null)

  const {
    products: myProducts,
    isLoading: productsLoading,
    refresh: refreshProducts,
  } = useProducts({ userId: user?.id, sort: 'newest' }, Boolean(user?.id))

  useEffect(() => {
    if (!user?.id) return

    Promise.all([
      productsService.countByUser(user.id),
      savedService.countByUser(user.id),
    ])
      .then(([pub, saved]) => {
        setProductCount(pub)
        setSavedCount(saved)
      })
      .catch(() => {
        setProductCount(0)
        setSavedCount(0)
      })
  }, [user?.id, myProducts.length])

  const displayName = getDisplayName(profile, user)
  const email = profile?.email ?? user?.email ?? ''
  const location = profile?.location ?? 'Sin ubicación'
  const avatarUrl = getAvatarUrl(profile, user)
  const rating = profile?.rating ?? 0

  const handleSignOut = async () => {
    setError(null)
    setIsSigningOut(true)
    try {
      await signOut()
      navigate('/welcome', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : mapAuthError(''))
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <div className="page-enter flex flex-1 flex-col">
      <Navbar
        title="Perfil"
        showBack={false}
        rightSlot={
          <div className="flex items-center gap-1">
            <NavbarActions />
            <button
              type="button"
              onClick={() => {
                refreshProfile()
                refreshProducts()
              }}
              className="text-xs text-ares-gold-light transition-colors duration-300 hover:text-ares-gold"
            >
              Actualizar
            </button>
          </div>
        }
      />

      <div className="flex flex-col gap-5 px-4 pb-4">
        <AuthErrorBanner message={error} />
        <AuthSuccessBanner message={success} />

        <section className="animate-slide-up flex flex-col items-center gap-4 pt-2 text-center">
          <ProfileAvatar
            name={displayName}
            avatarUrl={avatarUrl}
            size="xl"
            showStatus
          />
          <div>
            <h2 className="font-display text-xl font-bold text-ares-white">
              {displayName}
            </h2>
            <p className="text-sm text-ares-gray">
              @{profile?.username ?? 'usuario'} · {location}
            </p>
            {email ? <p className="mt-1 text-xs text-ares-gray-light">{email}</p> : null}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="eco" icon={<IconLeaf className="size-3" />}>
              Eco Lover
            </Badge>
            {rating > 0 ? (
              <Badge variant="gold">{rating.toFixed(1)} ★</Badge>
            ) : (
              <Badge variant="neutral">Nuevo</Badge>
            )}
          </div>
          <Button variant="secondary" size="sm" onClick={() => setIsEditOpen(true)}>
            Editar perfil
          </Button>
        </section>

        <div className="grid grid-cols-3 gap-2 animate-slide-up-delayed">
          {[
            { label: 'Publicaciones', value: productCount ?? '—' },
            { label: 'Guardados', value: savedCount ?? '—' },
            { label: 'Likes', value: '—' },
          ].map((stat) => (
            <Card key={stat.label} variant="glass" padding="sm" className="text-center">
              <p className="font-display text-lg font-bold text-ares-gold-light">
                {stat.value}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-ares-gray">
                {stat.label}
              </p>
            </Card>
          ))}
        </div>

        <Card variant="elevated" padding="lg" className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-ares-white">Tu guardarropa</h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/purchases')}>
                Compras
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/inbox')}>
                Mensajes
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/sell')}>
                + Publicar
              </Button>
            </div>
          </div>
          <p className="text-sm text-ares-gray">
            {profile?.bio ?? 'Completá tu bio para que otros te conozcan mejor.'}
          </p>
        </Card>

        <ProductFeed
          products={myProducts}
          isLoading={productsLoading}
          isLoadingMore={false}
          hasMore={false}
          error={null}
          onLoadMore={() => {}}
          onRetry={refreshProducts}
          emptyTitle="Sin publicaciones"
          emptyDescription="Publicá tu primera pieza con el botón + del menú."
        />

        <Button
          variant="outline"
          fullWidth
          size="md"
          isLoading={isSigningOut}
          onClick={handleSignOut}
        >
          Cerrar sesión
        </Button>
      </div>

      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSaved={() => {
          setSuccess('Perfil actualizado correctamente.')
          window.setTimeout(() => setSuccess(null), 3000)
        }}
      />
    </div>
  )
}
