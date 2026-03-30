import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

interface Membership {
  isMember: boolean
  planType: string | null
  expiresAt: string | null
}

export function useSubscription() {
  const { user } = useAuth()
  const [membership, setMembership] = useState<Membership>({
    isMember: false,
    planType: null,
    expiresAt: null,
  })
  const [loading, setLoading] = useState(true)

  const checkMembership = useCallback(async () => {
    if (!user) {
      setMembership({ isMember: false, planType: null, expiresAt: null })
      setLoading(false)
      return
    }

    const { data, error } = await supabase.rpc('check_membership')
    if (!error && data) {
      setMembership({
        isMember: data.is_member ?? false,
        planType: data.plan_type ?? null,
        expiresAt: data.expires_at ?? null,
      })
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    checkMembership()
  }, [checkMembership])

  const redeem = async (code: string): Promise<{ success: boolean; message: string }> => {
    const { data, error } = await supabase.rpc('redeem_code', { p_code: code.trim() })

    if (error) {
      return { success: false, message: error.message || '兑换失败，请稍后重试' }
    }

    if (data?.success) {
      // Refresh membership state
      await checkMembership()
      return { success: true, message: data.message || '兑换成功！' }
    }

    return { success: false, message: data?.message || '兑换失败' }
  }

  return { membership, loading, redeem, refresh: checkMembership }
}
