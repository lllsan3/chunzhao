import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { getCached, setCache, invalidateCache } from '../lib/queryCache'
import type { ApplicationStatus } from '../lib/constants'

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
  const [applications, setApplications] = useState<Application[]>(() => {
    // Initialize from cache if available (instant render on route switch)
    const cached = getCached<Application[]>(CACHE_KEY)
    return cached?.data ?? []
  })
  const [loading, setLoading] = useState(() => {
    const cached = getCached<Application[]>(CACHE_KEY)
    return !cached // only show loading if no cache
  })

  const fetchApplications = useCallback(async () => {
    const cached = getCached<Application[]>(CACHE_KEY)

    // If cache is fresh, skip network request entirely
    if (cached?.fresh) {
      setApplications(cached.data)
      setLoading(false)
      return
    }

    // If stale cache exists, we already rendered it — fetch silently in background
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

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

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
      invalidateCache(CACHE_KEY)
      await fetchApplications()
    }
    return { error }
  }

  const updateStatus = async (id: string, status: ApplicationStatus) => {
    const { error } = await supabase
      .from('user_applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (!error) {
      const updated = applications.map((app) =>
        app.id === id ? { ...app, status } : app
      )
      setApplications(updated)
      setCache(CACHE_KEY, updated)
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
