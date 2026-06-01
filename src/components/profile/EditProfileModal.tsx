import { AuthErrorBanner } from '@/components/auth/AuthErrorBanner'
import { AuthSuccessBanner } from '@/components/auth/AuthSuccessBanner'
import { AvatarEditor } from '@/components/profile/AvatarEditor'
import { ProfileAvatar } from '@/components/profile/ProfileAvatar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useProfileEditor } from '@/hooks/useProfileEditor'
import { useAuth } from '@/hooks/useAuth'
import type { Profile } from '@/types/database'

type EditProfileModalProps = {
  isOpen: boolean
  onClose: () => void
  onSaved?: () => void
}

export function EditProfileModal({ isOpen, onClose, onSaved }: EditProfileModalProps) {
  const { profile, user, patchProfile, refreshProfile } = useAuth()

  const handleSaved = (next: Profile, displayName: string) => {
    patchProfile(next, displayName)
  }

  const editor = useProfileEditor(profile, user, handleSaved)

  const handleClose = () => {
    if (editor.isDirty) {
      editor.cancel()
    }
    onClose()
  }

  const handleSave = async () => {
    const ok = await editor.save()
    if (ok) {
      await refreshProfile()
      onSaved?.()
      onClose()
    }
  }

  if (!profile || !user) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar perfil"
      className="max-h-[92dvh]"
    >
      <div className="flex flex-col gap-5">
        <section className="rounded-2xl glass p-4 text-center">
          <p className="mb-3 text-[10px] uppercase tracking-widest text-ares-gray">
            Vista previa
          </p>
          <div className="flex flex-col items-center gap-2">
            <ProfileAvatar
              name={editor.form.displayName || editor.form.username}
              avatarUrl={editor.previewAvatarUrl}
              size="lg"
            />
            <h3 className="font-display text-lg font-bold text-ares-white">
              {editor.form.displayName || editor.form.username}
            </h3>
            <p className="text-sm text-ares-gray">
              @{editor.form.username}
              {editor.form.location ? ` · ${editor.form.location}` : ''}
            </p>
            {editor.form.bio ? (
              <p className="max-w-xs text-sm leading-relaxed text-ares-gray-light">
                {editor.form.bio}
              </p>
            ) : null}
          </div>
        </section>

        <AuthErrorBanner message={editor.error} />
        <AuthSuccessBanner message={editor.success} />

        <AvatarEditor
          name={editor.form.displayName || editor.form.username}
          avatarUrl={editor.previewAvatarUrl}
          onFileSelect={editor.setAvatarFile}
          onRemove={editor.removeAvatar}
          isUploading={editor.isSaving}
        />

        <Input
          label="Nombre para mostrar"
          placeholder="Tu nombre público"
          value={editor.form.displayName}
          onChange={(e) => editor.updateField('displayName', e.target.value)}
        />
        <Input
          label="Usuario"
          placeholder="tu_usuario"
          value={editor.form.username}
          onChange={(e) => editor.updateField('username', e.target.value)}
          hint="3–20 caracteres: letras, números y _"
        />
        <Input
          label="Ubicación"
          placeholder="Ciudad o barrio"
          value={editor.form.location}
          onChange={(e) => editor.updateField('location', e.target.value)}
        />
        <div className="space-y-1.5">
          <label className="text-xs font-medium tracking-wide text-ares-gray-light">
            Bio
          </label>
          <textarea
            value={editor.form.bio}
            onChange={(e) => editor.updateField('bio', e.target.value)}
            rows={3}
            placeholder="Contá sobre tu estilo, intercambios, piezas favoritas…"
            className="glass w-full resize-none rounded-2xl px-4 py-3 text-sm text-ares-white outline-none placeholder:text-ares-gray focus:border-ares-gold/40"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={editor.isSaving}
            onClick={() => {
              editor.cancel()
              onClose()
            }}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="flex-1"
            isLoading={editor.isSaving}
            disabled={!editor.isDirty}
            onClick={() => void handleSave()}
          >
            Guardar
          </Button>
        </div>
      </div>
    </Modal>
  )
}
