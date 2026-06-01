import type { Message } from '@/types/database'
import type { SellerPreview } from '@/types/marketplace'

export type Conversation = {
  partnerId: string
  partner: SellerPreview
  lastMessage: Message
  unreadCount: number
}

export type ChatMessage = Message & {
  isOwn: boolean
}
