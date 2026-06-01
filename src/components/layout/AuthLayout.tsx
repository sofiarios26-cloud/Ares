import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { MobileShell } from '@/components/layout/MobileShell'

type AuthLayoutProps = {
  children: ReactNode
  title: string
  subtitle?: string
  footer?: ReactNode
}

export function AuthLayout({ children, title, subtitle, footer }: AuthLayoutProps) {
  return (
    <MobileShell noPadding className="page-enter">
      <div className="flex min-h-dvh flex-col px-5 pt-8">
        <Link
          to="/welcome"
          className="mb-8 font-display text-sm font-bold tracking-[0.2em] text-gradient-gold"
        >
          ARES
        </Link>
        <div className="animate-slide-up mb-8 space-y-2">
          <h1 className="font-display text-3xl font-bold tracking-tight text-ares-white">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-sm leading-relaxed text-ares-gray">{subtitle}</p>
          ) : null}
        </div>
        <div className="animate-slide-up-delayed flex flex-1 flex-col">{children}</div>
        {footer ? <div className="safe-bottom py-6">{footer}</div> : null}
      </div>
    </MobileShell>
  )
}
