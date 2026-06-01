import type { Order, Product, Profile } from '@/types/database'

export type OrderStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export type OrderWithProduct = Order & {
  product: Pick<Product, 'id' | 'title' | 'price' | 'images' | 'category'> | null
}

export type OrderWithParties = OrderWithProduct & {
  seller: Pick<Profile, 'id' | 'username' | 'avatar'> | null
  buyer: Pick<Profile, 'id' | 'username' | 'avatar'> | null
}

export type CreateCheckoutResponse = {
  orderId: string
  initPoint: string
}

export type SyncOrderResponse = {
  order: Order
}
