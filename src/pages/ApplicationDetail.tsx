import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, MapPin, Calendar, ExternalLink, Lightbulb, Copy,
  AlertTriangle, CheckCircle, Clock
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { STATUS_MAP, STATUS_LIST } from '../lib/constants'
import type { ApplicationStatus } from '../lib/constants'
import { StatusBadge } from '../components/StatusBadge'
import { useApplications } from '../hooks/useApplications'
import { useToast } from '../components/Toast'

interface FullApplication {
  id: string
  user_id: string
  job_id: string | null
  title: string
  company: string
  city: string | null
  deadline: string | null
  jd_url: string | null
  status: ApplicationStatus
  notes: string | null
  reminder_date: string | null
  reminder_note: string | null
  imported_at: string
  updated_at: string
  // Joined from jobs table
  job?: {
    description: string | null
    resume_tips: string | null
    evaluation: string | null
    risk_notes: string | null
    company_type: string | null
    target_graduates: string | null
    referral_code: string | null
    tags: string[]
  } | null
}

export default function ApplicationDetail() {
  const { applicationId } = useParams()
  const [app, setApp] = useState<FullApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState('')
  const [reminderDate, setReminderDate] = useState('')
  const { updateStatus, updateNotes, updateReminder } = useApplications()
  const { toast } = useToast()
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!applicationId) return
    supabase
      .from('user_applications')
      .select('*, job:jobs(description, resume_tips, evaluation, risk_notes, company_type, target_graduates, referral_code, tags)')
      .eq('id', applicationId)
      .single()
      .then(({ data }) => {
        if (data) {
          const d = data as FullApplication
          setApp(d)
          setNotes(d.notes || '')
          setReminderDate(d.reminder_date || '')
        }
        setLoading(false)
      })
  }, [applicationId])

  const handleStatusChange = async (status: ApplicationStatus) => {
    if (!app) return
    const { error } = await updateStatus(app.id, status)
    if (error) {
      toast('error', '更新失败')
    } else {
      setApp({ ...app, status })
      toast('success', `状态已更新为「${STATUS_MAP[status]}」`)
    }
  }

  const handleNotesChange = (value: string) => {
    setNotes(value)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      if (!app) return
      const { error } = await updateNotes(app.id, value)
      if (!error) toast('success', '笔记已保存')
    }, 800)
  }

  const handleReminderSave = async () => {
    if (!app) return
    const { error } = await updateReminder(app.id, reminderDate || null, null)
    if (!error) toast('success', '提醒已设置')
  }

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text)
    toast('success', '已复制到剪贴板')
  }

  if (loading) return <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center text-slate-400">加载中...</div>
  if (!app) return <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center text-slate-400">未找到该申请</div>

  const job = app.job

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Link to="/board" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
          <ArrowLeft className="w-4 h-4" />
          返回看板
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left main */}
          <div className="lg:col-span-2 space-y-4">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h1 className="text-xl font-bold text-slate-800">{app.title}</h1>
              <p className="text-slate-600 mt-1">{app.company}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {app.city && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 text-xs">
                    <MapPin className="w-3.5 h-3.5" /> {app.city}
                  </span>
                )}
                {app.deadline && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 text-xs">
                    <Calendar className="w-3.5 h-3.5" /> 截止: {app.deadline}
                  </span>
                )}
                {app.jd_url && (
                  <a href={app.jd_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs hover:bg-blue-100">
                    <ExternalLink className="w-3.5 h-3.5" /> 查看原JD
                  </a>
                )}
              </div>
            </div>

            {/* Description from jobs */}
            {job?.description && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="font-semibold text-slate-800 mb-3">职位描述</h2>
                <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {job.description}
                </div>
              </div>
            )}

            {/* Resume tips */}
            {job?.resume_tips && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="flex items-center gap-2 font-semibold text-slate-800">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    简历优化提词
                  </h2>
                  <button onClick={() => copyText(job.resume_tips!)}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600">
                    <Copy className="w-3.5 h-3.5" /> 复制
                  </button>
                </div>
                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {job.resume_tips}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-semibold text-slate-800 mb-3">进度跟进笔记</h2>
              <textarea
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="记录面试问题、笔试感受或下一步计划..."
                className="w-full h-32 px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Status */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="text-sm text-slate-500 mb-2">当前进度</h3>
              <StatusBadge status={app.status} className="mb-3" />
              <select
                value={app.status}
                onChange={(e) => handleStatusChange(e.target.value as ApplicationStatus)}
                className="w-full mt-2 px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {STATUS_LIST.map((s) => (
                  <option key={s} value={s}>{STATUS_MAP[s]}</option>
                ))}
              </select>
            </div>

            {/* Reminder */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Clock className="w-4 h-4" />
                提醒设置
              </h3>
              <input
                type="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                onBlur={handleReminderSave}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <p className="text-xs text-slate-400 mt-2">设置后将在概览页提示跟进</p>
            </div>

            {/* Evaluation */}
            {job?.evaluation && (
              <div className="bg-white rounded-2xl border-2 border-emerald-200 shadow-sm p-5">
                <h3 className="flex items-center gap-2 font-semibold text-emerald-700 mb-2 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  评估参考
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{job.evaluation}</p>
              </div>
            )}

            {/* Risk */}
            {job?.risk_notes && (
              <div className="bg-white rounded-2xl border-2 border-amber-200 shadow-sm p-5">
                <h3 className="flex items-center gap-2 font-semibold text-amber-700 mb-2 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  风险提示
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{job.risk_notes}</p>
              </div>
            )}

            {/* Timestamps */}
            <div className="text-xs text-slate-400 space-y-1 px-1">
              <p>导入时间: {new Date(app.imported_at).toLocaleString('zh-CN')}</p>
              <p>最后更新: {new Date(app.updated_at).toLocaleString('zh-CN')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
