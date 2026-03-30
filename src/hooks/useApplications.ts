import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
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

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('user_applications')
      .select('*')
      .order('imported_at', { ascending: false })

    if (!error && data) {
      setApplications(data as Application[])
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
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status } : app))
      )
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
