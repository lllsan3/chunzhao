import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Plus,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Job } from '../hooks/useJobs'
import { useApplications } from '../hooks/useApplications'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/Toast'
import { CollapsibleTextBlock } from '../components/CollapsibleTextBlock'

interface RelatedJob {
  id: string
  title: string
  company: string
  city: string | null
  tags: string[]
  deadline: string | null
  updated_at: string
}

function DetailPanel({
  eyebrow,
  title,
  children,
  action,
}: {
  eyebrow: string
  title: string
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <section className="border border-gray-200 bg-white px-3 py-3 shadow-none md:px-5 md:py-5">
      <div className="flex flex-col gap-2 border-b border-gray-200 pb-2.5 md:flex-row md:items-start md:justify-between md:gap-4 md:pb-3">
        <div>
          <p className="hidden text-[10px] tracking-[0.28em] text-gray-400 md:block md:text-xs">{eyebrow}</p>
          <h2 className="text-[15px] font-medium tracking-tight text-gray-900 md:mt-2 md:text-base">
            {title}
          </h2>
        </div>
        {action}
      </div>
      <div className="pt-3 md:pt-4">{children}</div>
    </section>
  )
}

function compactMeta(value: string | null) {
  if (!value) return null
  return value.split(',')[0]?.split('、')[0]?.trim() || value
}

export default function JobDetail() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [relatedJobs, setRelatedJobs] = useState<RelatedJob[]>([])
  const { toast } = useToast()
  const { user } = useAuth()
  const { applications, importJob } = useApplications()
  const [importing, setImporting] = useState(false)

  const isImported = useMemo(
    () => applications.some((application) => application.job_id === jobId),
    [applications, jobId]
  )

  useEffect(() => {
    if (!jobId) return

    supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single()
      .then(({ data, error }) => {
        if (error) {
          setLoadError(true)
          setLoading(false)
          return
        }

        setJob(data)
        setLoading(false)

        if (data) {
          supabase
            .from('jobs')
            .select('id, title, company, city, tags, deadline, updated_at')
            .eq('company', data.company)
            .neq('id', jobId)
            .order('updated_at', { ascending: false })
            .limit(6)
            .then(({ data: byCompany }) => {
              const results = (byCompany ?? []) as RelatedJob[]

              if (results.length >= 3) {
                setRelatedJobs(results)
              } else if (data.company_type) {
                const existingIds = new Set(results.map((row) => row.id))

                supabase
                  .from('jobs')
                  .select('id, title, company, city, tags, deadline, updated_at')
                  .eq('company_type', data.company_type)
                  .neq('id', jobId)
                  .neq('company', data.company)
                  .order('updated_at', { ascending: false })
                  .limit(6 - results.length)
                  .then(({ data: bySimilar }) => {
                    const extra = (bySimilar ?? []).filter((row: RelatedJob) => !existingIds.has(row.id))
                    setRelatedJobs([...results, ...(extra as RelatedJob[])])
                  })
              } else {
                setRelatedJobs(results)
              }
            })
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
      if (error.message?.includes('FREE_LIMIT_REACHED')) {
        toast('error', '免费版最多管理 3 个职位，请升级后继续添加')
      } else {
        toast('error', error.message || '导入失败')
      }
    } else {
      toast('success', '导入成功，可在看板中管理')
    }
  }

  const copyText = (text: string) => {
    try {
      navigator.clipboard.writeText(text)
      toast('success', '已复制到剪贴板')
    } catch {
      toast('error', '复制失败，请手动复制')
    }
  }

  const relatedColumns = useMemo(() => {
    const midpoint = Math.ceil(relatedJobs.length / 2)
    return [relatedJobs.slice(0, midpoint), relatedJobs.slice(midpoint)]
  }, [relatedJobs])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page px-4 text-gray-500">
        加载中...
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page px-4">
        <div className="w-full max-w-md border border-gray-200 bg-white p-6 text-center shadow-none">
          <p className="text-sm leading-6 text-gray-600">数据加载失败，请刷新页面重试。</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 inline-flex items-center justify-center bg-black px-6 py-3 text-sm font-bold tracking-[0.16em] text-white transition-colors hover:bg-gray-800"
          >
            重新加载
          </button>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page px-4 text-gray-500">
        职位未找到
      </div>
    )
  }

  const hasRichContent = !!(job.description || job.resume_tips || job.evaluation || job.risk_notes)
  const metaItems = [
    job.company_type,
    compactMeta(job.city),
    job.deadline ? `截止 ${job.deadline}` : null,
    job.target_graduates,
  ].filter(Boolean)

  return (
    <div className="min-h-screen bg-page">
      <div className="mx-auto max-w-5xl px-3 py-4 md:px-4 md:py-8">
        <Link
          to="/jobs"
          className="group inline-flex items-center gap-1 text-sm text-gray-500 underline underline-offset-[6px] decoration-gray-200 transition-all hover:text-black hover:decoration-black"
        >
          <ArrowLeft className="h-4 w-4" />
          返回职位库
        </Link>

        <section className="mt-4 border-0 bg-transparent px-0 py-0 shadow-none md:border md:border-gray-200 md:bg-white md:px-7 md:py-7">
          <div className="flex flex-col gap-4 border border-gray-200 bg-white px-3 py-4 md:border-0 md:bg-transparent md:px-0 md:py-0">
            <div className="min-w-0 flex-1">
              <p className="hidden text-[10px] tracking-[0.28em] text-gray-400 md:block md:text-xs">JOB FILE</p>
              <h1 className="font-serif text-[28px] font-semibold leading-tight tracking-tight text-gray-900 md:mt-2 md:text-4xl">
                {job.title}
              </h1>
              <p className="mt-2.5 text-base font-medium text-gray-900 md:mt-3 md:text-lg">
                {job.company}
              </p>

              {metaItems.length > 0 ? (
                <p className="mt-2 text-[11px] leading-5 text-gray-500 md:text-sm md:leading-6">
                  {metaItems.join(' · ')}
                </p>
              ) : null}

              {job.tags.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1">
                  {job.tags.slice(0, 6).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-sm bg-gray-100 px-2 py-1 text-[10px] text-gray-700 md:text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {job.tags.length > 6 ? (
                    <span className="px-1 py-1 text-[10px] text-gray-400 md:text-xs">
                      +{job.tags.length - 6}
                    </span>
                  ) : null}
                </div>
              ) : null}

              {job.referral_code ? (
                <div className="mt-3 inline-flex w-full flex-wrap items-center gap-2 border border-gray-200 px-3 py-2 text-sm text-gray-600 md:mt-4 md:w-auto">
                  <span>内推码</span>
                  <span className="font-mono tracking-[0.16em] text-gray-900">{job.referral_code}</span>
                  <button
                    onClick={() => copyText(job.referral_code!)}
                    className="text-xs text-gray-500 underline underline-offset-4 decoration-gray-200 transition-all hover:text-black hover:decoration-black"
                  >
                    复制
                  </button>
                </div>
              ) : null}
            </div>

            <div className="flex w-full shrink-0 flex-col items-start gap-3 md:w-auto md:items-end">
              {job.jd_url ? (
                <a
                  href={job.jd_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1 text-sm text-gray-600 underline underline-offset-[6px] decoration-gray-200 transition-all hover:text-black hover:decoration-black"
                >
                  查看原 JD
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : null}

              <button
                onClick={handleImport}
                disabled={isImported || importing}
                className={`inline-flex w-full items-center justify-center gap-2 px-5 py-3.5 text-sm font-bold tracking-[0.16em] transition-colors md:min-w-[220px] md:px-6 md:py-4 ${
                  isImported
                    ? 'border border-gray-200 bg-white text-gray-500'
                    : 'bg-black text-white hover:bg-gray-800'
                } disabled:cursor-not-allowed disabled:opacity-70`}
              >
                {isImported ? (
                  <>
                    <Check className="h-4 w-4" />
                    已导入
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    {importing ? '导入中...' : '导入申请池'}
                  </>
                )}
              </button>
            </div>
          </div>

          <div className={`mt-3 ${hasRichContent ? 'grid grid-cols-1 gap-3 md:mt-4 md:gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.9fr)] lg:gap-8' : ''}`}>
            <div className="space-y-3 md:space-y-4">
              {job.description ? (
                <DetailPanel eyebrow="DESCRIPTION" title="职位描述">
                  <CollapsibleTextBlock text={job.description} />
                </DetailPanel>
              ) : null}

              {job.resume_tips ? (
                <DetailPanel
                  eyebrow="RESUME NOTES"
                  title="简历优化提词"
                  action={
                    <button
                      onClick={() => copyText(job.resume_tips!)}
                      className="text-xs text-gray-500 underline underline-offset-4 decoration-gray-200 transition-all hover:text-black hover:decoration-black"
                    >
                      复制
                    </button>
                  }
                >
                  <CollapsibleTextBlock text={job.resume_tips} />
                </DetailPanel>
              ) : null}
            </div>

            {hasRichContent ? (
              <div className="space-y-3 md:space-y-4 lg:border-l lg:border-gray-200 lg:pl-8">
                {job.evaluation ? (
                  <DetailPanel eyebrow="EVALUATION" title="评估参考">
                    <CollapsibleTextBlock text={job.evaluation} />
                  </DetailPanel>
                ) : null}

                {job.risk_notes ? (
                  <DetailPanel eyebrow="RISK NOTES" title="风险提示">
                    <CollapsibleTextBlock text={job.risk_notes} />
                  </DetailPanel>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>

        {relatedJobs.length > 0 ? (
          <section className="mt-4 border border-gray-200 bg-white px-3 py-4 shadow-none md:mt-6 md:px-6 md:py-6">
            <div className="border-b border-gray-200 pb-3 md:pb-4">
              <p className="hidden text-[10px] tracking-[0.28em] text-gray-400 md:block md:text-xs">RELATED</p>
              <h2 className="font-serif text-xl font-semibold tracking-tight text-gray-900 md:mt-2 md:text-2xl">
                相关职位推荐
              </h2>
            </div>

            <div className="mt-3 md:mt-4 md:grid md:grid-cols-2 md:gap-10">
              {relatedColumns.map((column, columnIndex) => (
                <div
                  key={`column-${columnIndex}`}
                  className={columnIndex === 1 ? 'md:border-l md:border-gray-200 md:pl-10' : ''}
                >
                  {column.map((relatedJob) => (
                    <Link
                      key={relatedJob.id}
                      to={`/jobs/${relatedJob.id}`}
                      className="group block border-b border-gray-200 py-3 last:border-b-0 md:py-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 md:text-base">
                            {relatedJob.title}
                          </p>
                          <p className="mt-1 text-[11px] leading-5 text-gray-500 md:text-sm">
                            {[
                              relatedJob.company,
                              compactMeta(relatedJob.city),
                              relatedJob.deadline ? `截止 ${relatedJob.deadline}` : null,
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                          </p>
                        </div>
                        <span className="shrink-0 text-gray-400 transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}
