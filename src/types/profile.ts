export type UpdateProfileInput = {
  username?: string
  bio?: string | null
  location?: string | null
  avatar?: string | null
}

export type ProfileEditorData = {
  username: string
  displayName: string
  bio: string
  location: string
  avatarUrl: string | null
}
