import { PRODUCT_CATEGORIES } from '@/constants/marketplace'
import { cn } from '@/utils/cn'

type CategoryChipsProps = {
  selected?: string
  onSelect: (category: string | undefined) => void
  className?: string
}

export function CategoryChips({ selected, onSelect, className }: CategoryChipsProps) {
  return (
    <div className={cn('flex gap-2 overflow-x-auto pb-1 scrollbar-none', className)}>
      <Chip
        label="Todos"
        active={!selected}
        onClick={() => onSelect(undefined)}
      />
      {PRODUCT_CATEGORIES.map((cat) => (
        <Chip
          key={cat}
          label={cat}
          active={selected === cat}
          onClick={() => onSelect(cat)}
        />
      ))}
    </div>
  )
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'press-scale shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-300',
        active
          ? 'border-ares-gold/40 bg-ares-gold/15 text-ares-gold-light'
          : 'border-white/10 bg-white/5 text-ares-gray hover:border-ares-gold/20 hover:text-ares-white',
      )}
    >
      {label}
    </button>
  )
}
