export const NOTIFICATION_TYPES = {
  MESSAGE: 'message',
  LIKE: 'like',
  SAVE: 'save',
} as const

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES]

export type MessageNotificationPayload = {
  senderId: string
  preview: string
}

export type ProductNotificationPayload = {
  productId: string
  productTitle: string
  actorId: string
  actorUsername: string
}
