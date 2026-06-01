import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AuthErrorBanner } from '@/components/auth/AuthErrorBanner'
import { AuthSuccessBanner } from '@/components/auth/AuthSuccessBanner'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { mapAuthError } from '@/utils/auth-errors'

export function ForgotPasswordPage() {
  const { resetPassword, isConfigured } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!isConfigured) {
      setError(mapAuthError('Supabase not configured'))
      return
    }

    setIsLoading(true)
    try {
      await resetPassword(email)
      setSuccess('Te enviamos un email con el enlace para restablecer tu contraseña.')
    } catch (err) {
      setError(err instanceof Error ? err.message : mapAuthError(''))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Recuperar contraseña"
      subtitle="Te enviaremos un enlace para restablecer el acceso a tu cuenta."
      footer={
        <p className="text-center text-sm text-ares-gray">
          <Link
            to="/login"
            className="font-semibold text-ares-gold-light transition-colors duration-300 hover:text-ares-gold"
          >
            Volver al login
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <AuthErrorBanner message={error} />
        <AuthSuccessBanner message={success} />
        <Input
          label="Email"
          type="email"
          placeholder="tu@email.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
          Enviar enlace
        </Button>
      </form>
    </AuthLayout>
  )
}
