import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Calendar, ExternalLink, Lightbulb, Copy, AlertTriangle, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Job } from '../hooks/useJobs'
import { useToast } from '../components/Toast'

export default function JobDetail() {
  const { jobId } = useParams()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

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
      })
  }, [jobId])

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text)
    toast('success', '已复制到剪贴板')
  }

  if (loading) return <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center text-slate-400">加载中...</div>
  if (!job) return <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center text-slate-400">职位未找到</div>

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Link to="/jobs" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
          <ArrowLeft className="w-4 h-4" />
          返回职位库
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: main content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Header card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h1 className="text-xl font-bold text-slate-800">{job.title}</h1>
              <p className="text-slate-600 mt-1">{job.company}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {job.city && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 text-xs">
                    <MapPin className="w-3.5 h-3.5" /> {job.city}
                  </span>
                )}
                {job.deadline && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 text-xs">
                    <Calendar className="w-3.5 h-3.5" /> 截止: {job.deadline}
                  </span>
                )}
                {job.jd_url && (
                  <a
                    href={job.jd_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs hover:bg-blue-100"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> 查看原JD
                  </a>
                )}
              </div>
              {job.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {job.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            {job.description && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="font-semibold text-slate-800 mb-3">职位描述</h2>
                <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {job.description}
                </div>
              </div>
            )}

            {/* Resume tips */}
            {job.resume_tips && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="flex items-center gap-2 font-semibold text-slate-800">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    简历优化提词
                  </h2>
                  <button
                    onClick={() => copyText(job.resume_tips!)}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    复制
                  </button>
                </div>
                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {job.resume_tips}
                </div>
              </div>
            )}
          </div>

          {/* Right: sidebar */}
          <div className="space-y-4">
            {/* Company info */}
            {(job.company_type || job.target_graduates || job.referral_code) && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="font-semibold text-slate-800 mb-3 text-sm">岗位信息</h3>
                <div className="space-y-2 text-sm">
                  {job.company_type && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">企业性质</span>
                      <span className="text-slate-700">{job.company_type}</span>
                    </div>
                  )}
                  {job.target_graduates && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">招聘对象</span>
                      <span className="text-slate-700">{job.target_graduates}</span>
                    </div>
                  )}
                  {job.referral_code && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">内推码</span>
                      <button
                        onClick={() => copyText(job.referral_code!)}
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        {job.referral_code}
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Evaluation */}
            {job.evaluation && (
              <div className="bg-white rounded-2xl border-2 border-emerald-200 shadow-sm p-5">
                <h3 className="flex items-center gap-2 font-semibold text-emerald-700 mb-2 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  评估参考
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {job.evaluation}
                </p>
              </div>
            )}

            {/* Risk notes */}
            {job.risk_notes && (
              <div className="bg-white rounded-2xl border-2 border-amber-200 shadow-sm p-5">
                <h3 className="flex items-center gap-2 font-semibold text-amber-700 mb-2 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  风险提示
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {job.risk_notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
