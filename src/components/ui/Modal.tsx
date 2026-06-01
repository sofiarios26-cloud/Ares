import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/utils/cn'
import { IconArrowLeft } from '@/components/icons/NavIcons'

export type ModalProps = {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  showBack?: boolean
  className?: string
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  showBack = true,
  className,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={cn(
          'relative z-10 w-full max-w-lg animate-slide-up',
          'max-h-[90dvh] overflow-y-auto rounded-t-app-xl border border-white/10 bg-ares-dark-elevated p-5 shadow-premium sm:rounded-app-xl',
          'safe-bottom',
          className,
        )}
      >
        {(title || showBack) && (
          <div className="mb-4 flex items-center gap-3">
            {showBack ? (
              <button
                type="button"
                onClick={onClose}
                className="press-scale flex size-10 items-center justify-center rounded-full glass transition-colors duration-300 hover:border-ares-gold/30"
                aria-label="Volver"
              >
                <IconArrowLeft className="size-5 text-ares-white" />
              </button>
            ) : null}
            {title ? (
              <h2
                id="modal-title"
                className="font-display text-lg font-semibold text-ares-white"
              >
                {title}
              </h2>
            ) : null}
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  )
}
