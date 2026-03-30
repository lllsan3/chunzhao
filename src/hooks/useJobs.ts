import { useEffect, useState, useCallback } from 'react'
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

const PAGE_SIZE = 36

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [todayCount, setTodayCount] = useState(0)

  const fetchPage = useCallback(async (offset: number, append: boolean) => {
    if (append) {
      setLoadingMore(true)
    } else {
      setLoading(true)
    }

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1)

    if (!error && data) {
      if (append) {
        setJobs((prev) => [...prev, ...data])
      } else {
        setJobs(data)
      }
      setHasMore(data.length === PAGE_SIZE)
    }

    setLoading(false)
    setLoadingMore(false)
  }, [])

  // Fetch aggregate stats (total + today updated)
  const fetchStats = useCallback(async () => {
    const { count } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
    setTotalCount(count ?? 0)

    const today = new Date().toISOString().slice(0, 10)
    const { count: todayN } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .gte('updated_at', today + 'T00:00:00')
    setTodayCount(todayN ?? 0)
  }, [])

  useEffect(() => {
    fetchPage(0, false)
    fetchStats()
  }, [fetchPage, fetchStats])

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchPage(jobs.length, true)
    }
  }, [fetchPage, jobs.length, loadingMore, hasMore])

  const refetch = useCallback(() => {
    setJobs([])
    setHasMore(true)
    fetchPage(0, false)
    fetchStats()
  }, [fetchPage, fetchStats])

  return { jobs, loading, loadingMore, hasMore, loadMore, refetch, totalCount, todayCount }
}
