import { AuthProvider } from '@/contexts/AuthContext'
import { UnreadProvider } from '@/contexts/UnreadContext'
import { AppRouter } from '@/router/AppRouter'

function App() {
  return (
    <AuthProvider>
      <UnreadProvider>
        <AppRouter />
      </UnreadProvider>
    </AuthProvider>
  )
}

export default App
