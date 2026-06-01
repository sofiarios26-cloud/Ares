import { useCallback, useEffect, useState } from 'react'
import { likesService } from '@/services/likes.service'
import { savedService } from '@/services/saved.service'
import { useAuth } from '@/hooks/useAuth'
import { mapAuthError } from '@/utils/auth-errors'

export function useProductEngagement(productId: string | undefined, likesCount = 0) {
  const { user, isAuthenticated } = useAuth()
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [likes, setLikes] = useState(likesCount)
  const [isLoading, setIsLoading] = useState(true)
  const [isTogglingLike, setIsTogglingLike] = useState(false)
  const [isTogglingSave, setIsTogglingSave] = useState(false)

  useEffect(() => {
    setLikes(likesCount)
  }, [likesCount])

  useEffect(() => {
    if (!productId || !isAuthenticated || !user) {
      setIsLiked(false)
      setIsSaved(false)
      setIsLoading(false)
      return
    }

    let mounted = true
    setIsLoading(true)

    Promise.all([
      likesService.isLiked(user.id, productId),
      savedService.isSaved(user.id, productId),
    ])
      .then(([liked, saved]) => {
        if (mounted) {
          setIsLiked(liked)
          setIsSaved(saved)
        }
      })
      .finally(() => {
        if (mounted) setIsLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [productId, isAuthenticated, user])

  const toggleLike = useCallback(async () => {
    if (!productId || !user) {
      throw new Error('Iniciá sesión para dar like')
    }

    setIsTogglingLike(true)
    const wasLiked = isLiked

    try {
      if (wasLiked) {
        setIsLiked(false)
        setLikes((c) => Math.max(0, c - 1))
        await likesService.unlike(user.id, productId)
      } else {
        setIsLiked(true)
        setLikes((c) => c + 1)
        await likesService.like(user.id, productId)
      }
    } catch (err) {
      setIsLiked(wasLiked)
      setLikes(likesCount)
      throw err instanceof Error ? err : new Error(mapAuthError(''))
    } finally {
      setIsTogglingLike(false)
    }
  }, [isLiked, likesCount, productId, user])

  const toggleSave = useCallback(async () => {
    if (!productId || !user) {
      throw new Error('Iniciá sesión para guardar')
    }

    setIsTogglingSave(true)
    const wasSaved = isSaved

    try {
      if (wasSaved) {
        setIsSaved(false)
        await savedService.unsave(user.id, productId)
      } else {
        setIsSaved(true)
        await savedService.save(user.id, productId)
      }
    } catch (err) {
      setIsSaved(wasSaved)
      throw err instanceof Error ? err : new Error(mapAuthError(''))
    } finally {
      setIsTogglingSave(false)
    }
  }, [isSaved, productId, user])

  return {
    isLiked,
    isSaved,
    likes,
    isLoading,
    isTogglingLike,
    isTogglingSave,
    toggleLike,
    toggleSave,
  }
}
