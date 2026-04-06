import { type ReactNode, useEffect, useRef, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ExternalLink,
  Trash2,
} from 'lucide-react'
import { trackFailure, trackSuccess } from '../lib/errorTracker'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { supabase } from '../lib/supabase'
import { STATUS_MAP, STATUS_LIST } from '../lib/constants'
import type { ApplicationStatus } from '../lib/constants'
import { StatusBadge } from '../components/StatusBadge'
import { useApplications } from '../hooks/useApplications'
import { useToast } from '../components/Toast'
import { CollapsibleTextBlock } from '../components/CollapsibleTextBlock'

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

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export default function ApplicationDetail() {
  const { applicationId } = useParams()
  const [app, setApp] = useState<FullApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState('')
  const [reminderDate, setReminderDate] = useState('')
  const navigate = useNavigate()
  const { updateStatus, updateNotes, updateReminder, deleteApplication } = useApplications()
  const { toast } = useToast()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedNotesRef = useRef('')
  const savedReminderDateRef = useRef('')
  const [loadError, setLoadError] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  useEffect(() => {
    if (!applicationId) return

    supabase
      .from('user_applications')
      .select('*, job:jobs(description, resume_tips, evaluation, risk_notes, company_type, target_graduates, referral_code, tags)')
      .eq('id', applicationId)
      .single()
      .then(({ data, error }) => {
        if (error) {
          setLoadError(true)
        } else if (data) {
          const record = data as FullApplication
          setApp(record)
          setNotes(record.notes || '')
          setReminderDate(record.reminder_date || '')
          savedNotesRef.current = record.notes || ''
          savedReminderDateRef.current = record.reminder_date || ''
        }
        setLoading(false)
      })
  }, [applicationId])

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [])

  const handleStatusChange = async (status: ApplicationStatus) => {
    if (!app) return

    const { error } = await updateStatus(app.id, status)
    if (error) {
      toast('error', trackFailure('status', '状态没更新成功，再拖一次试试'))
    } else {
      trackSuccess('status')
      setApp({ ...app, status })
      toast('success', '状态已更新，继续加油')
    }
  }

  const handleNotesChange = (value: string) => {
    setNotes(value)
    setSaveStatus('saving')

    if (saveTimer.current) clearTimeout(saveTimer.current)

    saveTimer.current = setTimeout(async () => {
      if (!app) return
      if (value === savedNotesRef.current) {
        setSaveStatus('idle')
        return
      }

      const previousNotes = savedNotesRef.current
      const { error } = await updateNotes(app.id, value)
      if (error) {
        setNotes(previousNotes)
        setApp((current) => (current ? { ...current, notes: previousNotes || null } : current))
        setSaveStatus('error')
        trackFailure('notes', '')
      } else {
        savedNotesRef.current = value
        setApp((current) => (current ? { ...current, notes: value || null } : current))
        setSaveStatus('saved')
        trackSuccess('notes')
        setTimeout(() => setSaveStatus('idle'), 2000)
      }
    }, 800)
  }

  const handleReminderSave = async () => {
    if (!app) return
    const { error } = await updateReminder(app.id, reminderDate || null, null)
    if (!error) toast('success', '提醒已设置')
    else toast('error', '提醒设置失败，请重试')
  }

  void handleReminderSave

  const handleReminderBlur = async () => {
    if (!app) return

    const nextReminderDate = reminderDate || ''
    if (nextReminderDate === savedReminderDateRef.current) return

    const previousReminderDate = savedReminderDateRef.current
    const { error } = await updateReminder(app.id, nextReminderDate || null, null)

    if (error) {
      setReminderDate(previousReminderDate)
      setApp((current) =>
        current ? { ...current, reminder_date: previousReminderDate || null } : current
      )
      toast('error', '提醒设置失败，请重试')
      return
    }

    savedReminderDateRef.current = nextReminderDate
    setApp((current) =>
      current ? { ...current, reminder_date: nextReminderDate || null } : current
    )
    toast('success', '提醒已设置')
  }

  const copyText = (text: string) => {
    try {
      navigator.clipboard.writeText(text)
      toast('success', '已复制到剪贴板')
    } catch {
      toast('error', '复制失败，请手动复制')
    }
  }

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

  if (!app) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page px-4 text-gray-500">
        未找到该申请
      </div>
    )
  }

  const job = app.job
  const metaItems = [
    compactMeta(app.city),
    app.deadline ? `截止 ${app.deadline}` : null,
    job?.company_type,
    job?.target_graduates,
  ].filter(Boolean)

  return (
    <div className="min-h-screen bg-page">
      <div className="mx-auto max-w-5xl px-3 py-4 md:px-4 md:py-8">
        <Link
          to="/board"
          className="group inline-flex items-center gap-1 text-sm text-gray-500 underline underline-offset-[6px] decoration-gray-200 transition-all hover:text-black hover:decoration-black"
        >
          <ArrowLeft className="h-4 w-4" />
          返回看板
        </Link>

        <section className="mt-4 border-0 bg-transparent px-0 py-0 shadow-none md:border md:border-gray-200 md:bg-white md:px-7 md:py-7">
          <div className="flex flex-col gap-4 border border-gray-200 bg-white px-3 py-4 md:border-0 md:bg-transparent md:px-0 md:py-0">
            <div className="min-w-0 flex-1">
              <p className="hidden text-[10px] tracking-[0.28em] text-gray-400 md:block md:text-xs">APPLICATION FILE</p>
              <h1 className="font-serif text-[28px] font-semibold leading-tight tracking-tight text-gray-900 md:mt-2 md:text-4xl">
                {app.title}
              </h1>
              <p className="mt-2.5 text-base font-medium text-gray-900 md:mt-3 md:text-lg">
                {app.company}
              </p>
              {metaItems.length > 0 ? (
                <p className="mt-2 text-[11px] leading-5 text-gray-500 md:text-sm md:leading-6">
                  {metaItems.join(' · ')}
                </p>
              ) : null}

              {job?.tags && job.tags.length > 0 ? (
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

              {job?.referral_code ? (
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
              <StatusBadge status={app.status} className="px-2 py-1 text-[10px] md:px-2.5 md:py-1" />
              {app.jd_url ? (
                <a
                  href={app.jd_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1 text-sm text-gray-600 underline underline-offset-[6px] decoration-gray-200 transition-all hover:text-black hover:decoration-black"
                >
                  查看原 JD
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 md:mt-4 md:gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.9fr)] lg:gap-8">
            <div className="space-y-3 md:space-y-4">
              {job?.description ? (
                <DetailPanel eyebrow="DESCRIPTION" title="职位描述">
                  <CollapsibleTextBlock text={job.description} />
                </DetailPanel>
              ) : null}

              {job?.resume_tips ? (
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

              <DetailPanel eyebrow="NOTES" title="进度跟进笔记">
                <div className="flex flex-col gap-1 pb-3 md:flex-row md:items-center md:justify-between">
                  <p className="text-xs text-gray-500">
                    记录面试问题、笔试感受或下一步计划。
                  </p>
                  <span
                    className={`text-[10px] tracking-[0.18em] ${
                      saveStatus === 'saving'
                        ? 'text-gray-500'
                        : saveStatus === 'saved'
                          ? 'text-gray-700'
                          : saveStatus === 'error'
                            ? 'text-red-600'
                            : 'text-transparent'
                    }`}
                  >
                    {saveStatus === 'saving'
                      ? '保存中'
                      : saveStatus === 'saved'
                        ? '已保存'
                        : saveStatus === 'error'
                          ? '保存失败'
                          : '占位'}
                  </span>
                </div>
                <textarea
                  value={notes}
                  onChange={(event) => handleNotesChange(event.target.value)}
                  placeholder="记录这次投递的关键细节..."
                  className="h-32 w-full resize-none border border-gray-200 bg-transparent px-3 py-3 text-sm leading-7 text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-black md:h-36"
                />
              </DetailPanel>
            </div>

            <div className="space-y-3 md:space-y-4 lg:border-l lg:border-gray-200 lg:pl-8">
              <DetailPanel eyebrow="STATUS" title="当前进度">
                <StatusBadge status={app.status} />
                <select
                  value={app.status}
                  onChange={(event) => handleStatusChange(event.target.value as ApplicationStatus)}
                  className="mt-4 w-full border border-gray-200 bg-transparent px-3 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-black"
                >
                  {STATUS_LIST.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_MAP[status]}
                    </option>
                  ))}
                </select>
              </DetailPanel>

              <DetailPanel eyebrow="REMINDER" title="提醒设置">
                <div className="space-y-3">
                  <input
                    type="date"
                    value={reminderDate}
                    onChange={(event) => setReminderDate(event.target.value)}
                    onBlur={handleReminderBlur}
                    className="w-full border border-gray-200 bg-transparent px-3 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-black"
                  />
                  <p className="text-xs leading-5 text-gray-500">
                    设置后，这条记录会在概览页的近期提醒里出现。
                  </p>
                </div>
              </DetailPanel>

              {job?.evaluation ? (
                <DetailPanel eyebrow="EVALUATION" title="评估参考">
                  <CollapsibleTextBlock text={job.evaluation} />
                </DetailPanel>
              ) : null}

              {job?.risk_notes ? (
                <DetailPanel eyebrow="RISK NOTES" title="风险提示">
                  <CollapsibleTextBlock text={job.risk_notes} />
                </DetailPanel>
              ) : null}

              <DetailPanel eyebrow="TIMELINE" title="时间记录">
                <div className="space-y-2 text-sm leading-6 text-gray-600">
                  <p>导入时间 · {formatDateTime(app.imported_at)}</p>
                  <p>最后更新 · {formatDateTime(app.updated_at)}</p>
                </div>
              </DetailPanel>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex w-full items-center justify-center gap-2 border border-gray-200 px-4 py-2.5 text-sm text-gray-600 transition-colors hover:border-red-300 hover:text-red-600 md:py-3"
              >
                <Trash2 className="h-4 w-4" />
                移除此岗位
              </button>
            </div>
          </div>
        </section>
      </div>

      {showDeleteConfirm ? (
        <ConfirmDialog
          title="确定要移除这个岗位吗？"
          confirmLabel="确认移除"
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={async () => {
            const { error } = await deleteApplication(app.id)
            setShowDeleteConfirm(false)
            if (error) toast('error', '删除失败，请重试')
            else {
              toast('success', '已移除')
              navigate('/board')
            }
          }}
        />
      ) : null}
    </div>
  )
}
