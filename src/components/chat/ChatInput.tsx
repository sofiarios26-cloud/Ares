import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

type ChatInputProps = {
  onSend: (message: string) => Promise<void>
  isSending?: boolean
  placeholder?: string
  initialMessage?: string
  className?: string
}

export function ChatInput({
  onSend,
  isSending = false,
  placeholder = 'Escribí un mensaje…',
  initialMessage = '',
  className,
}: ChatInputProps) {
  const [text, setText] = useState(initialMessage)

  const submitMessage = async () => {
    const trimmed = text.trim()
    if (!trimmed || isSending) return

    try {
      await onSend(trimmed)
      setText('')
    } catch {
      /* error handled by parent */
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await submitMessage()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void submitMessage()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'glass safe-bottom flex items-end gap-2 border-t border-white/6 px-3 py-3',
        className,
      )}
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        rows={1}
        className="max-h-24 min-h-[44px] flex-1 resize-none rounded-2xl bg-white/5 px-4 py-2.5 text-sm text-ares-white outline-none placeholder:text-ares-gray focus:ring-1 focus:ring-ares-gold/30"
        onKeyDown={handleKeyDown}
      />
      <Button type="submit" size="sm" isLoading={isSending} disabled={!text.trim()}>
        Enviar
      </Button>
    </form>
  )
}
