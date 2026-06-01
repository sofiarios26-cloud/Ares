import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

type MobileShellProps = {
  children: ReactNode
  className?: string
  noPadding?: boolean
}

export function MobileShell({ children, className, noPadding = false }: MobileShellProps) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col bg-ares-dark">
      <div
        className={cn(
          'flex min-h-dvh flex-1 flex-col',
          !noPadding && 'pb-24',
          className,
        )}
      >
        {children}
      </div>
    </div>
  )
}
