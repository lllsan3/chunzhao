import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { getCached, setCache, invalidateCache } from '../lib/queryCache'
import { useAuth } from './useAuth'
import type { ApplicationStatus } from '../lib/constants'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface Application {
  id: string
  user_id: string
  job_id: string | null
  title: string
  company: string
  city: string | null
  deadline: string | null
  jd_url: string | null
  status: ApplicationStatus
  notes: string | null
  reminder_date: string | null
  reminder_note: string | null
  imported_at: string
  updated_at: string
}

const CACHE_KEY = 'applications'
const FREE_LIMIT = 3

export function useApplications() {
  const { user } = useAuth()
  const channelRef = useRef<RealtimeChannel | null>(null)

  const [applications, setApplications] = useState<Application[]>(() => {
    const cached = getCached<Application[]>(CACHE_KEY)
    return cached?.data ?? []
  })
  const [loading, setLoading] = useState(() => {
    const cached = getCached<Application[]>(CACHE_KEY)
    return !cached
  })

  const fetchApplications = useCallback(async () => {
    // Skip query when not logged in
    if (!user) {
      setApplications([])
      setLoading(false)
      return
    }

    const cached = getCached<Application[]>(CACHE_KEY)

    if (cached?.fresh) {
      setApplications(cached.data)
      setLoading(false)
      return
    }

    if (!cached) setLoading(true)

    const { data, error } = await supabase
      .from('user_applications')
      .select('*')
      .order('imported_at', { ascending: false })

    if (!error && data) {
      const rows = data as Application[]
      setApplications(rows)
      setCache(CACHE_KEY, rows)
    }
    setLoading(false)
  }, [user])

  // Re-fetch when user changes (login/logout)
  useEffect(() => {
    if (!user) {
      setApplications([])
      setLoading(false)
      invalidateCache(CACHE_KEY)
      return
    }
    fetchApplications()
  }, [user, fetchApplications])

  // Realtime subscription — only for logged-in users
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`user_apps_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_applications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newRow = payload.new as Application
          setApplications((prev) => {
            const updated = [newRow, ...prev]
            setCache(CACHE_KEY, updated)
            return updated
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_applications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updatedRow = payload.new as Application
          setApplications((prev) => {
            const updated = prev.map((app) =>
              app.id === updatedRow.id ? updatedRow : app
            )
            setCache(CACHE_KEY, updated)
            return updated
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'user_applications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const deletedId = (payload.old as { id: string }).id
          setApplications((prev) => {
            const updated = prev.filter((app) => app.id !== deletedId)
            setCache(CACHE_KEY, updated)
            return updated
          })
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [user])

  // Free tier limit check
  const isAtFreeLimit = applications.length >= FREE_LIMIT

  const importJob = async (job: {
    id: string
    title: string
    company: string
    city: string | null
    deadline: string | null
    jd_url: string | null
  }) => {
    if (!user) return { error: { message: '请先登录' } }

    const { error } = await supabase.from('user_applications').insert({
      user_id: user.id,
      job_id: job.id,
      title: job.title,
      company: job.company,
      city: job.city,
      deadline: job.deadline,
      jd_url: job.jd_url,
      status: 'pending_review',
    })

    if (!error) {
      invalidateCache(CACHE_KEY)
    }
    return { error }
  }

  const updateStatus = async (id: string, status: ApplicationStatus) => {
    setApplications((prev) => {
      const updated = prev.map((app) =>
        app.id === id ? { ...app, status } : app
      )
      setCache(CACHE_KEY, updated)
      return updated
    })

    const { error } = await supabase
      .from('user_applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      invalidateCache(CACHE_KEY)
      await fetchApplications()
    }
    return { error }
  }

  const updateNotes = async (id: string, notes: string) => {
    const { error } = await supabase
      .from('user_applications')
      .update({ notes, updated_at: new Date().toISOString() })
      .eq('id', id)
    return { error }
  }

  const updateReminder = async (
    id: string,
    reminder_date: string | null,
    reminder_note: string | null
  ) => {
    const { error } = await supabase
      .from('user_applications')
      .update({ reminder_date, reminder_note, updated_at: new Date().toISOString() })
      .eq('id', id)
    return { error }
  }

  const manualAdd = async (fields: {
    title: string
    company: string
    city?: string
    deadline?: string
    jd_url?: string
  }) => {
    if (!user) return { error: { message: '请先登录' } }

    const { error } = await supabase.from('user_applications').insert({
      user_id: user.id,
      job_id: null,
      title: fields.title,
      company: fields.company,
      city: fields.city || null,
      deadline: fields.deadline || null,
      jd_url: fields.jd_url || null,
      status: 'pending_review',
      source: 'manual',
    })

    if (!error) {
      invalidateCache(CACHE_KEY)
    }
    return { error }
  }

  return {
    applications,
    loading,
    isAtFreeLimit,
    importJob,
    manualAdd,
    updateStatus,
    updateNotes,
    updateReminder,
    refetch: fetchApplications,
  }
}
