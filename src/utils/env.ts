function requireEnv(key: keyof ImportMetaEnv): string {
  const value = import.meta.env[key]
  if (!value) {
    if (import.meta.env.DEV) {
      console.warn(`[ARES] Missing environment variable: ${key}`)
    }
    return ''
  }
  return value
}

export const env = {
  supabaseUrl: requireEnv('VITE_SUPABASE_URL'),
  supabaseAnonKey: requireEnv('VITE_SUPABASE_ANON_KEY'),
} as const

export const isSupabaseConfigured =
  Boolean(env.supabaseUrl) && Boolean(env.supabaseAnonKey)
