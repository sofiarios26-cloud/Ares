import { useMemo, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AuthErrorBanner } from '@/components/auth/AuthErrorBanner'
import { OrderStatusBadge } from '@/components/orders'
import { Button } from '@/components/ui/Button'
import { Navbar } from '@/components/ui/Navbar'
import { PageLoader } from '@/components/ui/Spinner'
import { useOrderSync } from '@/hooks/useOrderSync'
import { formatPrice } from '@/utils/format'

function useCheckoutParams() {
  const [params] = useSearchParams()

  return useMemo(() => ({
    orderId: params.get('order_id') ?? params.get('external_reference'),
    paymentId:
      params.get('payment_id') ??
      params.get('collection_id') ??
      params.get('collectionId'),
  }), [params])
}

function CheckoutResultLayout({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="page-enter flex flex-1 flex-col">
      <Navbar title={title} showBack />
      <div className="flex flex-1 flex-col gap-5 px-4 pb-6">{children}</div>
    </div>
  )
}

export function CheckoutSuccessPage() {
  const navigate = useNavigate()
  const { orderId, paymentId } = useCheckoutParams()
  const { order, isLoading, error } = useOrderSync(orderId, paymentId)

  if (isLoading) return <PageLoader />

  return (
    <CheckoutResultLayout title="Pago confirmado">
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-ares-eco/15 ring-2 ring-ares-eco/40">
          <span className="text-2xl">✓</span>
        </div>
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold text-ares-white">
            ¡Compra exitosa!
          </h1>
          <p className="text-sm text-ares-gray">
            Tu pago fue procesado correctamente.
          </p>
        </div>
        {order ? (
          <div className="w-full rounded-2xl glass p-4 text-left">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="font-medium text-ares-white">
                {order.product?.title ?? 'Tu compra'}
              </p>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-sm text-ares-gold-light">{formatPrice(order.total)}</p>
          </div>
        ) : null}
        <AuthErrorBanner message={error} />
        <div className="flex w-full flex-col gap-2 pt-2">
        <button
  style={{
    width: '100%',
    padding: '16px',
    background: 'red',
    color: 'white',
    zIndex: 99999,
    position: 'relative',
  }}
  onClick={() => {
    console.log('CLICK');
    navigate('/purchases');
  }}
>
  TEST COMPRAS
</button>
          <Button variant="outline" fullWidth onClick={() => navigate('/')}>
            Volver al inicio
          </Button>
        </div>
      </div>
    </CheckoutResultLayout>
  )
}

export function CheckoutPendingPage() {
  const navigate = useNavigate()
  const { orderId, paymentId } = useCheckoutParams()
  const { order, isLoading, error } = useOrderSync(orderId, paymentId)

  if (isLoading) return <PageLoader />

  return (
    <CheckoutResultLayout title="Pago pendiente">
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-ares-gold/10 ring-2 ring-ares-gold/30">
          <span className="text-2xl">⏳</span>
        </div>
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold text-ares-white">
            Pago en proceso
          </h1>
          <p className="text-sm text-ares-gray">
            Estamos verificando tu pago. Te avisaremos cuando se confirme.
          </p>
        </div>
        {order ? (
          <div className="w-full rounded-2xl glass p-4 text-left">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="font-medium text-ares-white">
                {order.product?.title ?? 'Tu compra'}
              </p>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-sm text-ares-gold-light">{formatPrice(order.total)}</p>
          </div>
        ) : null}
        <AuthErrorBanner message={error} />
        <div className="flex w-full flex-col gap-2 pt-2">
          <Button fullWidth onClick={() => navigate('/purchases')}>
            Ver mis compras
          </Button>
          <Button variant="outline" fullWidth onClick={() => navigate('/')}>
            Volver al inicio
          </Button>
        </div>
      </div>
    </CheckoutResultLayout>
  )
}

export function CheckoutFailurePage() {
  const navigate = useNavigate()
  const { orderId, paymentId } = useCheckoutParams()
  const { order, isLoading, error } = useOrderSync(orderId, paymentId)

  if (isLoading) return <PageLoader />

  return (
    <CheckoutResultLayout title="Pago no completado">
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-red-500/10 ring-2 ring-red-500/30">
          <span className="text-2xl">✕</span>
        </div>
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold text-ares-white">
            Pago rechazado
          </h1>
          <p className="text-sm text-ares-gray">
            No se pudo completar el pago. Podés intentarlo de nuevo.
          </p>
        </div>
        {order ? (
          <div className="w-full rounded-2xl glass p-4 text-left">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="font-medium text-ares-white">
                {order.product?.title ?? 'Tu compra'}
              </p>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-sm text-ares-gold-light">{formatPrice(order.total)}</p>
          </div>
        ) : null}
        <AuthErrorBanner message={error} />
        <div className="flex w-full flex-col gap-2 pt-2">
          {order?.product?.id ? (
            <Button fullWidth onClick={() => navigate(`/products/${order.product!.id}`)}>
              Reintentar compra
            </Button>
          ) : null}
          <Button variant="outline" fullWidth onClick={() => navigate('/')}>
            Volver al inicio
          </Button>
        </div>
      </div>
    </CheckoutResultLayout>
  )
}
