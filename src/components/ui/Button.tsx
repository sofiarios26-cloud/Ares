import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'eco' | 'ghost' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-linear-to-r from-ares-gold-light to-ares-gold text-ares-dark shadow-gold hover:brightness-110',
  secondary:
    'glass-gold text-ares-gold hover:bg-ares-gold/10',
  eco: 'bg-ares-eco text-ares-dark hover:bg-ares-eco-dark shadow-[0_4px_20px_rgba(47,191,113,0.3)]',
  ghost: 'bg-transparent text-ares-white hover:bg-white/5',
  outline:
    'border border-ares-gray/40 bg-transparent text-ares-white hover:border-ares-gold/50 hover:text-ares-gold',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 gap-1.5 rounded-xl px-4 text-xs font-semibold',
  md: 'h-11 gap-2 rounded-2xl px-5 text-sm font-semibold',
  lg: 'h-12 gap-2.5 rounded-2xl px-6 text-base font-semibold',
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled ?? isLoading}
      className={cn(
        'press-scale inline-flex items-center justify-center transition-all duration-300',
        'disabled:pointer-events-none disabled:opacity-45',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  )
}
