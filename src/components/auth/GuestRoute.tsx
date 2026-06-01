import { Navigate, Outlet } from 'react-router-dom'
import { PageLoader } from '@/components/ui/Spinner'
import { useAuth } from '@/hooks/useAuth'

export function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <PageLoader />
  }

  if (isAuthenticated) {
    return <Navigate to="/profile" replace />
  }

  return <Outlet />
}
