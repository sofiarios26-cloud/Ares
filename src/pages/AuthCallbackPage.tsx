import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLoader } from '@/components/ui/Spinner'
import { useAuth } from '@/hooks/useAuth'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const { isLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isLoading) return

    if (isAuthenticated) {
      navigate('/profile', { replace: true })
    } else {
      navigate('/login', { replace: true })
    }
  }, [isLoading, isAuthenticated, navigate])

  return <PageLoader />
}
