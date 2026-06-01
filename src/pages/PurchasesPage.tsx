import { OrderListItem } from '@/components/orders'
import { EmptyState } from '@/components/ui/EmptyState'
import { Navbar } from '@/components/ui/Navbar'
import { PageLoader } from '@/components/ui/Spinner'
import { useAuth } from '@/hooks/useAuth'
import { useOrders } from '@/hooks/useOrders'

export function PurchasesPage() {
  const { user } = useAuth()
  const { orders, isLoading, error, refresh } = useOrders(user?.id)

  return (
    <div className="page-enter flex flex-1 flex-col">
      <Navbar
        title="Mis compras"
        showBack
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

      <div className="flex flex-col gap-3 px-4 pb-4">
        {isLoading ? (
          <PageLoader />
        ) : error ? (
          <EmptyState
            title="Error al cargar"
            description={error}
            actionLabel="Reintentar"
            onAction={refresh}
          />
        ) : orders.length === 0 ? (
          <EmptyState
            title="Sin compras aún"
            description="Cuando compres una pieza, aparecerá acá con su estado de pago."
          />
        ) : (
          orders.map((order) => <OrderListItem key={order.id} order={order} />)
        )}
      </div>
    </div>
  )
}
