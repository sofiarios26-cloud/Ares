import { getSupabaseClient, isSupabaseReady } from '@/services/supabase/client'
import { mapAuthError } from '@/utils/auth-errors'
import { compressImage } from '@/utils/image-compress'

export const CLOTHING_BUCKET = 'clothing-images'
export const AVATAR_BUCKET = 'profile-avatars'

export type UploadProgress = {
  completed: number
  total: number
  currentFile?: string
}

function extractStoragePath(publicUrl: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`
  const index = publicUrl.indexOf(marker)
  if (index === -1) return null
  return publicUrl.slice(index + marker.length)
}

export const storageService = {
  async uploadClothingImage(
    userId: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void,
  ): Promise<string> {
    if (!isSupabaseReady()) {
      throw new Error('Supabase not configured')
    }

    const compressed = await compressImage(file)
    const ext =
      compressed.type === 'image/jpeg' ? 'jpg' : (compressed.name.split('.').pop() ?? 'jpg')
    const path = `${userId}/${crypto.randomUUID()}.${ext}`

    onProgress?.({ completed: 0, total: 1, currentFile: file.name })

    const { error } = await getSupabaseClient()
      .storage
      .from(CLOTHING_BUCKET)
      .upload(path, compressed, {
        upsert: false,
        contentType: compressed.type,
      })

    if (error) throw new Error(mapAuthError(error.message))

    onProgress?.({ completed: 1, total: 1, currentFile: file.name })

    const { data } = getSupabaseClient().storage.from(CLOTHING_BUCKET).getPublicUrl(path)
    return data.publicUrl
  },

  async uploadClothingImages(
    userId: string,
    files: File[],
    onProgress?: (progress: UploadProgress) => void,
  ): Promise<string[]> {
    const urls: string[] = []
    const total = files.length

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      onProgress?.({ completed: i, total, currentFile: file.name })
      const url = await this.uploadClothingImage(userId, file)
      urls.push(url)
    }

    onProgress?.({ completed: total, total })
    return urls
  },

  async deleteClothingImage(publicUrl: string): Promise<void> {
    if (!isSupabaseReady()) return

    const path = extractStoragePath(publicUrl, CLOTHING_BUCKET)
    if (!path) return

    const { error } = await getSupabaseClient()
      .storage
      .from(CLOTHING_BUCKET)
      .remove([path])

    if (error) throw new Error(mapAuthError(error.message))
  },

  async uploadAvatar(userId: string, file: File): Promise<string> {
    if (!isSupabaseReady()) {
      throw new Error('Supabase not configured')
    }

    const compressed = await compressImage(file, 512, 0.88)
    const ext =
      compressed.type === 'image/jpeg' ? 'jpg' : (compressed.name.split('.').pop() ?? 'jpg')
    const path = `${userId}/avatar.${ext}`

    const { error } = await getSupabaseClient()
      .storage
      .from(AVATAR_BUCKET)
      .upload(path, compressed, {
        upsert: true,
        contentType: compressed.type,
      })

    if (error) throw new Error(mapAuthError(error.message))

    const { data } = getSupabaseClient().storage.from(AVATAR_BUCKET).getPublicUrl(path)
    return `${data.publicUrl}?t=${Date.now()}`
  },

  async deleteAvatar(publicUrl: string | null): Promise<void> {
    if (!isSupabaseReady() || !publicUrl) return

    const cleanUrl = publicUrl.split('?')[0]
    const path = extractStoragePath(cleanUrl, AVATAR_BUCKET)
    if (!path) return

    const { error } = await getSupabaseClient()
      .storage
      .from(AVATAR_BUCKET)
      .remove([path])

    if (error) throw new Error(mapAuthError(error.message))
  },
}
