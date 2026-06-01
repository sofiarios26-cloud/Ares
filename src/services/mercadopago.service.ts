import { getSupabaseClient, isSupabaseReady } from '@/services/supabase/client'
import type { CreateCheckoutResponse, SyncOrderResponse } from '@/types/order'
import { mapAuthError } from '@/utils/auth-errors'

async function getAccessToken(): Promise<string> {
  const { data: { session } } = await getSupabaseClient().auth.getSession()
  if (!session?.access_token) {
    throw new Error('Debes iniciar sesión para continuar.')
  }
  return session.access_token
}

function parseFunctionError(error: unknown, data: unknown): string {
  if (data && typeof data === 'object' && 'error' in data) {
    const message = (data as { error?: string }).error
    if (message) return message
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return mapAuthError(String((error as { message: string }).message))
  }

  return 'No se pudo procesar el pago. Intentá de nuevo.'
}

export const mercadopagoService = {
  async createCheckout(productId: string): Promise<CreateCheckoutResponse> {
    if (!isSupabaseReady()) {
      throw new Error('Supabase not configured')
    }

    const token = await getAccessToken()
    const { data, error } = await getSupabaseClient().functions.invoke('create-checkout', {
      body: { productId },
      headers: { Authorization: `Bearer ${token}` },
    })

    if (error || !data?.initPoint || !data?.orderId) {
      throw new Error(parseFunctionError(error, data))
    }

    return {
      orderId: data.orderId,
      initPoint: data.initPoint,
    }
  },

  async syncOrder(input: {
    orderId?: string
    paymentId?: string
  }): Promise<SyncOrderResponse['order']> {
    if (!isSupabaseReady()) {
      throw new Error('Supabase not configured')
    }

    const token = await getAccessToken()
    const { data, error } = await getSupabaseClient().functions.invoke('sync-order', {
      body: input,
      headers: { Authorization: `Bearer ${token}` },
    })

    if (error || !data?.order) {
      throw new Error(parseFunctionError(error, data))
    }

    return data.order
  },
}
