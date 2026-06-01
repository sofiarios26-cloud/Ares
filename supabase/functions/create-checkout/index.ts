import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders, errorResponse, jsonResponse } from '../_shared/cors.ts'
import {
  getAppUrl,
  getCheckoutUrl,
  getPreferenceClient,
  getWebhookUrl,
} from '../_shared/mercadopago.ts'

type CreateCheckoutBody = {
  productId?: string
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

    const body = (await req.json()) as CreateCheckoutBody
    const productId = body.productId

    if (!productId) {
      return errorResponse('productId is required')
    }

    const admin = createClient(supabaseUrl, serviceRoleKey)

    const { data: product, error: productError } = await admin
      .from('products')
      .select('id, user_id, title, description, price, images')
      .eq('id', productId)
      .maybeSingle()

    if (productError) {
      return errorResponse(productError.message, 500)
    }

    if (!product) {
      return errorResponse('Product not found', 404)
    }

    if (product.user_id === user.id) {
      return errorResponse('No podés comprar tu propia publicación')
    }

    const { data: existingApproved } = await admin
      .from('orders')
      .select('id')
      .eq('product_id', productId)
      .eq('status', 'approved')
      .maybeSingle()

    if (existingApproved) {
      return errorResponse('Esta pieza ya fue vendida')
    }

    const total = Number(product.price)
    if (!Number.isFinite(total) || total <= 0) {
      return errorResponse('Invalid product price')
    }

    const { data: order, error: orderError } = await admin
      .from('orders')
      .insert({
        buyer_id: user.id,
        seller_id: product.user_id,
        product_id: product.id,
        total,
        status: 'pending',
      })
      .select('*')
      .single()

    if (orderError || !order) {
      return errorResponse(orderError?.message ?? 'Could not create order', 500)
    }

    const appUrl = getAppUrl()
    console.log('APP_URL =', appUrl)
    const preferenceClient = getPreferenceClient()

    const preference = await preferenceClient.create({
      body: {
        items: [
          {
            id: product.id,
            title: product.title.slice(0, 256),
            description: product.description?.slice(0, 256) ?? undefined,
            quantity: 1,
            unit_price: total,
            currency_id: 'ARS',
            picture_url: product.images?.[0] ?? undefined,
          },
        ],
        payer: {
          email: user.email ?? undefined,
        },
        external_reference: order.id,
        notification_url: getWebhookUrl(),
        back_urls: {
          success: `${appUrl}/checkout/success?order_id=${order.id}`,
          failure: `${appUrl}/checkout/failure?order_id=${order.id}`,
          pending: `${appUrl}/checkout/pending?order_id=${order.id}`,
        },
        metadata: {
          order_id: order.id,
          product_id: product.id,
          buyer_id: user.id,
          seller_id: product.user_id,
        },
      },
    })

    const initPoint = getCheckoutUrl(preference)

    const { error: updateError } = await admin
      .from('orders')
      .update({ preference_id: preference.id ?? null })
      .eq('id', order.id)

    if (updateError) {
      return errorResponse(updateError.message, 500)
    }

    return jsonResponse({
      orderId: order.id,
      initPoint,
      preferenceId: preference.id,
    })
  } catch (err) {
    console.error('CHECKOUT ERROR:', err)
  
    const message =
      err instanceof Error ? err.message : 'Checkout failed'
  
    return errorResponse(message, 500)
  }
})
