import { useCallback, useRef, useState, type DragEvent } from 'react'
import { MAX_PRODUCT_IMAGES } from '@/constants/marketplace'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

export type ImagePreview = {
  id: string
  file: File
  previewUrl: string
}

type ImageUploaderProps = {
  images: ImagePreview[]
  onChange: (images: ImagePreview[]) => void
  maxImages?: number
  className?: string
}

export function ImageUploader({
  images,
  onChange,
  maxImages = MAX_PRODUCT_IMAGES,
  className,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const remaining = maxImages - images.length
      if (remaining <= 0) return

      const next = Array.from(files)
        .filter((f) => f.type.startsWith('image/'))
        .slice(0, remaining)
        .map((file) => ({
          id: crypto.randomUUID(),
          file,
          previewUrl: URL.createObjectURL(file),
        }))

      if (next.length) onChange([...images, ...next])
    },
    [images, maxImages, onChange],
  )

  const removeImage = (id: string) => {
    const target = images.find((img) => img.id === id)
    if (target) URL.revokeObjectURL(target.previewUrl)
    onChange(images.filter((img) => img.id !== id))
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
  }

  return (
    <div className={cn('space-y-4', className)}>
      {images.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, i) => (
            <div
              key={img.id}
              className="relative aspect-square overflow-hidden rounded-xl border border-white/10"
            >
              <img
                src={img.previewUrl}
                alt={`Preview ${i + 1}`}
                className="size-full object-cover"
              />
              {i === 0 ? (
                <span className="absolute left-1.5 top-1.5 rounded-md bg-ares-gold/90 px-1.5 py-0.5 text-[9px] font-bold uppercase text-ares-dark">
                  Cover
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => removeImage(img.id)}
                className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-xs text-white"
                aria-label="Eliminar imagen"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {images.length < maxImages ? (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={cn(
            'flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 py-10 transition-all duration-300',
            isDragging
              ? 'border-ares-gold/50 bg-ares-gold/5'
              : 'border-white/15 bg-white/2',
          )}
        >
          <p className="text-center text-sm text-ares-gray">
            Arrastrá fotos o subí desde tu celular
          </p>
          <p className="text-[10px] text-ares-gray-light">
            {images.length}/{maxImages} · JPG, PNG, WebP
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            Elegir fotos
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files)
              e.target.value = ''
            }}
          />
        </div>
      ) : null}
    </div>
  )
}
