import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthErrorBanner } from '@/components/auth/AuthErrorBanner'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { mapAuthError } from '@/utils/auth-errors'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, signInWithGoogle, isConfigured } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const from =
    (location.state as { from?: string } | null)?.from ?? '/profile'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!isConfigured) {
      setError(mapAuthError('Supabase not configured'))
      return
    }

    setIsLoading(true)
    try {
      await signIn({ email, password })
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : mapAuthError(''))
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError(null)
    if (!isConfigured) {
      setError(mapAuthError('Supabase not configured'))
      return
    }
    setIsGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : mapAuthError(''))
      setIsGoogleLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Bienvenido de vuelta"
      subtitle="Accedé a tu guardarropa circular y tus intercambios."
      footer={
        <p className="text-center text-sm text-ares-gray">
          ¿No tenés cuenta?{' '}
          <Link
            to="/register"
            className="font-semibold text-ares-gold-light transition-colors duration-300 hover:text-ares-gold"
          >
            Registrate
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <AuthErrorBanner message={error} />

        <Input
          label="Email"
          type="email"
          placeholder="tu@email.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Link
          to="/forgot-password"
          className="self-end text-xs text-ares-gold-light transition-colors duration-300 hover:text-ares-gold"
        >
          ¿Olvidaste tu contraseña?
        </Link>

        <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
          Entrar
        </Button>

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-white/10" />
          <span className="text-[10px] uppercase tracking-widest text-ares-gray">o</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <Button
          type="button"
          variant="outline"
          fullWidth
          size="lg"
          isLoading={isGoogleLoading}
          onClick={handleGoogle}
        >
          Continuar con Google
        </Button>
      </form>
    </AuthLayout>
  )
}
