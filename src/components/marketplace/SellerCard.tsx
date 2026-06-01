import { useNavigate } from 'react-router-dom'
import { ProfileAvatar } from '@/components/profile/ProfileAvatar'
import { Card } from '@/components/ui/Card'
import type { SellerPreview } from '@/types/marketplace'
import { cn } from '@/utils/cn'

type SellerCardProps = {
  seller: SellerPreview
  className?: string
}

export function SellerCard({ seller, className }: SellerCardProps) {
  const navigate = useNavigate()

  return (
    <Card
      variant="glass"
      padding="md"
      className={cn('flex items-center gap-3', className)}
    >
      <button
        type="button"
        onClick={() => navigate(`/seller/${seller.username}`)}
        className="press-scale flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <ProfileAvatar name={seller.username} avatarUrl={seller.avatar} size="md" />
        <div className="min-w-0">
          <p className="truncate font-display font-semibold text-ares-white">
            @{seller.username}
          </p>
          <p className="truncate text-xs text-ares-gray">
            {seller.location ?? 'ARES'} ·{' '}
            {seller.rating > 0 ? `${seller.rating.toFixed(1)} ★` : 'Nuevo'}
          </p>
        </div>
      </button>
      <button
        type="button"
        onClick={() => navigate(`/seller/${seller.username}`)}
        className="shrink-0 text-xs font-medium text-ares-gold-light transition-colors duration-300 hover:text-ares-gold"
      >
        Ver perfil
      </button>
    </Card>
  )
}
