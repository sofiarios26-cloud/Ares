import { MercadoPagoConfig, Payment, Preference } from 'npm:mercadopago@2'

export type OrderStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export function getMercadoPagoConfig() {
  const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
  if (!accessToken) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN is not configured')
  }

  return new MercadoPagoConfig({ accessToken })
}

export function isSandboxToken(accessToken: string) {
  return accessToken.startsWith('TEST-')
}

export function getPreferenceClient() {
  return new Preference(getMercadoPagoConfig())
}

export function getPaymentClient() {
  return new Payment(getMercadoPagoConfig())
}

export function mapPaymentStatus(mpStatus: string | undefined): OrderStatus {
  switch (mpStatus) {
    case 'approved':
      return 'approved'
    case 'rejected':
      return 'rejected'
    case 'cancelled':
      return 'cancelled'
    default:
      return 'pending'
  }
}

export function getCheckoutUrl(preference: {
  init_point?: string
  sandbox_init_point?: string
}) {
  const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN') ?? ''
  const useSandbox =
    Deno.env.get('MERCADOPAGO_SANDBOX') === 'true' || isSandboxToken(accessToken)

  const url = useSandbox
    ? preference.sandbox_init_point ?? preference.init_point
    : preference.init_point ?? preference.sandbox_init_point

  if (!url) {
    throw new Error('Mercado Pago did not return a checkout URL')
  }

  return url
}

export function getAppUrl() {
  return (
    Deno.env.get('APP_URL') ??
    Deno.env.get('VITE_APP_URL') ??
    'http://localhost:5173'
  ).replace(/\/$/, '')
}

export function getWebhookUrl() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL is not configured')
  }
  return `${supabaseUrl.replace(/\/$/, '')}/functions/v1/mercadopago-webhook`
}

export async function fetchPaymentById(paymentId: string) {
  const paymentClient = getPaymentClient()
  return paymentClient.get({ id: paymentId })
}

export async function syncOrderFromPayment(
  supabase: ReturnType<typeof import('jsr:@supabase/supabase-js@2').createClient>,
  paymentId: string,
) {
  const payment = await fetchPaymentById(paymentId)
  const orderId = payment.external_reference

  if (!orderId) {
    throw new Error('Payment has no external_reference')
  }

  const status = mapPaymentStatus(payment.status)
  const { data: order, error } = await supabase
    .from('orders')
    .update({
      payment_id: String(payment.id),
      status,
    })
    .eq('id', orderId)
    .select('*')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  if (status === 'approved') {
    const { data: product } = await supabase
      .from('products')
      .select('title')
      .eq('id', order.product_id)
      .maybeSingle()

    await supabase.from('notifications').insert({
      user_id: order.seller_id,
      type: 'purchase',
      content: `¡Vendiste "${product?.title ?? 'una pieza'}"! Pago aprobado.`,
    })
  }

  return order
}
