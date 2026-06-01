import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'
import { getSupabaseClient, isSupabaseReady } from '@/services/supabase/client'
import { mapAuthError } from '@/utils/auth-errors'

export type SignUpInput = {
  email: string
  password: string
  username: string
  fullName?: string
}

export type SignInInput = {
  email: string
  password: string
}

function assertSupabase() {
  if (!isSupabaseReady()) {
    throw new Error('Supabase not configured')
  }
}

function getRedirectUrl(path = '/auth/callback'): string {
  return `${window.location.origin}${path}`
}

export const authService = {
  async getSession(): Promise<Session | null> {
    assertSupabase()
    const { data, error } = await getSupabaseClient().auth.getSession()
    if (error) throw new Error(mapAuthError(error.message))
    return data.session
  },

  async getUser(): Promise<User | null> {
    assertSupabase()
    const { data, error } = await getSupabaseClient().auth.getUser()
    if (error) throw new Error(mapAuthError(error.message))
    return data.user
  },

  onAuthStateChange(
    callback: (event: AuthChangeEvent, session: Session | null) => void,
  ) {
    assertSupabase()
    const {
      data: { subscription },
    } = getSupabaseClient().auth.onAuthStateChange(callback)
    return subscription
  },

  async signUp({ email, password, username, fullName }: SignUpInput) {
    assertSupabase()
    const { data, error } = await getSupabaseClient().auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getRedirectUrl(),
        data: {
          username: username.toLowerCase().trim(),
          full_name: fullName?.trim(),
        },
      },
    })
    if (error) throw new Error(mapAuthError(error.message))
    return data
  },

  async signIn({ email, password }: SignInInput) {
    assertSupabase()
    const { data, error } = await getSupabaseClient().auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw new Error(mapAuthError(error.message))
    return data
  },

  async signInWithGoogle() {
    assertSupabase()
    const { data, error } = await getSupabaseClient().auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getRedirectUrl(),
      },
    })
    if (error) throw new Error(mapAuthError(error.message))
    return data
  },

  async signOut() {
    assertSupabase()
    const { error } = await getSupabaseClient().auth.signOut()
    if (error) throw new Error(mapAuthError(error.message))
  },

  async resetPassword(email: string) {
    assertSupabase()
    const { data, error } = await getSupabaseClient().auth.resetPasswordForEmail(
      email,
      { redirectTo: getRedirectUrl('/reset-password') },
    )
    if (error) throw new Error(mapAuthError(error.message))
    return data
  },

  async updatePassword(newPassword: string) {
    assertSupabase()
    const { data, error } = await getSupabaseClient().auth.updateUser({
      password: newPassword,
    })
    if (error) throw new Error(mapAuthError(error.message))
    return data
  },
}
