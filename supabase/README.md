# Supabase setup for ARES

## 1. Create project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a project.
2. Copy **Project URL** and **anon public** key into `.env`:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
```

## 2. Run database migration

In the Supabase dashboard → **SQL Editor**, paste and run:

`supabase/migrations/001_initial_schema.sql`

This creates tables, RLS policies, storage bucket `clothing-images`, and the profile auto-create trigger.

## 3. Run messaging migration

Run `supabase/migrations/002_messaging_realtime.sql` in the SQL Editor to enable:

- Notification insert policy (for message/like/save alerts)
- Realtime on `messages` and `notifications`

## 4. Profile avatars storage

Run `supabase/migrations/003_profile_avatars.sql` to create the `profile-avatars` bucket and upload policies.

## 5. Orders & Mercado Pago

Run `supabase/migrations/004_orders.sql` in the SQL Editor to create the `orders` table and RLS policies.

### Edge Functions

Deploy the payment functions from the project root (requires [Supabase CLI](https://supabase.com/docs/guides/cli)):

```bash
supabase functions deploy create-checkout
supabase functions deploy sync-order
supabase functions deploy mercadopago-webhook --no-verify-jwt
```

Set secrets in the Supabase dashboard (**Project Settings → Edge Functions → Secrets**) or via CLI:

| Secret | Description |
| ------ | ----------- |
| `MERCADOPAGO_ACCESS_TOKEN` | Test or production token from [Mercado Pago Developers](https://www.mercadopago.com.ar/developers/panel/app) |
| `APP_URL` | Public app URL, e.g. `http://localhost:5173` or your production domain |
| `MERCADOPAGO_SANDBOX` | Set to `true` to use sandbox checkout URLs (optional; auto-detected for `TEST-` tokens) |

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are provided automatically to Edge Functions.

### Mercado Pago webhook

In your Mercado Pago application, configure the notification URL:

```
https://<project-ref>.supabase.co/functions/v1/mercadopago-webhook
```

Subscribe to **payment** events. The webhook updates order status and notifies the seller on approved payments.

## 6. Auth redirect URLs

In **Authentication → URL Configuration**, add:

| Type            | URL                                      |
| --------------- | ---------------------------------------- |
| Site URL        | `http://localhost:5173`                  |
| Redirect URLs   | `http://localhost:5173/auth/callback`    |
|                 | `http://localhost:5173/reset-password` |

For production, add your deployed domain with the same paths.

## 7. Google OAuth

1. **Authentication → Providers → Google** → Enable.
2. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/).
3. Authorized redirect URI (from Supabase Google provider settings):

   `https://<project-ref>.supabase.co/auth/v1/callback`

4. Paste Client ID and Client Secret into Supabase.

## 8. Email templates (optional)

Customize confirmation and reset-password emails under **Authentication → Email Templates**.

## Schema overview

| Table           | Purpose                          |
| --------------- | -------------------------------- |
| `profiles`      | User profiles (linked to auth)   |
| `products`      | Clothing listings                |
| `likes`         | Product likes                    |
| `saved_products`| Saved items per user             |
| `messages`      | Direct messages                  |
| `reviews`       | Seller reviews                   |
| `notifications` | User notifications               |
| `orders`        | Mercado Pago purchases           |

Storage bucket: **`clothing-images`** (public read, users upload under `{user_id}/`).
