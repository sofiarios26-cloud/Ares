import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders, errorResponse, jsonResponse } from '../_shared/cors.ts'
import { syncOrderFromPayment } from '../_shared/mercadopago.ts'

type SyncOrderBody = {
  orderId?: string
  paymentId?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405)
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return errorResponse('Missing authorization header', 401)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return errorResponse('Supabase is not configured', 500)
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser()

    if (userError || !user) {
      return errorResponse('Unauthorized', 401)
    }

    const body = (await req.json()) as SyncOrderBody
    const admin = createClient(supabaseUrl, serviceRoleKey)

    if (body.paymentId) {
      const order = await syncOrderFromPayment(admin, body.paymentId)
      if (order.buyer_id !== user.id && order.seller_id !== user.id) {
        return errorResponse('Forbidden', 403)
      }
      return jsonResponse({ order })
    }

    if (!body.orderId) {
      return errorResponse('orderId or paymentId is required')
    }

    const { data: order, error: orderError } = await admin
      .from('orders')
      .select('*')
      .eq('id', body.orderId)
      .maybeSingle()

    if (orderError) {
      return errorResponse(orderError.message, 500)
    }

    if (!order) {
      return errorResponse('Order not found', 404)
    }

    if (order.buyer_id !== user.id && order.seller_id !== user.id) {
      return errorResponse('Forbidden', 403)
    }

    if (order.payment_id) {
      const synced = await syncOrderFromPayment(admin, order.payment_id)
      return jsonResponse({ order: synced })
    }

    return jsonResponse({ order })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sync failed'
    return errorResponse(message, 500)
  }
})
