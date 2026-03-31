import { useState, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSEO } from '../hooks/useSEO'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { MapPin, Search, Plus, X, Loader2, Trash2 } from 'lucide-react'
import { trackFailure, trackSuccess } from '../lib/errorTracker'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { timeAgo } from '../lib/time'
import { useApplications, type Application } from '../hooks/useApplications'
import { useSubscription } from '../hooks/useSubscription'
import { STATUS_MAP, STATUS_LIST, STATUS_COLORS } from '../lib/constants'
import type { ApplicationStatus } from '../lib/constants'
import { useToast } from '../components/Toast'
import { PaywallModal } from '../components/PaywallModal'

export default function Board() {
  useSEO({ title: '我的投递 - 校招助手', path: '/board' })
  const { applications, loading, updateStatus, manualAdd, deleteApplication, isAtFreeLimit } = useApplications()
  const { membership } = useSubscription()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [mobileTab, setMobileTab] = useState<ApplicationStatus | 'all'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const filtered = useMemo(() => {
    if (!search) return applications
    const q = search.toLowerCase()
    return applications.filter(
      (a) => a.title.toLowerCase().includes(q) || a.company.toLowerCase().includes(q)
    )
  }, [applications, search])

  const grouped = useMemo(() => {
    const map: Record<ApplicationStatus, Application[]> = {} as Record<ApplicationStatus, Application[]>
    STATUS_LIST.forEach((s) => (map[s] = []))
    filtered.forEach((a) => {
      if (map[a.status]) map[a.status].push(a)
    })
    return map
  }, [filtered])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return
    const newStatus = over.id as ApplicationStatus
    const appId = active.id as string
    const app = applications.find((a) => a.id === appId)
    if (!app || app.status === newStatus) return

    const { error } = await updateStatus(appId, newStatus)
    if (error) {
      toast('error', trackFailure('drag', '状态没更新成功，再拖一次试试'))
    } else {
      trackSuccess('drag')
      toast('success', '状态已更新，继续加油')
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-page flex items-center justify-center text-ink-muted/70">
      <div className="text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
        看看你的进度怎么样了...
      </div>
    </div>
  )


  return (
    <div className="min-h-screen bg-page">
      <div className="max-w-full mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
          <div>
            {/* Desktop: static title. Mobile: show current tab status + count */}
            <h1 className="text-2xl font-bold text-ink">
              <span className="hidden md:inline">我的投递</span>
              <span className="md:hidden">{mobileTab === 'all' ? `全部（${filtered.length}）` : `${STATUS_MAP[mobileTab]}（${grouped[mobileTab].length}）`}</span>
            </h1>
            <p className="text-sm text-ink-muted mt-1 hidden md:block">拖拽卡片更新进度，左右滑动查看更多</p>
            <p className="text-sm text-ink-muted mt-1 md:hidden">切换状态查看不同阶段的申请</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted/70" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索公司或职位..."
                className="pl-9 pr-3 py-2 rounded-lg border border-line text-sm bg-white w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <button
              onClick={() => {
                if (isAtFreeLimit && !membership.isMember) {
                  setShowPaywall(true)
                } else {
                  setShowAddModal(true)
                }
              }}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand-hover transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              手动添加
            </button>
          </div>
        </div>

        {/* Desktop: kanban columns */}
        <div className="hidden md:block">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="flex gap-2 overflow-x-auto pb-2 board-scroll items-start">
              {STATUS_LIST.map((status) => (
                <KanbanColumn key={status} status={status} items={grouped[status]} onDelete={(app) => setDeleteConfirm({ id: app.id, title: `${app.company} · ${app.title}` })} />
              ))}
            </div>
          </DndContext>
        </div>

        {/* Mobile: overview bar + tab switcher */}
        <div className="md:hidden">
          {/* Status overview bar */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 px-1 py-2.5 mb-3 bg-white rounded-xl border border-line-light">
            {STATUS_LIST.map((status) => {
              const count = grouped[status].length
              const active = mobileTab === status
              return (
                <span
                  key={status}
                  className={`text-[11px] transition-colors ${
                    active ? 'font-semibold text-ink' : 'text-ink-muted/70'
                  }`}
                >
                  {STATUS_MAP[status]}{' '}
                  <span className={`inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-medium ${
                    count > 0
                      ? active ? 'bg-accent text-white' : 'bg-tag-bg text-ink-muted'
                      : 'bg-tag-bg text-line'
                  }`}>
                    {count}
                  </span>
                </span>
              )
            })}
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4">
            <button
              onClick={() => setMobileTab('all')}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                mobileTab === 'all'
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-tag-bg text-ink-muted/70 hover:text-ink-muted'
              }`}
            >
              全部 ({filtered.length})
            </button>
            {STATUS_LIST.map((status) => {
              const active = mobileTab === status
              const colors = STATUS_COLORS[status]
              const count = grouped[status].length
              return (
                <button
                  key={status}
                  onClick={() => setMobileTab(status)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    active
                      ? `${colors.bg} ${colors.text} shadow-sm ring-1 ring-current/20`
                      : 'bg-tag-bg text-ink-muted/70 hover:text-ink-muted'
                  }`}
                >
                  {STATUS_MAP[status]} {count > 0 && `(${count})`}
                </button>
              )
            })}
          </div>
          <div className="space-y-3">
            {(() => {
              const list = mobileTab === 'all' ? filtered : grouped[mobileTab]
              return list.length === 0 ? (
                <div className="text-center py-12 text-ink-muted/70 text-sm">暂无岗位</div>
              ) : (
                list.map((app) => (
                  <MobileCard key={app.id} app={app} onDelete={() => setDeleteConfirm({ id: app.id, title: `${app.company} · ${app.title}` })} />
                ))
              )
            })()}
          </div>
        </div>
      </div>

      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}

      {deleteConfirm && (
        <ConfirmDialog
          title="确定要移除这个岗位吗？"
          subtitle={deleteConfirm.title}
          confirmLabel="确认移除"
          onCancel={() => setDeleteConfirm(null)}
          onConfirm={async () => {
            const { error } = await deleteApplication(deleteConfirm.id)
            if (error) toast('error', '删除失败，请重试')
            else toast('success', '已移除')
            setDeleteConfirm(null)
          }}
        />
      )}

      {/* Add modal */}
      {showAddModal && (
        <ManualAddModal
          onClose={() => setShowAddModal(false)}
          onSubmit={async (fields) => {
            const { error } = await manualAdd(fields)
            if (error) {
              if (error.message?.includes('FREE_LIMIT_REACHED')) {
                setShowPaywall(true)
                return true // close modal
              }
              toast('error', trackFailure('manualAdd', '添加失败了，再试一次'))
              return false
            }
            trackSuccess('manualAdd')
            toast('success', '添加成功，已放入申请池')
            return true
          }}
        />
      )}

      {/* Thin scrollbar styles */}
      <style>{`
        .board-scroll::-webkit-scrollbar { height: 4px; }
        .board-scroll::-webkit-scrollbar-track { background: transparent; }
        .board-scroll::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
        .board-scroll:hover::-webkit-scrollbar-thumb { background: #9ca3af; }
        .board-scroll { scrollbar-width: thin; scrollbar-color: #d1d5db transparent; }
      `}</style>
    </div>
  )
}

function KanbanColumn({ status, items, onDelete }: { status: ApplicationStatus; items: Application[]; onDelete: (app: Application) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const colors = STATUS_COLORS[status]

  return (
    <div
      ref={setNodeRef}
      className={`shrink-0 w-[200px] rounded-xl p-2.5 min-h-[300px] transition-colors ${
        isOver ? 'bg-accent-soft ring-1 ring-accent/30' : colors.bg + '/40'
      }`}
      style={{ backgroundColor: isOver ? undefined : `color-mix(in srgb, ${getColorHex(status)} 8%, #f8fafc)` }}
    >
      <div className="flex items-center gap-1.5 mb-2 px-0.5">
        <span className={`w-2 h-2 rounded-full ${colors.bg.replace('bg-', 'bg-')}`}
          style={{ backgroundColor: getColorHex(status) }} />
        <span className="text-xs font-medium text-ink">{STATUS_MAP[status]}</span>
        {items.length > 0 && (
          <span className="text-[10px] text-ink-muted/70 ml-auto">{items.length}</span>
        )}
      </div>
      <div className="space-y-1.5">
        {items.length === 0 ? (
          <p className="text-[11px] text-line text-center py-6">暂无岗位</p>
        ) : (
          items.map((app) => <DraggableCard key={app.id} app={app} onDelete={() => onDelete(app)} />)
        )}
      </div>
    </div>
  )
}

function DraggableCard({ app, onDelete }: { app: Application; onDelete: () => void }) {
  const navigate = useNavigate()
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: app.id })
  const didDrag = useRef(false)

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  }

  // Track whether a drag actually happened
  if (isDragging) didDrag.current = true

  const handleClick = () => {
    // Only navigate if no drag occurred
    if (didDrag.current) {
      didDrag.current = false
      return
    }
    navigate(`/applications/${app.id}`)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      className="group relative bg-white rounded-lg border border-line-light/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] px-2.5 py-2 hover:shadow-sm transition-shadow cursor-grab active:cursor-grabbing"
    >
      <button
        onClick={(e) => { e.stopPropagation(); onDelete() }}
        className="absolute top-1.5 right-1.5 w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-50 text-ink-muted/70 hover:text-red-500 transition-all"
        title="移除"
      >
        <Trash2 className="w-3 h-3" />
      </button>
      <p className="font-medium text-[13px] text-ink line-clamp-1 pr-4">{app.title}</p>
      <p className="text-[11px] text-ink-muted mt-0.5">{app.company}</p>
      <div className="flex items-center gap-2 mt-1 text-[11px] text-ink-muted/70">
        {app.city && (
          <span className="flex items-center gap-0.5">
            <MapPin className="w-2.5 h-2.5" />
            {app.city}
          </span>
        )}
        {app.updated_at && (
          <span className="ml-auto">{timeAgo(app.updated_at)}</span>
        )}
      </div>
    </div>
  )
}

function MobileCard({ app, onDelete }: { app: Application; onDelete: () => void }) {
  return (
    <div className="relative bg-white rounded-2xl border border-line-light shadow-sm p-4">
      <Link to={`/applications/${app.id}`} className="block">
        <p className="font-medium text-ink pr-6">{app.title}</p>
        <p className="text-sm text-ink-muted mt-0.5">{app.company}</p>
        <div className="flex items-center gap-3 mt-2 text-xs text-ink-muted/70">
          {app.city && (
            <span className="flex items-center gap-0.5">
              <MapPin className="w-3 h-3" />
              {app.city}
            </span>
          )}
          {app.updated_at && (
            <span className="ml-auto">{timeAgo(app.updated_at)}</span>
          )}
        </div>
      </Link>
      <button
        onClick={onDelete}
        className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-ink-muted/70 hover:bg-red-50 hover:text-red-500 transition-colors"
        title="移除"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

function ManualAddModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (fields: { title: string; company: string; city?: string; deadline?: string; jd_url?: string }) => Promise<boolean>
}) {
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [city, setCity] = useState('')
  const [deadline, setDeadline] = useState('')
  const [jdUrl, setJdUrl] = useState('')
  const [urlError, setUrlError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const validateUrl = (val: string) => {
    if (!val) { setUrlError(''); return true }
    try {
      new URL(val)
      setUrlError('')
      return true
    } catch {
      setUrlError('请输入有效的 URL（以 http:// 或 https:// 开头）')
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !company.trim()) return
    if (!validateUrl(jdUrl)) return

    setSubmitting(true)
    const ok = await onSubmit({
      title: title.trim(),
      company: company.trim(),
      city: city.trim() || undefined,
      deadline: deadline.trim() || undefined,
      jd_url: jdUrl.trim() || undefined,
    })
    setSubmitting(false)
    if (ok) onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-ink">手动添加职位</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-tag-bg text-ink-muted/70">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink-muted mb-1">职位名称 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="如：前端开发工程师"
              required
              className="w-full px-3 py-2.5 rounded-xl border border-line text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-muted mb-1">公司 *</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="如：腾讯"
              required
              className="w-full px-3 py-2.5 rounded-xl border border-line text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1">城市</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="如：深圳"
                className="w-full px-3 py-2.5 rounded-xl border border-line text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1">截止日期</label>
              <input
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="如：2026.04.30"
                className="w-full px-3 py-2.5 rounded-xl border border-line text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-muted mb-1">JD 链接</label>
            <input
              type="text"
              value={jdUrl}
              onChange={(e) => { setJdUrl(e.target.value); if (urlError) validateUrl(e.target.value) }}
              onBlur={() => validateUrl(jdUrl)}
              placeholder="https://..."
              className={`w-full px-3 py-2.5 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 ${
                urlError ? 'border-red-300 focus:border-red-500' : 'border-line focus:border-accent'
              }`}
            />
            {urlError && <p className="text-xs text-red-500 mt-1">{urlError}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting || !title.trim() || !company.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {submitting ? '添加中...' : '添加到看板'}
          </button>
        </form>
      </div>
    </div>
  )
}

function getColorHex(status: ApplicationStatus): string {
  const map: Record<ApplicationStatus, string> = {
    pending_review: '#f59e0b',
    to_apply: '#3b82f6',
    applied: '#10b981',
    written_test: '#6366f1',
    interview: '#8b5cf6',
    offer: '#10b981',
    rejected: '#ef4444',
    abandoned: '#94a3b8',
  }
  return map[status]
}
