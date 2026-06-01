import { cn } from '@/utils/cn'

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Buscar piezas, marcas…',
  className,
}: SearchBarProps) {
  return (
    <div className={cn('glass flex h-11 items-center gap-2 rounded-2xl px-4', className)}>
      <svg
        className="size-4 shrink-0 text-ares-gray"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden
      >
        <circle cx="11" cy="11" r="7" />
        <path strokeLinecap="round" d="m20 20-3.5-3.5" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm text-ares-white outline-none placeholder:text-ares-gray"
      />
    </div>
  )
}
