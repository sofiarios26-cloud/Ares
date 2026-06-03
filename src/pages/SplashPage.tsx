import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { IconLeaf } from '@/components/icons/NavIcons'
import logo from '@/assets/Ares-Logo.png'

const SPLASH_DURATION_MS = 2800

export function SplashPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      navigate('/welcome', { replace: true })
    }, SPLASH_DURATION_MS)

    return () => window.clearTimeout(timer)
  }, [navigate])

  return (
    <div
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-ares-dark px-6"
      onClick={() => navigate('/welcome', { replace: true })}
      role="presentation"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/4 size-64 -translate-x-1/2 rounded-full bg-ares-gold/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-0 size-48 rounded-full bg-ares-eco/10 blur-3xl" />
      </div>

      <div className="animate-scale-in relative z-10 flex flex-col items-center gap-6 text-center">
        <img
          src={logo}
          alt="ARES"
          className="h-28 w-auto object-contain"
        />

        <div className="space-y-2">
          <h1 className="font-display text-4xl font-bold tracking-tight text-ares-white">
            ARES
          </h1>

          <p className="text-sm tracking-wide text-ares-gray">
            Moda urbana · Circular · Premium
          </p>
        </div>

        <Badge variant="eco" icon={<IconLeaf className="size-3" />}>
          Sostenible
        </Badge>
      </div>

      <div className="safe-bottom absolute bottom-10 left-0 right-0 flex justify-center">
        <div className="h-1 w-24 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-linear-to-r from-ares-gold to-ares-eco"
            style={{
              animation: `splash-progress ${SPLASH_DURATION_MS}ms ease-out forwards`,
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes splash-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  )
}