import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { authService } from '@/services/auth.service'
import { profilesService } from '@/services/profiles.service'
import { getSupabaseClient, isSupabaseReady } from '@/services/supabase/client'
import type { Profile } from '@/types/database'
import type { SignInInput, SignUpInput } from '@/services/auth.service'
import { mapAuthError } from '@/utils/auth-errors'

export type AuthContextValue = {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
  isConfigured: boolean
  signUp: (input: SignUpInput) => Promise<{ needsEmailConfirmation: boolean }>
  signIn: (input: SignInInput) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  refreshProfile: () => Promise<void>
  patchProfile: (next: Profile, displayName?: string) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

const AUTH_INIT_TIMEOUT_MS = 8000

async function resolveProfile(user: User): Promise<Profile | null> {
  try {
    const existing = await profilesService.getById(user.id)
    if (existing) return existing
    return await profilesService.ensureProfile(user)
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const isConfigured = isSupabaseReady()
  const profileRequestId = useRef(0)

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null)
      return
    }
    const next = await resolveProfile(user)
    setProfile(next)
  }, [user])

  const loadProfileForUser = useCallback(async (nextUser: User | null) => {
    const requestId = ++profileRequestId.current

    if (!nextUser) {
      setProfile(null)
      return
    }

    const nextProfile = await resolveProfile(nextUser)
    if (requestId === profileRequestId.current) {
      setProfile(nextProfile)
    }
  }, [])

  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false)
      return
    }

    let mounted = true
    let resolved = false

    const finishInit = () => {
      if (!mounted || resolved) return
      resolved = true
      setIsLoading(false)
    }

    const timeoutId = window.setTimeout(finishInit, AUTH_INIT_TIMEOUT_MS)

    getSupabaseClient()
      .auth.getSession()
      .then(({ data: { session: initialSession }, error }) => {
        if (!mounted) return

        if (error) {
          setSession(null)
          setUser(null)
          setProfile(null)
        } else {
          setSession(initialSession)
          setUser(initialSession?.user ?? null)
          if (initialSession?.user) {
            void loadProfileForUser(initialSession.user)
          }
        }

        finishInit()
      })
      .catch(() => {
        if (!mounted) return
        setSession(null)
        setUser(null)
        setProfile(null)
        finishInit()
      })

    const {
      data: { subscription },
    } = getSupabaseClient().auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return

      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      finishInit()

      if (nextSession?.user) {
        void loadProfileForUser(nextSession.user)
      } else {
        profileRequestId.current += 1
        setProfile(null)
      }
    })

    return () => {
      mounted = false
      window.clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [isConfigured, loadProfileForUser])

  const signUp = useCallback(async (input: SignUpInput) => {
    if (!isConfigured) {
      throw new Error(mapAuthError('Supabase not configured'))
    }
    const { session: newSession, user: newUser } = await authService.signUp(input)
    if (newSession?.user) {
      setSession(newSession)
      setUser(newSession.user)
      void loadProfileForUser(newSession.user)
    } else if (newUser) {
      setUser(newUser)
    }
    return { needsEmailConfirmation: !newSession }
  }, [isConfigured, loadProfileForUser])

  const signIn = useCallback(async (input: SignInInput) => {
    if (!isConfigured) {
      throw new Error(mapAuthError('Supabase not configured'))
    }
    const { session: newSession, user: newUser } = await authService.signIn(input)
    setSession(newSession)
    setUser(newUser)
    if (newUser) {
      void loadProfileForUser(newUser)
    }
  }, [isConfigured, loadProfileForUser])

  const signInWithGoogle = useCallback(async () => {
    if (!isConfigured) {
      throw new Error(mapAuthError('Supabase not configured'))
    }
    await authService.signInWithGoogle()
  }, [isConfigured])

  const signOut = useCallback(async () => {
    if (!isConfigured) return
    await authService.signOut()
    profileRequestId.current += 1
    setSession(null)
    setUser(null)
    setProfile(null)
  }, [isConfigured])

  const resetPassword = useCallback(async (email: string) => {
    if (!isConfigured) {
      throw new Error(mapAuthError('Supabase not configured'))
    }
    await authService.resetPassword(email)
  }, [isConfigured])

  const updatePassword = useCallback(async (password: string) => {
    if (!isConfigured) {
      throw new Error(mapAuthError('Supabase not configured'))
    }
    await authService.updatePassword(password)
  }, [isConfigured])

  const patchProfile = useCallback((next: Profile, displayName?: string) => {
    setProfile(next)
    if (displayName !== undefined) {
      setUser((current) =>
        current
          ? {
              ...current,
              user_metadata: {
                ...current.user_metadata,
                full_name: displayName,
              },
            }
          : current,
      )
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      profile,
      isLoading,
      isAuthenticated: Boolean(session?.user),
      isConfigured,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      resetPassword,
      updatePassword,
      refreshProfile,
      patchProfile,
    }),
    [
      user,
      session,
      profile,
      isLoading,
      isConfigured,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      resetPassword,
      updatePassword,
      refreshProfile,
      patchProfile,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
