import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders, errorResponse, jsonResponse } from '../_shared/cors.ts'
import { syncOrderFromPayment } from '../_shared/mercadopago.ts'

async function extractPaymentId(req: Request): Promise<string | null> {
  const url = new URL(req.url)

  const queryId = url.searchParams.get('data.id') ?? url.searchParams.get('id')
  if (queryId) return queryId

  if (req.method === 'POST') {
    try {
      const body = await req.json()
      if (body?.data?.id) return String(body.data.id)
      if (body?.id) return String(body.id)
    } catch {
      /* ignore invalid JSON */
    }
  }

  return null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return errorResponse('Method not allowed', 405)
  }

  try {
    const paymentId = await extractPaymentId(req)
    if (!paymentId) {
      return jsonResponse({ received: true, skipped: true })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !serviceRoleKey) {
      return errorResponse('Supabase is not configured', 500)
    }

    const admin = createClient(supabaseUrl, serviceRoleKey)
    const order = await syncOrderFromPayment(admin, paymentId)

    return jsonResponse({ received: true, orderId: order.id, status: order.status })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook failed'
    console.error('[mercadopago-webhook]', message)
    return jsonResponse({ received: true, error: message })
  }
})
