import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { getCached, setCache } from '../lib/queryCache'

interface JobsPageCache {
  jobs: Job[]
  totalCount: number
  todayCount: number
  filteredCount: number
}

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
  quickTag?: string
  search?: string
  city?: string
  companyType?: string
}

const PAGE_SIZE = 36

export function useJobs(filters?: JobFilters) {
  const filtersKey = JSON.stringify(filters ?? {})
  const cacheKey = `jobs:${filtersKey}`
  const prevFiltersKey = useRef(filtersKey)

  // Initialize from cache for instant render on route switch
  const cached = getCached<JobsPageCache>(cacheKey)
  const [jobs, setJobs] = useState<Job[]>(cached?.data.jobs ?? [])
  const [loading, setLoading] = useState(!cached)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(cached?.data.totalCount ?? 0)
  const [todayCount, setTodayCount] = useState(cached?.data.todayCount ?? 0)
  const [filteredCount, setFilteredCount] = useState(cached?.data.filteredCount ?? 0)

  const fetchPage = useCallback(async (offset: number, append: boolean) => {
    // On initial load, if cache is fresh, skip network
    if (!append) {
      const c = getCached<JobsPageCache>(cacheKey)
      if (c?.fresh) {
        setJobs(c.data.jobs)
        setTotalCount(c.data.totalCount)
        setTodayCount(c.data.todayCount)
        setFilteredCount(c.data.filteredCount)
        setLoading(false)
        return
      }
    }

    if (append) {
      setLoadingMore(true)
    } else if (!getCached<JobsPageCache>(cacheKey)) {
      setLoading(true)
    }

    const tag = filters?.quickTag ?? '全部'

    const { data, error } = await supabase.rpc('get_jobs_page', {
      p_quick_tag: tag,
      p_search: filters?.search ?? '',
      p_company_type: filters?.companyType ?? '',
      p_offset: offset,
      p_limit: PAGE_SIZE,
    })

    if (!error && data) {
      const rows = (data.rows ?? []) as Job[]

      if (append) {
        setJobs((prev) => [...prev, ...rows])
      } else {
        setJobs(rows)
        setTotalCount(data.total_count ?? 0)
        setTodayCount(data.today_count ?? 0)
        setFilteredCount(data.filtered_count ?? 0)
        // Cache first page results
        setCache(cacheKey, {
          jobs: rows,
          totalCount: data.total_count ?? 0,
          todayCount: data.today_count ?? 0,
          filteredCount: data.filtered_count ?? 0,
        })
      }

      const totalLoaded = append ? offset + rows.length : rows.length
      if (tag === '最近更新') {
        setHasMore(rows.length === PAGE_SIZE && totalLoaded < 50)
      } else {
        setHasMore(rows.length === PAGE_SIZE)
      }
    }

    setLoading(false)
    setLoadingMore(false)
  }, [filters?.quickTag, filters?.search, filters?.companyType, cacheKey])

  useEffect(() => {
    const filtersChanged = prevFiltersKey.current !== filtersKey
    prevFiltersKey.current = filtersKey
    if (filtersChanged) {
      // Reset when filters change
      const c = getCached<JobsPageCache>(cacheKey)
      setJobs(c?.data.jobs ?? [])
      setHasMore(true)
    }
    fetchPage(0, false)
  }, [filtersKey, fetchPage, cacheKey])

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchPage(jobs.length, true)
    }
  }, [fetchPage, jobs.length, loadingMore, hasMore])

  return { jobs, loading, loadingMore, hasMore, loadMore, totalCount, todayCount, filteredCount }
}
