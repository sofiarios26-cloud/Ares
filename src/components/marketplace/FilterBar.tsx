import { SORT_OPTIONS, type ProductSort } from '@/constants/marketplace'
import { cn } from '@/utils/cn'

type SortSelectProps = {
  value: ProductSort
  onChange: (sort: ProductSort) => void
  className?: string
}

export function SortSelect({ value, onChange, className }: SortSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ProductSort)}
      className={cn(
        'h-9 rounded-xl border border-white/10 bg-ares-dark-elevated px-3 text-xs font-medium text-ares-white outline-none',
        'focus:border-ares-gold/40',
        className,
      )}
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

type FilterBarProps = {
  sort: ProductSort
  onSortChange: (sort: ProductSort) => void
  className?: string
}

export function FilterBar({ sort, onSortChange, className }: FilterBarProps) {
  return (
    <div className={cn('flex items-center justify-between gap-3', className)}>
      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        {['Precio', 'Talla', 'Estado'].map((label) => (
          <button
            key={label}
            type="button"
            disabled
            className="shrink-0 rounded-full border border-white/8 px-3 py-1 text-[10px] uppercase tracking-wider text-ares-gray opacity-60"
          >
            {label} · pronto
          </button>
        ))}
      </div>
      <SortSelect value={sort} onChange={onSortChange} />
    </div>
  )
}
