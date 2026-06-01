import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthErrorBanner } from '@/components/auth/AuthErrorBanner'
import {
  ImageUploader,
  type ImagePreview,
} from '@/components/marketplace/ImageUploader'
import { MobileShell } from '@/components/layout/MobileShell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Navbar } from '@/components/ui/Navbar'
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CONDITIONS,
  PRODUCT_SIZES,
} from '@/constants/marketplace'
import { useAuth } from '@/hooks/useAuth'
import { productsService } from '@/services/products.service'
import { storageService, type UploadProgress } from '@/services/storage.service'
import type { CreateProductInput } from '@/types/marketplace'
import { formatPrice } from '@/utils/format'
import { cn } from '@/utils/cn'

const STEPS = ['Categoría', 'Fotos', 'Detalles', 'Precio', 'Publicar'] as const

type FormState = Omit<CreateProductInput, 'images'> & {
  images: ImagePreview[]
}

const initialForm: FormState = {
  category: '',
  title: '',
  description: '',
  brand: '',
  condition: '',
  size: '',
  color: '',
  location: '',
  price: 0,
  images: [],
}

export function SellPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(initialForm)
  const [priceInput, setPriceInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)

  const update = (patch: Partial<FormState>) => setForm((prev) => ({ ...prev, ...patch }))

  const canNext = useMemo(() => {
    switch (step) {
      case 0:
        return Boolean(form.category)
      case 1:
        return form.images.length > 0
      case 2:
        return Boolean(form.title.trim() && form.condition && form.brand.trim())
      case 3:
        return Number(priceInput) > 0
      default:
        return true
    }
  }, [step, form, priceInput])

  const handlePublish = async () => {
    if (!user) return
    setError(null)
    setIsPublishing(true)

    try {
      const files = form.images.map((img) => img.file)
      const urls = await storageService.uploadClothingImages(
        user.id,
        files,
        setUploadProgress,
      )

      const product = await productsService.create(user.id, {
        category: form.category,
        title: form.title.trim(),
        description: form.description.trim(),
        brand: form.brand.trim(),
        condition: form.condition,
        size: form.size || 'Único',
        color: form.color.trim() || '—',
        location: form.location.trim() || 'Argentina',
        price: Number(priceInput),
        images: urls,
      })

      form.images.forEach((img) => URL.revokeObjectURL(img.previewUrl))
      navigate(`/products/${product.id}`, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al publicar')
    } finally {
      setIsPublishing(false)
      setUploadProgress(null)
    }
  }

  return (
    <MobileShell noPadding className="page-enter">
      <Navbar title="Publicar pieza" showBack subtitle={`Paso ${step + 1} de ${STEPS.length}`} />

      <div className="flex flex-col gap-5 px-4 pb-8">
        <div className="flex gap-1">
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1 space-y-1">
              <div
                className={cn(
                  'h-1 rounded-full transition-all duration-300',
                  i <= step ? 'bg-ares-gold' : 'bg-white/10',
                )}
              />
              <p className="hidden text-[9px] text-ares-gray sm:block">{label}</p>
            </div>
          ))}
        </div>

        <AuthErrorBanner message={error} />

        {step === 0 ? (
          <section className="animate-slide-up space-y-4">
            <h2 className="font-display text-xl font-bold text-ares-white">
              Elegí una categoría
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {PRODUCT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => update({ category: cat })}
                  className={cn(
                    'press-scale rounded-2xl border px-4 py-4 text-left transition-all duration-300',
                    form.category === cat
                      ? 'border-ares-gold/40 bg-ares-gold/10 text-ares-gold-light'
                      : 'border-white/10 bg-white/5 text-ares-white hover:border-ares-gold/20',
                  )}
                >
                  <span className="font-semibold">{cat}</span>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {step === 1 ? (
          <section className="animate-slide-up space-y-4">
            <h2 className="font-display text-xl font-bold text-ares-white">Fotos</h2>
            <p className="text-sm text-ares-gray">
              La primera foto será la portada. Máximo 6 imágenes.
            </p>
            <ImageUploader
              images={form.images}
              onChange={(images) => update({ images })}
            />
          </section>
        ) : null}

        {step === 2 ? (
          <section className="animate-slide-up space-y-4">
            <h2 className="font-display text-xl font-bold text-ares-white">Detalles</h2>
            <Input
              label="Título"
              placeholder="Ej: Bomber recycled premium"
              value={form.title}
              onChange={(e) => update({ title: e.target.value })}
              required
            />
            <Input
              label="Marca"
              placeholder="Nombre de la marca"
              value={form.brand}
              onChange={(e) => update({ brand: e.target.value })}
              required
            />
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-ares-gray-light">Estado</label>
              <div className="flex flex-wrap gap-2">
                {PRODUCT_CONDITIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => update({ condition: c })}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium transition-all duration-300',
                      form.condition === c
                        ? 'border-ares-eco/40 bg-ares-eco/15 text-ares-eco'
                        : 'border-white/10 text-ares-gray',
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-ares-gray-light">Talle</label>
              <div className="flex flex-wrap gap-2">
                {PRODUCT_SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => update({ size: s })}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium transition-all duration-300',
                      form.size === s
                        ? 'border-ares-gold/40 bg-ares-gold/15 text-ares-gold-light'
                        : 'border-white/10 text-ares-gray',
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <Input
              label="Color"
              placeholder="Negro, denim, etc."
              value={form.color}
              onChange={(e) => update({ color: e.target.value })}
            />
            <Input
              label="Ubicación"
              placeholder="Ciudad o barrio"
              value={form.location}
              onChange={(e) => update({ location: e.target.value })}
            />
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-ares-gray-light">Descripción</label>
              <textarea
                value={form.description}
                onChange={(e) => update({ description: e.target.value })}
                rows={4}
                placeholder="Contá la historia de la pieza, materiales, medidas…"
                className="glass w-full resize-none rounded-2xl px-4 py-3 text-sm text-ares-white outline-none placeholder:text-ares-gray focus:border-ares-gold/40"
              />
            </div>
          </section>
        ) : null}

        {step === 3 ? (
          <section className="animate-slide-up space-y-4">
            <h2 className="font-display text-xl font-bold text-ares-white">Precio</h2>
            <Input
              label="Precio (ARS)"
              type="number"
              min={1}
              placeholder="48000"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              required
            />
            {Number(priceInput) > 0 ? (
              <p className="text-sm text-ares-gold-light">
                Vista previa: {formatPrice(Number(priceInput))}
              </p>
            ) : null}
          </section>
        ) : null}

        {step === 4 ? (
          <section className="animate-slide-up space-y-4">
            <h2 className="font-display text-xl font-bold text-ares-white">
              Revisá y publicá
            </h2>
            <div className="space-y-3 rounded-2xl glass p-4">
              <Badge variant="gold">{form.category}</Badge>
              <p className="font-display text-lg font-semibold text-ares-white">{form.title}</p>
              <p className="text-2xl font-bold text-ares-gold-light">
                {formatPrice(Number(priceInput))}
              </p>
              <p className="text-sm text-ares-gray">
                {form.brand} · {form.condition} · Talle {form.size || 'Único'}
              </p>
              <p className="text-sm text-ares-gray">{form.images.length} foto(s)</p>
            </div>
            {uploadProgress ? (
              <div className="space-y-2">
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-ares-gold to-ares-eco transition-all duration-300"
                    style={{
                      width: `${Math.round((uploadProgress.completed / uploadProgress.total) * 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-ares-gray">
                  Subiendo {uploadProgress.completed}/{uploadProgress.total}
                  {uploadProgress.currentFile ? ` · ${uploadProgress.currentFile}` : ''}
                </p>
              </div>
            ) : null}
          </section>
        ) : null}

        <div className="flex gap-3 pt-2">
          {step > 0 ? (
            <Button variant="outline" className="flex-1" onClick={() => setStep((s) => s - 1)}>
              Atrás
            </Button>
          ) : null}
          {step < STEPS.length - 1 ? (
            <Button
              className="flex-1"
              disabled={!canNext}
              onClick={() => setStep((s) => s + 1)}
            >
              Siguiente
            </Button>
          ) : (
            <Button
              className="flex-1"
              variant="eco"
              isLoading={isPublishing}
              onClick={handlePublish}
            >
              Publicar
            </Button>
          )}
        </div>
      </div>
    </MobileShell>
  )
}
