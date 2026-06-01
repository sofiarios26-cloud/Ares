import { Outlet } from 'react-router-dom'
import { BottomNav } from '@/components/ui/BottomNav'
import { MobileShell } from '@/components/layout/MobileShell'

export function AppShell() {
  return (
    <MobileShell>
      <Outlet />
      <BottomNav />
    </MobileShell>
  )
}
