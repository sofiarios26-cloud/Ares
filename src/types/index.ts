export type ApiResult<T> =
  | { data: T; error: null }
  | { data: null; error: string }

export type {
  Database,
  Message,
  Notification,
  Product,
  Profile,
} from './database'
export type {
  CreateProductInput,
  ProductFilters,
  ProductWithSeller,
  SellerPreview,
} from './marketplace'
export type { ChatMessage, Conversation } from './chat'
export type {
  CreateCheckoutResponse,
  OrderStatus,
  OrderWithParties,
  OrderWithProduct,
  SyncOrderResponse,
} from './order'
export type {
  ProfileEditorData,
  UpdateProfileInput,
} from './profile'
