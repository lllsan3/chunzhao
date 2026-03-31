import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, Calendar, ExternalLink, Plus, Check, Search, Loader2, Building2, Flame, Briefcase } from 'lucide-react'
import { useJobs } from '../hooks/useJobs'
import { useApplications } from '../hooks/useApplications'
import { useAuth } from '../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'
import { useToast } from '../components/Toast'
import { COMPANY_TYPES } from '../lib/constants'
import { normalizeCity, getUniqueCities } from '../lib/cityNormalize'
import { PaywallModal } from '../components/PaywallModal'
import { trackFailure, trackSuccess } from '../lib/errorTracker'

const QUICK_TAGS = [
  { key: '全部', icon: null, label: '全部' },
  { key: '26届热门春招', icon: Flame, label: '26届热门春招' },
  { key: '国企央企', icon: Building2, label: '国企央企汇总' },
  { key: '大厂实习', icon: Briefcase, label: '大厂实习汇总' },
] as const

type QuickTag = (typeof QUICK_TAGS)[number]['key']

export default function Jobs() {
  const navigate = useNavigate()
  const { applications, importJob, deleteApplication, isAtFreeLimit } = useApplications()
  const { user } = useAuth()
  const { membership } = useSubscription()
  const { toast } = useToast()
  const [showPaywall, setShowPaywall] = useState(false)
  const [importingId, setImportingId] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ jobId: string; appId: string; title: string } | null>(null)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('全部')
  const [quickTag, setQuickTag] = useState<QuickTag>('全部')

  // Server-side filtered query
  const { jobs, loading, loadingMore, hasMore, loadMore, totalCount, todayCount, filteredCount } = useJobs({
    quickTag,
    search,
    companyType: typeFilter,
  })

  // City filter is still client-side (applied on loaded results)
  const filtered = useMemo(() => {
    if (!cityFilter) return jobs
    return jobs.filter((job) => {
      const norm = normalizeCity(job.city)
      return norm === cityFilter
    })
  }, [jobs, cityFilter])

  // Normalized unique cities for dropdown
  const cities = useMemo(
    () => getUniqueCities(jobs.map((j) => j.city)),
    [jobs]
  )

  // Map job_id → application id for toggle (import/remove)
  const importedMap = useMemo(
    () => {
      const map = new Map<string, string>()
      for (const a of applications) {
        if (a.job_id) map.set(a.job_id, a.id)
      }
      return map
    },
    [applications]
  )

  const handleToggle = (job: (typeof jobs)[0]) => {
    if (!user) {
      navigate(`/login?redirect=/jobs`)
      return
    }
    const appId = importedMap.get(job.id)
    if (appId) {
      // Already imported → confirm remove
      setDeleteConfirm({ jobId: job.id, appId, title: `${job.company} · ${job.title}` })
    } else {
      // Not imported → import
      handleImport(job)
    }
  }

  const handleImport = async (job: (typeof jobs)[0]) => {
    if (isAtFreeLimit && !membership.isMember) {
      setShowPaywall(true)
      return
    }
    setImportingId(job.id)
    const { error } = await importJob(job)
    setImportingId(null)
    if (error) {
      if (error.message?.includes('FREE_LIMIT_REACHED')) {
        setShowPaywall(true)
      } else if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
        toast('error', '该职位已导入过')
      } else {
        toast('error', trackFailure('import', '没导进去，网络开小差了，再试一次'))
      }
    } else {
      trackSuccess('import')
      toast('success', '搞定！已加入申请池')
    }
  }

  const handleConfirmRemove = async () => {
    if (!deleteConfirm) return
    setRemovingId(deleteConfirm.jobId)
    const { error } = await deleteApplication(deleteConfirm.appId)
    setRemovingId(null)
    setDeleteConfirm(null)
    if (error) {
      toast('error', '移除失败，请重试')
    } else {
      toast('success', '已移除')
    }
  }

  // Debounced search
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') setSearch(searchInput)
  }
  const handleSearchBlur = () => {
    if (searchInput !== search) setSearch(searchInput)
  }

  return (
    <div className="min-h-screen bg-page">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-ink">职位库</h1>
            <p className="text-sm text-ink-muted mt-1">
              共 <span className="font-medium text-ink">{totalCount}</span> 个职位
              {todayCount > 0 && (
                <> · 今日更新 <span className="font-medium text-accent">{todayCount}</span> 个</>
              )}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted/70" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                onBlur={handleSearchBlur}
                placeholder="搜索公司或职位..."
                className="pl-9 pr-3 py-2 rounded-lg border border-line text-sm bg-white w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
            </div>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-line text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              <option value="">所有城市</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-line text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              {COMPANY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t === '全部' ? '所有企业' : t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick tags */}
        <div className="flex flex-wrap gap-2 mb-5">
          {QUICK_TAGS.map(({ key, icon: Icon, label }) => {
            const active = quickTag === key
            return (
              <button
                key={key}
                onClick={() => setQuickTag(key)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  active
                    ? 'bg-accent text-white'
                    : 'bg-white text-ink-muted border border-line hover:border-accent/40 hover:text-accent'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {label}
              </button>
            )
          })}
{/* 笔试真题入口已移至顶部导航栏 */}
        </div>

        {/* Active filter indicator */}
        {quickTag !== '全部' && !loading && (
          <p className="text-xs text-ink-muted mb-4">
            筛选结果: <span className="font-medium text-ink">{filteredCount}</span> 个职位
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="text-center py-20 text-ink-muted/70">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            正在加载最新岗位...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-ink-muted/70">暂无匹配职位</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((job) => {
                const imported = importedMap.has(job.id)
                return (
                  <div
                    key={job.id}
                    className="bg-white rounded-2xl border border-line-light shadow-sm p-5 flex flex-col"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="font-semibold text-ink hover:text-accent transition-colors line-clamp-1"
                      >
                        {job.title}
                      </Link>
                      {job.tags.length > 0 && (
                        <div className="flex gap-1 shrink-0">
                          {job.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-full bg-tag-bg text-ink-muted text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-ink-muted mb-3">{job.company}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted mb-4">
                      {job.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.city}
                        </span>
                      )}
                      {job.deadline && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          截止: {job.deadline}
                        </span>
                      )}
                    </div>
                    <div className="mt-auto flex items-center gap-2">
                      {job.jd_url && (
                        <a
                          href={job.jd_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          查看原JD
                        </a>
                      )}
                      <button
                        onClick={() => handleToggle(job)}
                        disabled={importingId === job.id || removingId === job.id}
                        className={`ml-auto flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                          imported
                            ? 'bg-ok-soft text-ok hover:bg-emerald-100'
                            : importingId === job.id
                              ? 'bg-brand-hover text-white cursor-wait'
                              : 'bg-brand text-white hover:bg-brand-hover'
                        }`}
                      >
                        {importingId === job.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            收藏中...
                          </>
                        ) : imported ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            已导入
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            导入申请池
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-line bg-white text-sm text-ink-muted hover:bg-tag-bg disabled:opacity-50 transition-colors"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      加载中...
                    </>
                  ) : (
                    '加载更多职位'
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-ink-muted/70 mt-6 pb-4">
          已加载 {filtered.length} 个职位{hasMore ? '，点击加载更多' : ''}
        </p>
      </div>

      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}

      {/* Remove confirm dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xs p-5" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm text-ink mb-2">确定要移除这个岗位吗？</p>
            <p className="text-xs text-ink-muted mb-4 line-clamp-1">{deleteConfirm.title}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 rounded-xl text-sm border border-line text-ink-muted hover:bg-tag-bg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmRemove}
                className="flex-1 py-2 rounded-xl text-sm bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                确认移除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
