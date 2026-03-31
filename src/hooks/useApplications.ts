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
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

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

  const importJob = async (job: {
    id: string
    title: string
    company: string
    city: string | null
    deadline: string | null
    jd_url: string | null
  }) => {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return { error: { message: '请先登录' } }

    const { error } = await supabase.from('user_applications').insert({
      user_id: userData.user.id,
      job_id: job.id,
      title: job.title,
      company: job.company,
      city: job.city,
      deadline: job.deadline,
      jd_url: job.jd_url,
      status: 'pending_review',
    })

    if (!error) {
      // Realtime will handle the state update, but invalidate cache freshness
      invalidateCache(CACHE_KEY)
    }
    return { error }
  }

  const updateStatus = async (id: string, status: ApplicationStatus) => {
    // Optimistic update
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
      // Revert on failure
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

  return {
    applications,
    loading,
    importJob,
    updateStatus,
    updateNotes,
    updateReminder,
    refetch: fetchApplications,
  }
}
