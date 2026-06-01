import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { AuthErrorBanner } from '@/components/auth/AuthErrorBanner'
import { ChatInput, MessageBubble } from '@/components/chat'
import { Button } from '@/components/ui/Button'
import { Navbar } from '@/components/ui/Navbar'
import { PageLoader } from '@/components/ui/Spinner'
import { useAuth } from '@/hooks/useAuth'
import { useChatThread } from '@/hooks/useChatThread'
import { useUnreadCounts } from '@/contexts/UnreadContext'

type ContactState = {
  productId?: string
  productTitle?: string
  prefilled?: string
}

export function ChatThreadPage() {
  const { userId: partnerId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const contactState = location.state as ContactState | null
  const { user } = useAuth()
  const { refresh: refreshUnread } = useUnreadCounts()
  const {
    messages,
    partner,
    isLoading,
    isSending,
    error,
    sendMessage,
    bottomRef,
  } = useChatThread(user?.id, partnerId)

  useEffect(() => {
    if (!isLoading) {
      void refreshUnread()
    }
  }, [isLoading, refreshUnread])

  if (isLoading) {
    return <PageLoader />
  }

  if (!partnerId || !partner) {
    return (
      <div className="page-enter flex flex-1 flex-col px-4">
        <Navbar title="Chat" showBack />
        <p className="text-sm text-ares-gray">Conversación no encontrada.</p>
        <Button className="mt-4" onClick={() => navigate('/inbox')}>
          Volver al inbox
        </Button>
      </div>
    )
  }

  if (user?.id === partnerId) {
    return (
      <div className="page-enter flex flex-1 flex-col px-4">
        <Navbar title="Chat" showBack />
        <p className="text-sm text-ares-gray">No podés chatear con vos mismo.</p>
      </div>
    )
  }

  return (
    <div className="page-enter flex min-h-dvh flex-col bg-ares-dark">
      <Navbar
        title={`@${partner.username}`}
        showBack
        rightSlot={
          <button
            type="button"
            onClick={() => navigate(`/seller/${partner.username}`)}
            className="text-xs font-medium text-ares-gold-light transition-colors duration-300 hover:text-ares-gold"
          >
            Perfil
          </button>
        }
      />

      {contactState?.productTitle ? (
        <div className="border-b border-white/6 px-4 py-2">
          <p className="text-[10px] uppercase tracking-widest text-ares-gray">
            Sobre la pieza
          </p>
          <button
            type="button"
            onClick={() =>
              contactState.productId
                ? navigate(`/products/${contactState.productId}`)
                : undefined
            }
            className="text-sm font-medium text-ares-gold-light"
          >
            {contactState.productTitle}
          </button>
        </div>
      ) : null}

      {error ? <AuthErrorBanner message={error} className="mx-4 mt-2" /> : null}

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-ares-gray">
            Iniciá la conversación con @{partner.username}
          </p>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <ChatInput
        onSend={sendMessage}
        isSending={isSending}
        initialMessage={contactState?.prefilled}
      />
    </div>
  )
}
