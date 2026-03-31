import { supabase } from './supabase'
import { getCached, setCache } from './queryCache'

/**
 * Prefetch the default Jobs page data when user hovers "找职位" nav item.
 * Stores result in queryCache so useJobs picks it up instantly.
 */
let prefetching = false

export function prefetchJobs() {
  // Must match JSON.stringify({quickTag:'全部',search:'',companyType:'全部'}) from useJobs
  const cacheKey = `jobs:${JSON.stringify({quickTag:'全部',search:'',companyType:'全部'})}`
  const cached = getCached(cacheKey)
  if (cached || prefetching) return // Already cached or in-flight

  prefetching = true
  supabase.rpc('get_jobs_page', {
    p_quick_tag: '全部',
    p_search: '',
    p_company_type: '',
    p_offset: 0,
    p_limit: 36,
  }).then(({ data, error }) => {
    prefetching = false
    if (!error && data) {
      setCache(cacheKey, {
        jobs: data.rows ?? [],
        totalCount: data.total_count ?? 0,
        todayCount: data.today_count ?? 0,
        filteredCount: data.filtered_count ?? 0,
      })
    }
  })
}
