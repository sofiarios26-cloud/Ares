import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/services/supabase/client'
import { profilesService } from '@/services/profiles.service'
import { storageService } from '@/services/storage.service'
import type { Profile } from '@/types/database'
import type { ProfileEditorData } from '@/types/profile'
import {
  getAvatarUrl,
  getDisplayName,
  normalizeUsername,
  validateUsername,
} from '@/utils/profile'
import { mapAuthError } from '@/utils/auth-errors'

type AvatarDraft = {
  file: File | null
  previewUrl: string | null
  removeExisting: boolean
}

function buildInitialData(profile: Profile | null, user: User | null): ProfileEditorData {
  return {
    username: profile?.username ?? '',
    displayName: getDisplayName(profile, user),
    bio: profile?.bio ?? '',
    location: profile?.location ?? '',
    avatarUrl: getAvatarUrl(profile, user),
  }
}

export function useProfileEditor(
  profile: Profile | null,
  user: User | null,
  onSaved: (next: Profile, displayName: string) => void,
) {
  const initial = useMemo(() => buildInitialData(profile, user), [profile, user])
  const [form, setForm] = useState<ProfileEditorData>(initial)
  const [avatarDraft, setAvatarDraft] = useState<AvatarDraft>({
    file: null,
    previewUrl: null,
    removeExisting: false,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const snapshotRef = useRef(initial)

  useEffect(() => {
    setForm(initial)
    snapshotRef.current = initial
    setAvatarDraft({ file: null, previewUrl: null, removeExisting: false })
    setError(null)
    setSuccess(null)
  }, [initial])

  const previewAvatarUrl = avatarDraft.removeExisting
    ? null
    : avatarDraft.previewUrl ?? form.avatarUrl

  const isDirty =
    form.username !== snapshotRef.current.username ||
    form.displayName !== snapshotRef.current.displayName ||
    form.bio !== snapshotRef.current.bio ||
    form.location !== snapshotRef.current.location ||
    avatarDraft.file !== null ||
    avatarDraft.removeExisting

  const updateField = useCallback(
    <K extends keyof ProfileEditorData>(key: K, value: ProfileEditorData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }))
      setSuccess(null)
    },
    [],
  )

  const setAvatarFile = useCallback((file: File | null) => {
    setAvatarDraft((prev) => {
      if (prev.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(prev.previewUrl)
      }
      if (!file) {
        return { file: null, previewUrl: null, removeExisting: false }
      }
      return {
        file,
        previewUrl: URL.createObjectURL(file),
        removeExisting: false,
      }
    })
    setSuccess(null)
  }, [])

  const removeAvatar = useCallback(() => {
    setAvatarDraft((prev) => {
      if (prev.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(prev.previewUrl)
      }
      return { file: null, previewUrl: null, removeExisting: true }
    })
    setSuccess(null)
  }, [])

  const cancel = useCallback(() => {
    if (avatarDraft.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(avatarDraft.previewUrl)
    }
    setForm(snapshotRef.current)
    setAvatarDraft({ file: null, previewUrl: null, removeExisting: false })
    setError(null)
    setSuccess(null)
  }, [avatarDraft.previewUrl])

  const save = useCallback(async (): Promise<boolean> => {
    if (!user?.id || !profile) return false

    const username = normalizeUsername(form.username)
    const usernameError = validateUsername(username)
    if (usernameError) {
      setError(usernameError)
      return false
    }

    setIsSaving(true)
    setError(null)
    setSuccess(null)

    const previousProfile = profile
    const previousSnapshot = snapshotRef.current

    let nextAvatarUrl = avatarDraft.removeExisting
      ? null
      : form.avatarUrl

    const optimisticProfile: Profile = {
      ...profile,
      username,
      bio: form.bio.trim() || null,
      location: form.location.trim() || null,
      avatar: previewAvatarUrl,
    }

    onSaved(optimisticProfile, form.displayName.trim())

    try {
      const available = await profilesService.isUsernameAvailable(username, user.id)
      if (!available) {
        throw new Error('Ese nombre de usuario no está disponible.')
      }

      if (avatarDraft.file) {
        if (profile.avatar) {
          await storageService.deleteAvatar(profile.avatar).catch(() => {})
        }
        nextAvatarUrl = await storageService.uploadAvatar(user.id, avatarDraft.file)
      } else if (avatarDraft.removeExisting && profile.avatar) {
        await storageService.deleteAvatar(profile.avatar)
        nextAvatarUrl = null
      }

      const updated = await profilesService.update(user.id, {
        username,
        bio: form.bio.trim() || null,
        location: form.location.trim() || null,
        avatar: nextAvatarUrl,
      })

      const displayName = form.displayName.trim()
      if (displayName !== getDisplayName(profile, user)) {
        const { error: metaError } = await getSupabaseClient().auth.updateUser({
          data: { full_name: displayName || null },
        })
        if (metaError) throw new Error(mapAuthError(metaError.message))
      }

      const nextForm: ProfileEditorData = {
        username: updated.username,
        displayName: displayName || updated.username,
        bio: updated.bio ?? '',
        location: updated.location ?? '',
        avatarUrl: updated.avatar,
      }

      snapshotRef.current = nextForm
      setForm(nextForm)
      if (avatarDraft.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(avatarDraft.previewUrl)
      }
      setAvatarDraft({ file: null, previewUrl: null, removeExisting: false })
      onSaved(updated, nextForm.displayName)
      setSuccess('Perfil actualizado correctamente.')
      return true
    } catch (err) {
      onSaved(previousProfile, previousSnapshot.displayName)
      setForm(previousSnapshot)
      setError(err instanceof Error ? err.message : mapAuthError(''))
      return false
    } finally {
      setIsSaving(false)
    }
  }, [avatarDraft, form, onSaved, previewAvatarUrl, profile, user])

  return {
    form,
    previewAvatarUrl,
    isDirty,
    isSaving,
    error,
    success,
    updateField,
    setAvatarFile,
    removeAvatar,
    cancel,
    save,
  }
}
