import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { env, isSupabaseConfigured } from '@/utils/env'

let client: SupabaseClient<Database> | null = null

export function getSupabaseClient(): SupabaseClient<Database> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured')
  }

  if (!client) {
    client = createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: localStorage,
      },
    })
  }

  return client
}

export function isSupabaseReady(): boolean {
  return isSupabaseConfigured
}
