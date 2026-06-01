import { useNavigate } from 'react-router-dom'
import { ConversationItem } from '@/components/chat'
import { EmptyState } from '@/components/ui/EmptyState'
import { Navbar } from '@/components/ui/Navbar'
import { PageLoader } from '@/components/ui/Spinner'
import { IconMessage } from '@/components/icons/NavIcons'
import { useAuth } from '@/hooks/useAuth'
import { useConversations } from '@/hooks/useConversations'

export function InboxPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { conversations, isLoading, error, refresh } = useConversations(user?.id)

  return (
    <div className="page-enter flex min-h-dvh flex-col">
      <Navbar
        title="Mensajes"
        showBack
        rightSlot={
          <button
            type="button"
            onClick={() => refresh()}
            className="text-xs text-ares-gold-light transition-colors duration-300 hover:text-ares-gold"
          >
            Actualizar
          </button>
        }
      />

      <div className="flex flex-1 flex-col gap-3 px-4 pb-4">
        {isLoading ? (
          <PageLoader />
        ) : error ? (
          <EmptyState
            icon={<IconMessage className="size-7 text-red-400" />}
            title="Error al cargar"
            description={error}
            actionLabel="Reintentar"
            onAction={refresh}
          />
        ) : conversations.length === 0 ? (
          <EmptyState
            icon={<IconMessage className="size-7 text-ares-gold-light" />}
            title="Sin conversaciones"
            description="Contactá a un vendedor desde una pieza para iniciar un chat."
            actionLabel="Explorar piezas"
            onAction={() => navigate('/discover')}
          />
        ) : (
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation.partnerId}
              conversation={conversation}
              currentUserId={user!.id}
            />
          ))
        )}
      </div>
    </div>
  )
}
