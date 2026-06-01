import { useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { ProfileAvatar } from '@/components/profile/ProfileAvatar'
import { cn } from '@/utils/cn'

type AvatarEditorProps = {
  name: string
  avatarUrl: string | null
  onFileSelect: (file: File) => void
  onRemove: () => void
  isUploading?: boolean
  className?: string
}

export function AvatarEditor({
  name,
  avatarUrl,
  onFileSelect,
  onRemove,
  isUploading = false,
  className,
}: AvatarEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <ProfileAvatar name={name} avatarUrl={avatarUrl} size="xl" />

      <div className="flex flex-wrap justify-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          isLoading={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {avatarUrl ? 'Reemplazar foto' : 'Subir foto'}
        </Button>
        {avatarUrl ? (
          <Button type="button" variant="outline" size="sm" onClick={onRemove}>
            Quitar
          </Button>
        ) : null}
      </div>

      <p className="text-center text-[10px] text-ares-gray">
        JPG, PNG o WebP · se comprime automáticamente
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFileSelect(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
