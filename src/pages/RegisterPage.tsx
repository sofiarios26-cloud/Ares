import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthErrorBanner } from '@/components/auth/AuthErrorBanner'
import { AuthSuccessBanner } from '@/components/auth/AuthSuccessBanner'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { mapAuthError } from '@/utils/auth-errors'

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/

export function RegisterPage() {
  const navigate = useNavigate()
  const { signUp, signInWithGoogle, isConfigured } = useAuth()
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!isConfigured) {
      setError(mapAuthError('Supabase not configured'))
      return
    }

    const normalizedUsername = username.trim().toLowerCase()
    if (!USERNAME_RE.test(normalizedUsername)) {
      setError('Usuario: 3–20 caracteres, solo letras, números y _.')
      return
    }

    setIsLoading(true)
    try {
      const { needsEmailConfirmation } = await signUp({
        email,
        password,
        username: normalizedUsername,
        fullName: fullName.trim(),
      })

      if (needsEmailConfirmation) {
        setSuccess('Revisá tu email para confirmar la cuenta antes de iniciar sesión.')
        return
      }

      navigate('/profile', { replace: true })
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
      title="Unite a ARES"
      subtitle="Creá tu perfil y empezá a circular moda urbana premium."
      footer={
        <p className="text-center text-sm text-ares-gray">
          ¿Ya tenés cuenta?{' '}
          <Link
            to="/login"
            className="font-semibold text-ares-gold-light transition-colors duration-300 hover:text-ares-gold"
          >
            Iniciá sesión
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <AuthErrorBanner message={error} />
        <AuthSuccessBanner message={success} />

        <Input
          label="Nombre"
          placeholder="Tu nombre"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <Input
          label="Usuario"
          placeholder="tu_usuario"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          hint="3–20 caracteres: letras, números y _"
          required
        />
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
          placeholder="Mínimo 6 caracteres"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint="Usá letras y números para mayor seguridad."
          required
        />

        <Button type="submit" fullWidth size="lg" variant="eco" isLoading={isLoading}>
          Crear cuenta
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
          Registrarse con Google
        </Button>
      </form>
    </AuthLayout>
  )
}
