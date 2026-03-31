import { useEffect, useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Calendar, ExternalLink, Lightbulb, Copy, AlertTriangle, CheckCircle, Plus, Check, Building2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Job } from '../hooks/useJobs'
import { useApplications } from '../hooks/useApplications'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/Toast'

export default function JobDetail() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedJobs, setRelatedJobs] = useState<Job[]>([])
  const { toast } = useToast()
  const { user } = useAuth()
  const { applications, importJob } = useApplications()
  const [importing, setImporting] = useState(false)

  const isImported = useMemo(
    () => applications.some((a) => a.job_id === jobId),
    [applications, jobId]
  )

  useEffect(() => {
    if (!jobId) return
    supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single()
      .then(({ data }) => {
        setJob(data)
        setLoading(false)

        // Fetch related jobs (same company or same city, max 6)
        if (data) {
          const filters = []
          if (data.company) filters.push(`company.eq.${data.company}`)
          if (data.city) filters.push(`city.eq.${data.city}`)

          if (filters.length > 0) {
            supabase
              .from('jobs')
              .select('id, title, company, city, tags, deadline, updated_at')
              .or(filters.join(','))
              .neq('id', jobId)
              .order('updated_at', { ascending: false })
              .limit(6)
              .then(({ data: related }) => {
                if (related) setRelatedJobs(related as Job[])
              })
          }
        }
      })
  }, [jobId])

  const handleImport = async () => {
    if (!user) {
      navigate(`/login?redirect=/jobs/${jobId}`)
      return
    }
    if (!job || isImported) return
    setImporting(true)
    const { error } = await importJob(job)
    setImporting(false)
    if (error) {
      toast('error', error.message || '导入失败')
    } else {
      toast('success', '导入成功，可在看板中管理')
    }
  }

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text)
    toast('success', '已复制到剪贴板')
  }

  if (loading) return <div className="min-h-screen bg-page flex items-center justify-center text-ink-muted/70">加载中...</div>
  if (!job) return <div className="min-h-screen bg-page flex items-center justify-center text-ink-muted/70">职位未找到</div>

  const hasRichContent = !!(job.description || job.resume_tips || job.evaluation || job.risk_notes)

  return (
    <div className="min-h-screen bg-page">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Link to="/jobs" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink mb-4">
          <ArrowLeft className="w-4 h-4" />
          返回职位库
        </Link>

        {/* Hero card — larger when no rich content */}
        <div className={`bg-white rounded-2xl border border-line-light shadow-sm ${hasRichContent ? 'p-6' : 'p-8'}`}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className={`font-bold text-ink ${hasRichContent ? 'text-xl' : 'text-2xl'}`}>
                {job.title}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Building2 className="w-4 h-4 text-ink-muted/70" />
                <span className="text-lg text-ink font-medium">{job.company}</span>
                {job.company_type && (
                  <span className="px-2 py-0.5 rounded-full bg-tag-bg text-ink-muted text-xs">
                    {job.company_type}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {job.city && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-tag-bg text-ink-muted text-sm">
                    <MapPin className="w-4 h-4" /> {job.city}
                  </span>
                )}
                {job.deadline && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-tag-bg text-ink-muted text-sm">
                    <Calendar className="w-4 h-4" /> 截止: {job.deadline}
                  </span>
                )}
                {job.target_graduates && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent-soft text-accent text-sm">
                    {job.target_graduates}
                  </span>
                )}
              </div>

              {job.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {job.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full bg-tag-bg text-ink-muted text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {job.referral_code && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-ink-muted">内推码:</span>
                  <button
                    onClick={() => copyText(job.referral_code!)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-sm font-mono hover:bg-amber-100"
                  >
                    {job.referral_code}
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* JD link badge — desktop right side */}
            {job.jd_url && (
              <a
                href={job.jd_url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-soft text-accent text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                查看原 JD
              </a>
            )}
          </div>

          {/* Import CTA */}
          <div className="mt-6 pt-5 border-t border-line-light">
            <button
              onClick={handleImport}
              disabled={isImported || importing}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-colors ${
                isImported
                  ? 'bg-emerald-50 text-emerald-600 cursor-default'
                  : 'bg-brand text-white hover:bg-brand-hover'
              } disabled:opacity-60`}
            >
              {isImported ? (
                <>
                  <Check className="w-4 h-4" />
                  已导入到申请池
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  {importing ? '导入中...' : '导入到申请池，开始管理这个岗位'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Rich content sections — only shown when data exists */}
        {hasRichContent && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
            <div className="lg:col-span-2 space-y-4">
              {job.description && (
                <div className="bg-white rounded-2xl border border-line-light shadow-sm p-6">
                  <h2 className="font-semibold text-ink mb-3">职位描述</h2>
                  <div className="bg-tag-bg rounded-xl p-4 text-sm text-ink-muted leading-relaxed whitespace-pre-wrap">
                    {job.description}
                  </div>
                </div>
              )}

              {job.resume_tips && (
                <div className="bg-white rounded-2xl border border-line-light shadow-sm p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="flex items-center gap-2 font-semibold text-ink">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      简历优化提词
                    </h2>
                    <button
                      onClick={() => copyText(job.resume_tips!)}
                      className="flex items-center gap-1 text-xs text-ink-muted/70 hover:text-ink-muted"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      复制
                    </button>
                  </div>
                  <div className="text-sm text-ink-muted leading-relaxed whitespace-pre-wrap">
                    {job.resume_tips}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {job.evaluation && (
                <div className="bg-white rounded-2xl border-2 border-emerald-200 shadow-sm p-5">
                  <h3 className="flex items-center gap-2 font-semibold text-emerald-700 mb-2 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    评估参考
                  </h3>
                  <p className="text-sm text-ink-muted leading-relaxed whitespace-pre-wrap">
                    {job.evaluation}
                  </p>
                </div>
              )}

              {job.risk_notes && (
                <div className="bg-white rounded-2xl border-2 border-amber-200 shadow-sm p-5">
                  <h3 className="flex items-center gap-2 font-semibold text-amber-700 mb-2 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    风险提示
                  </h3>
                  <p className="text-sm text-ink-muted leading-relaxed whitespace-pre-wrap">
                    {job.risk_notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Related jobs */}
        {relatedJobs.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-ink mb-4">相关职位推荐</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {relatedJobs.map((rj) => (
                <Link
                  key={rj.id}
                  to={`/jobs/${rj.id}`}
                  className="bg-white rounded-2xl border border-line-light shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <p className="font-semibold text-ink text-sm line-clamp-1">{rj.title}</p>
                  <p className="text-xs text-ink-muted mt-1">{rj.company}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-ink-muted/70">
                    {rj.city && (
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" />
                        {rj.city}
                      </span>
                    )}
                    {rj.deadline && (
                      <span className="flex items-center gap-0.5">
                        <Calendar className="w-3 h-3" />
                        {rj.deadline}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
