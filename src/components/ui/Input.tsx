import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  hint?: string
  leftElement?: ReactNode
  rightElement?: ReactNode
}

export function Input({
  label,
  error,
  hint,
  leftElement,
  rightElement,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label ? (
        <label
          htmlFor={inputId}
          className="text-xs font-medium tracking-wide text-ares-gray-light"
        >
          {label}
        </label>
      ) : null}
      <div
        className={cn(
          'glass flex h-12 items-center gap-2 rounded-2xl px-4 transition-all duration-300',
          'focus-within:border-ares-gold/40 focus-within:shadow-gold',
          error && 'border-red-500/50 focus-within:border-red-500/50',
        )}
      >
        {leftElement}
        <input
          id={inputId}
          className={cn(
            'min-w-0 flex-1 bg-transparent text-sm text-ares-white outline-none',
            'placeholder:text-ares-gray',
            className,
          )}
          {...props}
        />
        {rightElement}
      </div>
      {error ? (
        <p className="text-xs text-red-400">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ares-gray">{hint}</p>
      ) : null}
    </div>
  )
}
