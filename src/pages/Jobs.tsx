import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, Calendar, ExternalLink, Plus, Check, Search, Loader2, Building2, Flame, Briefcase } from 'lucide-react'
import { useJobs } from '../hooks/useJobs'
import { useApplications } from '../hooks/useApplications'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/Toast'
import { COMPANY_TYPES } from '../lib/constants'
import { normalizeCity, getUniqueCities } from '../lib/cityNormalize'

const QUICK_TAGS = [
  { key: '全部', icon: null, label: '全部' },
  { key: '26届热门春招', icon: Flame, label: '26届热门春招' },
  { key: '国企央企', icon: Building2, label: '国企央企汇总' },
  { key: '大厂实习', icon: Briefcase, label: '大厂实习汇总' },
] as const

type QuickTag = (typeof QUICK_TAGS)[number]['key']

export default function Jobs() {
  const navigate = useNavigate()
  const { applications, importJob } = useApplications()
  const { user } = useAuth()
  const { toast } = useToast()
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

  // Set of already-imported job IDs
  const importedJobIds = useMemo(
    () => new Set(applications.map((a) => a.job_id).filter(Boolean)),
    [applications]
  )

  const handleImport = async (job: (typeof jobs)[0]) => {
    if (!user) {
      navigate(`/login?redirect=/jobs`)
      return
    }
    const { error } = await importJob(job)
    if (error) {
      if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
        toast('error', '该职位已导入过')
      } else {
        toast('error', error.message || '导入失败')
      }
    } else {
      toast('success', '导入成功')
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
    <div className="min-h-screen bg-[#F7F8FA]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">职位库</h1>
            <p className="text-sm text-slate-500 mt-1">
              共 <span className="font-medium text-slate-700">{totalCount}</span> 个职位
              {todayCount > 0 && (
                <> · 今日更新 <span className="font-medium text-blue-600">{todayCount}</span> 个</>
              )}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                onBlur={handleSearchBlur}
                placeholder="搜索公司或职位..."
                className="pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm bg-white w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">所有城市</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600'
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
          <p className="text-xs text-slate-500 mb-4">
            筛选结果: <span className="font-medium text-slate-700">{filteredCount}</span> 个职位
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="text-center py-20 text-slate-400">加载中...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">暂无匹配职位</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((job) => {
                const imported = importedJobIds.has(job.id)
                return (
                  <div
                    key={job.id}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="font-semibold text-slate-800 hover:text-blue-600 transition-colors line-clamp-1"
                      >
                        {job.title}
                      </Link>
                      {job.tags.length > 0 && (
                        <div className="flex gap-1 shrink-0">
                          {job.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{job.company}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-4">
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
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          查看原JD
                        </a>
                      )}
                      <button
                        onClick={() => handleImport(job)}
                        disabled={imported}
                        className={`ml-auto flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                          imported
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                      >
                        {imported ? (
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
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
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
        <p className="text-center text-xs text-slate-400 mt-6 pb-4">
          已加载 {filtered.length} 个职位{hasMore ? '，点击加载更多' : ''}
        </p>
      </div>
    </div>
  )
}
