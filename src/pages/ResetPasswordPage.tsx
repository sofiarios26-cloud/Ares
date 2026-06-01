import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthErrorBanner } from '@/components/auth/AuthErrorBanner'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PageLoader } from '@/components/ui/Spinner'
import { useAuth } from '@/hooks/useAuth'
import { mapAuthError } from '@/utils/auth-errors'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const { updatePassword, isLoading, isAuthenticated, isConfigured } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isLoading) {
    return <PageLoader />
  }

  if (!isConfigured) {
    return (
      <AuthLayout title="Restablecer contraseña">
        <AuthErrorBanner message={mapAuthError('Supabase not configured')} />
      </AuthLayout>
    )
  }

  if (!isAuthenticated) {
    return (
      <AuthLayout
        title="Enlace inválido"
        subtitle="El enlace expiró o ya fue usado. Solicitá uno nuevo."
      >
        <Button fullWidth onClick={() => navigate('/forgot-password')}>
          Solicitar nuevo enlace
        </Button>
      </AuthLayout>
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setIsSubmitting(true)
    try {
      await updatePassword(password)
      navigate('/profile', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : mapAuthError(''))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Nueva contraseña"
      subtitle="Elegí una contraseña segura para tu cuenta ARES."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <AuthErrorBanner message={error} />
        <Input
          label="Nueva contraseña"
          type="password"
          placeholder="Mínimo 6 caracteres"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          label="Confirmar contraseña"
          type="password"
          placeholder="Repetí la contraseña"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
          Guardar contraseña
        </Button>
      </form>
    </AuthLayout>
  )
}
