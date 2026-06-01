import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'

export function getDisplayName(profile: Profile | null, user: User | null): string {
  const fromMeta = user?.user_metadata?.full_name as string | undefined
  if (fromMeta?.trim()) return fromMeta.trim()
  if (profile?.username) return profile.username
  return 'ARES Member'
}

export function getAvatarUrl(profile: Profile | null, user: User | null): string | null {
  return profile?.avatar ?? (user?.user_metadata?.avatar_url as string | undefined) ?? null
}

export function getProfileInitial(name: string): string {
  return name.charAt(0).toUpperCase() || 'A'
}

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase()
}

export function validateUsername(username: string): string | null {
  if (!USERNAME_RE.test(username)) {
    return 'Usuario: 3–20 caracteres, solo letras, números y _.'
  }
  return null
}
