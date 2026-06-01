import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AuthErrorBanner } from '@/components/auth/AuthErrorBanner'
import { ProductGallery, SellerCard } from '@/components/marketplace'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Navbar } from '@/components/ui/Navbar'
import { PageLoader } from '@/components/ui/Spinner'
import { IconHeart, IconLeaf } from '@/components/icons/NavIcons'
import { useAuth } from '@/hooks/useAuth'
import { useCheckout } from '@/hooks/useCheckout'
import { useProduct } from '@/hooks/useProduct'
import { useProductEngagement } from '@/hooks/useProductEngagement'
import { ordersService } from '@/services/orders.service'
import { formatPrice, formatRelativeDate } from '@/utils/format'

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const { product, related, isLoading, error } = useProduct(id)
  const {
    isLiked,
    isSaved,
    likes,
    isTogglingLike,
    isTogglingSave,
    toggleLike,
    toggleSave,
  } = useProductEngagement(id, product?.likes ?? 0)

  const [actionError, setActionError] = useState<string | null>(null)
  const [shareMessage, setShareMessage] = useState<string | null>(null)
  const [isContactLoading, setIsContactLoading] = useState(false)
  const [isSold, setIsSold] = useState(false)
  const { startCheckout, isLoading: isCheckoutLoading, error: checkoutError, clearError } = useCheckout()

  useEffect(() => {
    if (!id) return
    ordersService.hasApprovedOrder(id).then(setIsSold).catch(() => setIsSold(false))
  }, [id])

  if (isLoading) return <PageLoader />

  if (error || !product) {
    return (
      <div className="page-enter flex flex-1 flex-col">
        <Navbar title="Producto" showBack />
        <div className="px-4">
          <AuthErrorBanner message={error ?? 'Producto no encontrado'} />
          <Button className="mt-4" onClick={() => navigate('/')}>
            Volver al inicio
          </Button>
        </div>
      </div>
    )
  }

  const requireAuth = (action: () => Promise<void>) => async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${id}` } })
      return
    }
    setActionError(null)
    try {
      await action()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error')
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    const text = `${product.title} — ${formatPrice(product.price)} en ARES`

    try {
      if (navigator.share) {
        await navigator.share({ title: product.title, text, url })
      } else {
        await navigator.clipboard.writeText(url)
        setShareMessage('Enlace copiado al portapapeles')
        window.setTimeout(() => setShareMessage(null), 2500)
      }
    } catch {
      /* user cancelled share */
    }
  }

  const handleContactSeller = async () => {
    if (!isAuthenticated || !user) {
      navigate('/login', { state: { from: `/products/${id}` } })
      return
    }

    if (product.user_id === user.id) {
      setActionError('No podés contactarte sobre tu propia publicación.')
      return
    }

    setIsContactLoading(true)
    setActionError(null)

    try {
      navigate(`/inbox/${product.user_id}`, {
        state: {
          productId: product.id,
          productTitle: product.title,
          prefilled: `Hola, me interesa "${product.title}". ¿Sigue disponible?`,
        },
      })
    } finally {
      setIsContactLoading(false)
    }
  }

  const handleBuy = async () => {
    if (!isAuthenticated || !user) {
      navigate('/login', { state: { from: `/products/${id}` } })
      return
    }

    if (product.user_id === user.id) {
      setActionError('No podés comprar tu propia publicación.')
      return
    }

    if (isSold) {
      setActionError('Esta pieza ya fue vendida.')
      return
    }

    clearError()
    setActionError(null)
    await startCheckout(product.id)
  }

  const displayError = actionError ?? checkoutError
  const isOwnProduct = user?.id === product.user_id

  return (
    <div className="page-enter flex flex-1 flex-col">
      <Navbar
        title={product.brand ?? 'Pieza'}
        showBack
        rightSlot={
          <button
            type="button"
            onClick={handleShare}
            className="text-xs font-medium text-ares-gold-light transition-colors duration-300 hover:text-ares-gold"
          >
            Compartir
          </button>
        }
      />

      <div className="flex flex-col gap-5 px-4 pb-6">
        <AuthErrorBanner message={displayError} />
        {shareMessage ? (
          <p className="rounded-2xl border border-ares-eco/30 bg-ares-eco/10 px-4 py-2 text-sm text-ares-eco">
            {shareMessage}
          </p>
        ) : null}

        <ProductGallery images={product.images} title={product.title} />

        <div className="animate-slide-up space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="gold">{product.category}</Badge>
            <Badge variant="neutral">{product.condition}</Badge>
            {product.size ? <Badge variant="outline">Talle {product.size}</Badge> : null}
            {product.category === 'Eco' ? (
              <Badge variant="eco" icon={<IconLeaf className="size-3" />}>
                Eco
              </Badge>
            ) : null}
            {isSold ? <Badge variant="neutral">Vendida</Badge> : null}
          </div>

          <h1 className="font-display text-2xl font-bold text-ares-white">
            {product.title}
          </h1>
          <p className="font-display text-3xl font-bold text-ares-gold-light">
            {formatPrice(product.price)}
          </p>
          <p className="text-xs text-ares-gray">
            Publicado {formatRelativeDate(product.created_at)}
            {product.location ? ` · ${product.location}` : ''}
          </p>
        </div>

        {product.description ? (
          <p className="text-sm leading-relaxed text-ares-gray">{product.description}</p>
        ) : null}

        <div className="grid grid-cols-2 gap-2 text-sm">
          {product.brand ? (
            <Detail label="Marca" value={product.brand} />
          ) : null}
          {product.color ? <Detail label="Color" value={product.color} /> : null}
          {product.size ? <Detail label="Talle" value={product.size} /> : null}
          <Detail label="Estado" value={product.condition} />
        </div>

        <div className="flex gap-2">
          <Button
            variant={isLiked ? 'primary' : 'outline'}
            className="flex-1"
            isLoading={isTogglingLike}
            onClick={requireAuth(toggleLike)}
            leftIcon={<IconHeart className={isLiked ? 'size-4 fill-current' : 'size-4'} />}
          >
            {likes} {likes === 1 ? 'Like' : 'Likes'}
          </Button>
          <Button
            variant={isSaved ? 'secondary' : 'outline'}
            className="flex-1"
            isLoading={isTogglingSave}
            onClick={requireAuth(toggleSave)}
          >
            {isSaved ? 'Guardado' : 'Guardar'}
          </Button>
        </div>

        {!isOwnProduct && !isSold ? (
          <Button
            fullWidth
            size="lg"
            isLoading={isCheckoutLoading}
            onClick={() => void handleBuy()}
          >
            Comprar con Mercado Pago
          </Button>
        ) : null}

        <Button
          fullWidth
          size="lg"
          variant={!isOwnProduct && !isSold ? 'outline' : 'primary'}
          isLoading={isContactLoading}
          onClick={handleContactSeller}
        >
          Contactar vendedor
        </Button>

        {product.seller ? <SellerCard seller={product.seller} /> : null}

        {related.length > 0 ? (
          <section className="space-y-3 pt-2">
            <h2 className="font-display text-lg font-semibold text-ares-white">
              Piezas relacionadas
            </h2>
            <div className="grid gap-4">
              {related.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(`/products/${item.id}`)}
                  className="press-scale rounded-app-xl border border-white/6 bg-ares-dark-elevated p-3 text-left transition-all duration-300 hover:border-ares-gold/25"
                >
                  <p className="font-medium text-ares-white">{item.title}</p>
                  <p className="text-sm text-ares-gold-light">{formatPrice(item.price)}</p>
                </button>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl glass px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-ares-gray">{label}</p>
      <p className="font-medium text-ares-white">{value}</p>
    </div>
  )
}
