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
import { Search, Plus, X, Loader2, Trash2 } from 'lucide-react'
import { trackFailure, trackSuccess } from '../lib/errorTracker'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { timeAgo } from '../lib/time'
import { useApplications, type Application } from '../hooks/useApplications'
import { useSubscription } from '../hooks/useSubscription'
import { STATUS_MAP, STATUS_LIST } from '../lib/constants'
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
    <div className="min-h-screen bg-[#F9F9F6] flex items-center justify-center text-slate-400">
      <div className="text-center">
        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
        <p className="text-sm">加载中...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F9F9F6]">
      <div className="max-w-full mx-auto px-4 md:px-6 py-4 md:py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold text-slate-900 tracking-tight">
              <span className="hidden md:inline">我的投递</span>
              <span className="md:hidden">{mobileTab === 'all' ? `全部（${filtered.length}）` : `${STATUS_MAP[mobileTab]}（${grouped[mobileTab].length}）`}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 hidden md:block">拖拽卡片更新进度</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索..."
                className="pl-8 pr-3 h-9 md:h-10 rounded-md border border-gray-200 text-sm bg-white w-36 sm:w-48 focus:outline-none focus:ring-1 focus:ring-slate-300 focus:border-slate-300"
              />
            </div>
            <button
              onClick={() => {
                if (isAtFreeLimit && !membership.isMember) setShowPaywall(true)
                else setShowAddModal(true)
              }}
              className="inline-flex items-center gap-1 px-3 h-9 md:h-10 rounded-md text-sm font-medium text-slate-600 border border-slate-300 bg-transparent hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">手动添加</span>
            </button>
          </div>
        </div>

        {/* ═══ Desktop: Editorial Kanban ═══ */}
        <div className="hidden md:block">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="flex overflow-x-auto pb-2 board-scroll items-start">
              {STATUS_LIST.map((status, i) => (
                <KanbanColumn
                  key={status}
                  status={status}
                  items={grouped[status]}
                  isLast={i === STATUS_LIST.length - 1}
                  onDelete={(app) => setDeleteConfirm({ id: app.id, title: `${app.company} · ${app.title}` })}
                />
              ))}
            </div>
          </DndContext>
        </div>

        {/* ═══ Mobile: Editorial text tabs + compact cards ═══ */}
        <div className="md:hidden">
          {/* Text-flow tabs — no pills, no bg blocks */}
          <div className="flex overflow-x-auto whitespace-nowrap gap-5 pb-2 mb-3 border-b border-gray-200">
            <button
              onClick={() => setMobileTab('all')}
              className={`shrink-0 pb-2 text-sm transition-colors ${
                mobileTab === 'all'
                  ? 'text-slate-900 font-medium border-b-2 border-slate-900 -mb-px'
                  : 'text-slate-400'
              }`}
            >
              全部 {filtered.length}
            </button>
            {STATUS_LIST.map((status) => {
              const active = mobileTab === status
              const count = grouped[status].length
              return (
                <button
                  key={status}
                  onClick={() => setMobileTab(status)}
                  className={`shrink-0 pb-2 text-sm transition-colors ${
                    active
                      ? 'text-slate-900 font-medium border-b-2 border-slate-900 -mb-px'
                      : 'text-slate-400'
                  }`}
                >
                  {STATUS_MAP[status]} {count > 0 && count}
                </button>
              )
            })}
          </div>

          {/* Compact card list */}
          <div className="space-y-1.5">
            {(() => {
              const list = mobileTab === 'all' ? filtered : grouped[mobileTab]
              return list.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">暂无岗位</div>
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

      {showAddModal && (
        <ManualAddModal
          onClose={() => setShowAddModal(false)}
          onSubmit={async (fields) => {
            const { error } = await manualAdd(fields)
            if (error) {
              if (error.message?.includes('FREE_LIMIT_REACHED')) {
                setShowPaywall(true)
                return true
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

/* ═══════════ Desktop: Editorial Kanban Column ═══════════ */

function KanbanColumn({ status, items, isLast, onDelete }: {
  status: ApplicationStatus; items: Application[]; isLast: boolean; onDelete: (app: Application) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      className={`shrink-0 w-[200px] min-h-[300px] px-2 pt-2 pb-4 transition-colors ${
        !isLast ? 'border-r border-gray-200' : ''
      } ${isOver ? 'bg-slate-100/60' : ''}`}
    >
      {/* Column header — minimal text */}
      <div className="flex items-center gap-1.5 mb-3 px-0.5">
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getColorHex(status) }} />
        <span className="text-xs font-medium text-slate-700">{STATUS_MAP[status]}</span>
        {items.length > 0 && (
          <span className="text-[10px] text-slate-400 ml-auto">{items.length}</span>
        )}
      </div>
      <div className="space-y-1.5">
        {items.length === 0 ? (
          <p className="text-[10px] text-slate-300 text-center py-6">拖到此处</p>
        ) : (
          items.map((app) => <DraggableCard key={app.id} app={app} onDelete={() => onDelete(app)} />)
        )}
      </div>
    </div>
  )
}

/* ═══════════ Desktop: Draggable Card ═══════════ */

function DraggableCard({ app, onDelete }: { app: Application; onDelete: () => void }) {
  const navigate = useNavigate()
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: app.id })
  const didDrag = useRef(false)

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  }

  if (isDragging) didDrag.current = true

  const handleClick = () => {
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
      className="group relative bg-white rounded-md border border-gray-200 shadow-none px-2.5 py-2 cursor-grab active:cursor-grabbing hover:border-gray-300 transition-colors"
    >
      <button
        onClick={(e) => { e.stopPropagation(); onDelete() }}
        className="absolute top-1.5 right-1.5 w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
        title="移除"
      >
        <Trash2 className="w-3 h-3" />
      </button>
      <p className="font-medium text-[13px] text-slate-900 line-clamp-1 pr-4">{app.company}</p>
      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{app.title}</p>
      <div className="flex items-center mt-1 text-[10px] text-slate-400">
        {app.city && <span>{app.city.split(',')[0].split('、')[0]}</span>}
        {app.city && app.updated_at && <span className="text-slate-300 mx-1">·</span>}
        {app.updated_at && <span className="ml-auto">{timeAgo(app.updated_at)}</span>}
      </div>
    </div>
  )
}

/* ═══════════ Mobile: Compact Card ═══════════ */

function MobileCard({ app, onDelete }: { app: Application; onDelete: () => void }) {
  const positions = app.title.split(/[,，;；、/]+/).map(s => s.trim()).filter(s => s.length >= 2 && s.length <= 20)

  return (
    <div className="relative bg-white rounded-md border border-gray-200 shadow-none px-3 py-2.5">
      {/* Delete button */}
      <button
        onClick={onDelete}
        className="absolute top-2.5 right-2.5 w-6 h-6 rounded flex items-center justify-center text-slate-300 active:text-red-500 transition-colors"
      >
        <Trash2 className="w-3 h-3" />
      </button>

      <Link to={`/applications/${app.id}`} className="block pr-7">
        {/* Company — anchor */}
        <p className="text-sm font-semibold text-slate-900 tracking-tight line-clamp-1">{app.company}</p>

        {/* Position chips */}
        <div className="flex flex-wrap items-center gap-1 mt-1">
          {positions.slice(0, 2).map((pos) => (
            <span key={pos} className="bg-gray-100/80 px-1.5 py-0.5 rounded-sm text-[10px] leading-tight text-gray-700">{pos}</span>
          ))}
          {positions.length > 2 && (
            <span className="text-[10px] text-gray-400">+{positions.length - 2}</span>
          )}
        </div>

        {/* Metadata — middot delimited */}
        <div className="flex items-center mt-1.5 text-[10px] text-slate-500 leading-none">
          {app.city && <span>{app.city.split(',')[0].split('、')[0]}</span>}
          {app.city && app.updated_at && <span className="text-slate-300 mx-1">·</span>}
          {app.updated_at && <span>{timeAgo(app.updated_at)}</span>}
        </div>
      </Link>
    </div>
  )
}

/* ═══════════ Manual Add Modal ═══════════ */

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
      setUrlError('请输入有效的 URL')
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
      <div className="relative bg-white rounded-md shadow-xl w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">手动添加</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">职位名称 *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="如：前端开发工程师" required
              className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-slate-300" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">公司 *</label>
            <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="如：腾讯" required
              className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-slate-300" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-500 mb-1">城市</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="深圳"
                className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-slate-300" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">截止日期</label>
              <input type="text" value={deadline} onChange={(e) => setDeadline(e.target.value)} placeholder="2026.04.30"
                className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-slate-300" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">JD 链接</label>
            <input type="text" value={jdUrl}
              onChange={(e) => { setJdUrl(e.target.value); if (urlError) validateUrl(e.target.value) }}
              onBlur={() => validateUrl(jdUrl)} placeholder="https://..."
              className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-1 ${urlError ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-slate-300'}`} />
            {urlError && <p className="text-xs text-red-500 mt-1">{urlError}</p>}
          </div>
          <button type="submit" disabled={submitting || !title.trim() || !company.trim()}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-md text-sm font-medium text-slate-600 border border-slate-300 hover:bg-slate-900 hover:text-white hover:border-slate-900 disabled:opacity-40 transition-colors">
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
