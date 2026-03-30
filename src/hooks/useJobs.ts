import { useEffect, useState, useCallback, useRef } from 'react'
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

export interface JobFilters {
  quickTag?: string   // '全部' | '24h最新' | '国企央企' | '26届热门春招' | '大厂实习'
  search?: string
  city?: string
  companyType?: string
}

const PAGE_SIZE = 36

export function useJobs(filters?: JobFilters) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [todayCount, setTodayCount] = useState(0)
  const [filteredCount, setFilteredCount] = useState(0)

  // Serialize filters to detect changes
  const filtersKey = JSON.stringify(filters ?? {})
  const prevFiltersKey = useRef(filtersKey)

  // Build a Supabase query with server-side filters applied
  const buildQuery = useCallback((selectStr: string, countMode?: 'exact') => {
    let query = countMode
      ? supabase.from('jobs').select(selectStr, { count: 'exact', head: true })
      : supabase.from('jobs').select(selectStr)

    const tag = filters?.quickTag ?? '全部'

    // Server-side quick tag filters
    if (tag === '24h最新') {
      const h24ago = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      query = query.gte('updated_at', h24ago)
    } else if (tag === '国企央企') {
      query = query.eq('company_type', '央国企')
    } else if (tag === '26届热门春招') {
      // (大厂 OR 央国企) AND target_graduates contains 2026
      // We use tags contains '大厂' OR company_type = '央国企', combined with target containing 2026
      // Supabase doesn't support OR across columns easily, so we use .or()
      query = query.or('tags.cs.{"大厂"},company_type.eq.央国企')
      query = query.ilike('target_graduates', '%2026%')
    } else if (tag === '大厂实习') {
      query = query.contains('tags', ['大厂'])
      query = query.eq('recruitment_type', '实习')
    }

    // Search filter (server-side)
    if (filters?.search) {
      const q = `%${filters.search}%`
      query = query.or(`title.ilike.${q},company.ilike.${q}`)
    }

    // Company type dropdown filter
    if (filters?.companyType && filters.companyType !== '全部') {
      query = query.eq('company_type', filters.companyType)
    }

    return query
  }, [filters?.quickTag, filters?.search, filters?.companyType])

  const fetchPage = useCallback(async (offset: number, append: boolean) => {
    if (append) {
      setLoadingMore(true)
    } else {
      setLoading(true)
    }

    const query = buildQuery('*')
      .order('updated_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1)

    const { data, error } = await query

    if (!error && data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows = data as any as Job[]
      if (append) {
        setJobs((prev) => [...prev, ...rows])
      } else {
        setJobs(rows)
      }
      setHasMore(rows.length === PAGE_SIZE)
    }

    setLoading(false)
    setLoadingMore(false)
  }, [buildQuery])

  // Fetch aggregate stats
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

    // Filtered count
    const { count: fCount } = await buildQuery('*', 'exact')
    setFilteredCount(fCount ?? 0)
  }, [buildQuery])

  // Re-fetch when filters change
  useEffect(() => {
    prevFiltersKey.current = filtersKey
    setJobs([])
    setHasMore(true)
    fetchPage(0, false)
    fetchStats()
  }, [filtersKey, fetchPage, fetchStats])

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchPage(jobs.length, true)
    }
  }, [fetchPage, jobs.length, loadingMore, hasMore])

  return { jobs, loading, loadingMore, hasMore, loadMore, totalCount, todayCount, filteredCount }
}
