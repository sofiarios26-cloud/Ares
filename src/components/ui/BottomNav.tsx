import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  IconDiscover,
  IconHeart,
  IconHome,
  IconPlus,
  IconUser,
} from '@/components/icons/NavIcons'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'

type NavItem = {
  to: string
  label: string
  icon: typeof IconHome
  end?: boolean
}

const navItems: NavItem[] = [
  { to: '/', label: 'Inicio', icon: IconHome, end: true },
  { to: '/discover', label: 'Explorar', icon: IconDiscover },
  { to: '/saved', label: 'Guardados', icon: IconHeart },
  { to: '/profile', label: 'Perfil', icon: IconUser },
]

export function BottomNav() {
  const location = useLocation()
  const hideOnAuth =
    ['/splash', '/welcome', '/login', '/register', '/forgot-password', '/sell'].includes(
      location.pathname,
    ) ||
    location.pathname.startsWith('/inbox') ||
    location.pathname.startsWith('/checkout') ||
    location.pathname === '/notifications' ||
    location.pathname === '/purchases'

  if (hideOnAuth) return null

  return (
    <nav
      className="safe-bottom fixed bottom-0 left-1/2 z-40 w-full max-w-lg -translate-x-1/2 px-3 pb-2"
      aria-label="Navegación principal"
    >
      <div className="glass relative flex items-center justify-around rounded-3xl border border-white/10 px-2 py-2 shadow-premium">
        {navItems.slice(0, 2).map((item) => (
          <NavTab key={item.to} {...item} />
        ))}

        <CenterAction />

        {navItems.slice(2).map((item) => (
          <NavTab key={item.to} {...item} />
        ))}
      </div>
    </nav>
  )
}

function NavTab({ to, label, icon: Icon, end }: NavItem) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'press-scale flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-2 py-1.5 transition-all duration-300',
          isActive ? 'text-ares-gold-light' : 'text-ares-gray hover:text-ares-white',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={cn('size-6 transition-transform duration-300', isActive && 'scale-110')}
          />
          <span className="text-[9px] font-medium tracking-wide">{label}</span>
          {isActive ? (
            <span className="size-1 rounded-full bg-ares-gold-light shadow-gold" />
          ) : (
            <span className="size-1" />
          )}
        </>
      )}
    </NavLink>
  )
}

function CenterAction() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const handleClick = () => {
    if (isAuthenticated) {
      navigate('/sell')
    } else {
      navigate('/login', { state: { from: '/sell' } })
    }
  }

  return (
    <button
      type="button"
      aria-label="Publicar"
      onClick={handleClick}
      className="press-scale -mt-7 flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-ares-gold-light to-ares-gold text-ares-dark shadow-gold transition-all duration-300 hover:brightness-110 animate-pulse-gold"
    >
      <IconPlus className="size-7" strokeWidth={2.5} />
    </button>
  )
}
