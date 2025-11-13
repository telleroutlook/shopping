import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

export function useFavoriteStatus(productId?: number) {
  const { user } = useAuth()
  const userId = user?.id || null
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mutating, setMutating] = useState(false)

  useEffect(() => {
    let isMounted = true

    const fetchStatus = async () => {
      if (!userId || !productId) {
        if (isMounted) {
          setIsFavorite(false)
          setLoading(false)
        }
        return
      }

      setLoading(true)
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .maybeSingle()

      if (isMounted) {
        if (error) {
          console.error('Failed to load favorite status:', error)
          setIsFavorite(false)
        } else {
          setIsFavorite(!!data)
        }
        setLoading(false)
      }
    }

    fetchStatus()

    return () => {
      isMounted = false
    }
  }, [userId, productId])

  const toggleFavorite = useCallback(async () => {
    if (!userId || !productId) {
      throw new Error('FAVORITE_TOGGLE_NOT_READY')
    }

    setMutating(true)
    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', productId)

        if (error) throw error
        setIsFavorite(false)
        return false
      } else {
        const { error } = await supabase
          .from('favorites')
          .upsert(
            [{ user_id: userId, product_id: productId }],
            { onConflict: 'user_id,product_id' }
          )

        if (error) throw error
        setIsFavorite(true)
        return true
      }
    } finally {
      setMutating(false)
    }
  }, [userId, productId, isFavorite])

  return {
    isFavorite,
    loading,
    mutating,
    toggleFavorite
  }
}
