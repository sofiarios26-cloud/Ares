import type { User } from '@supabase/supabase-js'
import { getSupabaseClient, isSupabaseReady } from '@/services/supabase/client'
import type { Profile } from '@/types/database'
import type { UpdateProfileInput } from '@/types/profile'
import { mapAuthError } from '@/utils/auth-errors'

function buildBaseUsername(user: User): string {
  const fromMeta = user.user_metadata?.username as string | undefined
  const raw = fromMeta ?? user.email?.split('@')[0] ?? 'user'
  const normalized = raw.toLowerCase().replace(/[^a-z0-9_]/g, '')
  return normalized || 'user'
}

export const profilesService = {
  async getById(userId: string): Promise<Profile | null> {
    if (!isSupabaseReady()) return null

    const { data, error } = await getSupabaseClient()
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) throw new Error(mapAuthError(error.message))
    return data
  },

  async getByUsername(username: string): Promise<Profile | null> {
    if (!isSupabaseReady()) return null

    const { data, error } = await getSupabaseClient()
      .from('profiles')
      .select('*')
      .eq('username', username)
      .maybeSingle()

    if (error) throw new Error(mapAuthError(error.message))
    return data
  },

  /** Creates a profile row when the DB trigger did not run (legacy users, OAuth, etc.) */
  async ensureProfile(user: User): Promise<Profile | null> {
    if (!isSupabaseReady()) return null

    const existing = await this.getById(user.id)
    if (existing) return existing

    const base = buildBaseUsername(user)
    const email = user.email ?? ''

    for (let suffix = 0; suffix < 20; suffix++) {
      const username = suffix === 0 ? base : `${base}${suffix}`

      const { data, error } = await getSupabaseClient()
        .from('profiles')
        .insert({
          id: user.id,
          username,
          email,
          avatar: (user.user_metadata?.avatar_url as string | undefined) ?? null,
        })
        .select('*')
        .maybeSingle()

      if (!error && data) return data

      if (error?.code === '23505') continue
      if (error) throw new Error(mapAuthError(error.message))
    }

    return this.getById(user.id)
  },

  async isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
    if (!isSupabaseReady()) return false

    let query = getSupabaseClient()
      .from('profiles')
      .select('id')
      .eq('username', username)

    if (excludeUserId) {
      query = query.neq('id', excludeUserId)
    }

    const { data, error } = await query.maybeSingle()
    if (error) throw new Error(mapAuthError(error.message))
    return !data
  },

  async update(userId: string, input: UpdateProfileInput): Promise<Profile> {
    if (!isSupabaseReady()) {
      throw new Error('Supabase not configured')
    }

    const { data, error } = await getSupabaseClient()
      .from('profiles')
      .update(input)
      .eq('id', userId)
      .select('*')
      .single()

    if (error) throw new Error(mapAuthError(error.message))
    return data
  },
}
