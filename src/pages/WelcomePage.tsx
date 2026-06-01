import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { IconLeaf } from '@/components/icons/NavIcons'
import { MobileShell } from '@/components/layout/MobileShell'

export function WelcomePage() {
  const navigate = useNavigate()

  return (
    <MobileShell noPadding className="page-enter">
      <div className="relative flex min-h-dvh flex-col justify-between overflow-hidden px-5 pb-8 pt-12">
        <div className="pointer-events-none absolute -right-20 top-20 size-72 rounded-full bg-ares-gold/8 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-40 size-56 rounded-full bg-ares-eco/8 blur-3xl" />

        <div className="animate-fade-in space-y-4">
          <Badge variant="gold">Nueva temporada</Badge>
          <h1 className="font-display text-[2.5rem] font-bold leading-[1.05] tracking-tight text-ares-white">
            Tu estilo,
            <br />
            <span className="text-gradient-gold">sin dejar huella.</span>
          </h1>
          <p className="max-w-xs text-sm leading-relaxed text-ares-gray">
            Descubrí piezas urbanas curadas, intercambiá con la comunidad y vestí
            premium con conciencia eco.
          </p>
        </div>

        <div className="animate-slide-up-delayed space-y-6">
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: '12k+', label: 'Piezas' },
              { value: '98%', label: 'Reuso' },
              { value: '4.9', label: 'Rating' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl glass px-3 py-3 text-center transition-colors duration-300 hover:border-ares-gold/20"
              >
                <p className="font-display text-lg font-bold text-ares-gold-light">
                  {stat.value}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-ares-gray">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <Button fullWidth size="lg" onClick={() => navigate('/register')}>
              Crear cuenta
            </Button>
            <Button
              fullWidth
              size="lg"
              variant="outline"
              onClick={() => navigate('/login')}
            >
              Iniciar sesión
            </Button>
            <Button fullWidth variant="ghost" size="sm" onClick={() => navigate('/')}>
              Explorar como invitado
            </Button>
          </div>

          <p className="flex items-center justify-center gap-1.5 text-center text-[10px] text-ares-gray">
            <IconLeaf className="size-3 text-ares-eco" />
            Moda circular certificada
          </p>
        </div>
      </div>
    </MobileShell>
  )
}
