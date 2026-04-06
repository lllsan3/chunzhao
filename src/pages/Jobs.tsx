import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Check, Search, Loader2 } from 'lucide-react'
import { useSEO } from '../hooks/useSEO'
import { useJobs } from '../hooks/useJobs'
import { useApplications } from '../hooks/useApplications'
import { useAuth } from '../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'
import { useToast } from '../components/Toast'
import { COMPANY_TYPES } from '../lib/constants'
import { normalizeCity, getUniqueCities } from '../lib/cityNormalize'
import { splitPositions } from '../lib/splitPositions'
import { PaywallModal } from '../components/PaywallModal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { trackFailure, trackSuccess } from '../lib/errorTracker'

const QUICK_TAGS = [
  { key: '全部', label: '全部' },
  { key: '26届热门春招', label: '26届热门春招' },
  { key: '国企央企', label: '国企央企汇总' },
  { key: '大厂实习', label: '大厂实习汇总' },
] as const

type QuickTag = (typeof QUICK_TAGS)[number]['key']

export default function Jobs() {
  useSEO({
    title: '校招岗位库 - 2万+春招秋招岗位筛选查询',
    description: '覆盖互联网大厂、央企国企、银行等校招岗位，每周更新，免费浏览',
    path: '/jobs',
  })
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
    <div className="min-h-screen bg-[#F9F9F6]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-4">
          <div>
            <p className="text-[10px] tracking-[0.28em] text-gray-400 md:text-xs">JOB INDEX</p>
            <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">职位库</h1>
            <p className="text-sm text-ink-muted mt-1">
              共 <span className="font-medium text-ink">{totalCount}</span> 个职位
              {todayCount > 0 && (
                <> · 今日更新 <span className="font-medium text-gray-900">{todayCount}</span> 个</>
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
                placeholder="搜索公司、岗位、方向..."
                className="pl-9 pr-3 h-11 border border-gray-200 text-sm bg-white w-full sm:w-56 outline-none transition-colors placeholder:text-gray-400 focus:border-black"
              />
            </div>
            <div className="grid grid-cols-2 sm:flex gap-3">
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-1 h-10 bg-transparent text-sm font-medium text-slate-800 focus:outline-none cursor-pointer appearance-none"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' fill=\'%239ca3af\' viewBox=\'0 0 16 16\'%3E%3Cpath d=\'M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 4px center', paddingRight: '20px' }}
            >
              <option value="">全部城市</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-1 h-10 bg-transparent text-sm font-medium text-slate-800 focus:outline-none cursor-pointer appearance-none"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' fill=\'%239ca3af\' viewBox=\'0 0 16 16\'%3E%3Cpath d=\'M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 4px center', paddingRight: '20px' }}
            >
              {COMPANY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t === '全部' ? '所有企业' : t}
                </option>
              ))}
            </select>
            </div>
          </div>
        </div>

        {/* Quick tags */}
        <div className="flex gap-6 overflow-x-auto whitespace-nowrap mb-5 border-b border-gray-200 pb-1.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {QUICK_TAGS.map(({ key, label }) => {
            const active = quickTag === key
            return (
              <button
                key={key}
                onClick={() => setQuickTag(key)}
                className={`shrink-0 border-b-2 pb-1.5 text-[13px] transition-colors md:text-sm ${
                  active
                    ? 'border-black font-semibold text-black'
                    : 'border-transparent text-gray-500 hover:text-black'
                }`}
              >
                {label}
              </button>
            )
          })}
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
            <div className="grid grid-cols-1 gap-0 md:grid-cols-2 md:gap-3 xl:grid-cols-3">
              {filtered.map((job) => {
                const isBusy = importingId === job.id || removingId === job.id
                const imported = importedMap.has(job.id)
                const positions = splitPositions(job.title)
                const cityLabel = job.city ? job.city.split(',')[0].split('、')[0] : ''
                const primaryTag = job.tags[0]

                return (
                  <div
                    key={job.id}
                    className="relative flex min-w-0 flex-col border-b border-gray-200 px-0 py-3 md:border md:bg-white md:px-4 md:py-4"
                  >
                    {/* Mobile: import button absolute top-right */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggle(job) }}
                      disabled={isBusy}
                      className={`md:hidden absolute right-0 top-3 flex items-center gap-0.5 border border-transparent px-2 py-1 text-[10px] font-medium transition-colors duration-200 ${
                        imported
                          ? 'border border-gray-200 bg-white text-gray-500'
                          : importingId === job.id
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-gray-600 active:border-black active:bg-black active:text-white'
                      }`}
                    >
                      {importingId === job.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : imported ? (
                        <><Check className="w-3 h-3" />已导入</>
                      ) : (
                        <><Plus className="w-3 h-3" />导入</>
                      )}
                    </button>

                    {/* Company name */}
                    <Link
                      to={`/jobs/${job.id}`}
                      className="mb-0.5 line-clamp-1 pr-16 text-sm font-semibold tracking-tight text-slate-900 transition-colors hover:text-slate-700 md:pr-0 md:text-base"
                    >
                      {job.company}
                    </Link>

                    {/* Positions — compact chips */}
                    <div className="mb-1.5 flex flex-wrap items-center gap-1 md:mb-2.5">
                      {positions.slice(0, 2).map((pos) => (
                        <span key={pos} className="max-w-[7.75rem] truncate rounded-sm bg-gray-100 px-1.5 py-0.5 text-[10px] leading-tight text-gray-700 md:max-w-none md:px-2 md:text-xs">{pos}</span>
                      ))}
                      {positions.length > 2 && (
                        <span className="text-[10px] md:text-xs text-gray-400">+{positions.length - 2}</span>
                      )}
                    </div>

                    {/* Metadata — inline with button on desktop */}
                    <div className="flex min-w-0 items-center text-[10px] leading-none text-slate-500 md:mb-3 md:text-xs">
                      {cityLabel && (
                        <span className="max-w-[4.75rem] truncate md:max-w-none">{cityLabel}</span>
                      )}
                      {cityLabel && job.deadline && <span className="mx-1 text-slate-300 md:mx-1.5">·</span>}
                      {job.deadline && (
                        <span className="max-w-[5.5rem] truncate md:max-w-none">{job.deadline}</span>
                      )}
                      {primaryTag && (cityLabel || job.deadline) && <span className="mx-1 text-slate-300 md:mx-1.5">·</span>}
                      {primaryTag ? (
                        <span className="max-w-[6.5rem] truncate md:max-w-none">{primaryTag}</span>
                      ) : null}
                    </div>

                    {/* Desktop-only actions row */}
                    <div className="hidden md:flex mt-auto items-center gap-3 pt-1">
                      {job.jd_url && (
                        <a
                          href={job.jd_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-normal text-slate-400 hover:text-slate-900 underline underline-offset-4 decoration-slate-200 hover:decoration-slate-900 transition-colors duration-200"
                        >
                          查看 JD
                        </a>
                      )}
                      <button
                        onClick={() => handleToggle(job)}
                        disabled={isBusy}
                        className={`ml-auto flex items-center gap-1 border px-3 py-1.5 text-sm font-normal transition-colors duration-200 ${
                          imported
                            ? 'border border-gray-200 bg-white text-gray-500'
                            : importingId === job.id
                              ? 'bg-black text-white'
                              : 'text-slate-600 border border-slate-300 bg-transparent hover:bg-black hover:text-white hover:border-black'
                        }`}
                      >
                        {importingId === job.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            收藏中
                          </>
                        ) : imported ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            已导入
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            导入
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
                  className="inline-flex items-center gap-2 border border-gray-200 bg-white px-6 py-3 text-sm text-gray-600 transition-colors hover:border-black hover:text-black disabled:opacity-50"
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

      {deleteConfirm && (
        <ConfirmDialog
          title="确定要移除这个岗位吗？"
          subtitle={deleteConfirm.title}
          confirmLabel="确认移除"
          onCancel={() => setDeleteConfirm(null)}
          onConfirm={handleConfirmRemove}
        />
      )}
    </div>
  )
}
