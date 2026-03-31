import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { getCached, setCache } from '../lib/queryCache'
import { useAuth } from './useAuth'

interface Membership {
  isMember: boolean
  planType: string | null
  expiresAt: string | null
}

const CACHE_KEY = 'membership'
const DEFAULT: Membership = { isMember: false, planType: null, expiresAt: null }

export function useSubscription() {
  const { user } = useAuth()
  const [membership, setMembership] = useState<Membership>(() => {
    const cached = getCached<Membership>(CACHE_KEY)
    return cached?.data ?? DEFAULT
  })
  const [loading, setLoading] = useState(() => !getCached<Membership>(CACHE_KEY))

  const checkMembership = useCallback(async () => {
    if (!user) {
      setMembership(DEFAULT)
      setLoading(false)
      return
    }

    // If cache is fresh, skip network
    const cached = getCached<Membership>(CACHE_KEY, 300_000) // 5 min stale time
    if (cached?.fresh) {
      setMembership(cached.data)
      setLoading(false)
      return
    }

    const { data, error } = await supabase.rpc('check_membership')
    if (!error && data) {
      const m: Membership = {
        isMember: data.is_member ?? false,
        planType: data.plan_type ?? null,
        expiresAt: data.expires_at ?? null,
      }
      setMembership(m)
      setCache(CACHE_KEY, m)
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    checkMembership()
  }, [checkMembership])

  const redeem = async (code: string): Promise<{ success: boolean; message: string }> => {
    const { data, error } = await supabase.rpc('redeem_code', { p_code: code.trim() })

    if (error) {
      return { success: false, message: '兑换没成功，检查一下码是否正确' }
    }

    if (data?.success) {
      await checkMembership()
      return { success: true, message: '兑换成功，欢迎解锁完整版！' }
    }

    // RPC returned specific error (not_found, already_used, expired, etc.)
    return { success: false, message: data?.message || '兑换没成功，检查一下码是否正确' }
  }

  return { membership, loading, redeem, refresh: checkMembership }
}
