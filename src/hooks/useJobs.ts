import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface Job {
  id: string
  title: string
  company: string
  city: string | null
  deadline: string | null
  deadline_date: string | null
  tags: string[]
  jd_url: string | null
  description: string | null
  resume_tips: string | null
  evaluation: string | null
  risk_notes: string | null
  status: string
  company_type: string | null
  target_graduates: string | null
  referral_code: string | null
  source: string | null
  created_at: string
  updated_at: string
}

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJobs()
  }, [])

  async function fetchJobs() {
    setLoading(true)
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setJobs(data)
    }
    setLoading(false)
  }

  return { jobs, loading, refetch: fetchJobs }
}
