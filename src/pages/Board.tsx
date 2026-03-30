import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { MapPin, Clock, Search } from 'lucide-react'
import { useApplications, type Application } from '../hooks/useApplications'
import { STATUS_MAP, STATUS_LIST, STATUS_COLORS } from '../lib/constants'
import type { ApplicationStatus } from '../lib/constants'
import { useToast } from '../components/Toast'

export default function Board() {
  const { applications, loading, updateStatus } = useApplications()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [mobileTab, setMobileTab] = useState<ApplicationStatus>('pending_review')

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
    if (error) toast('error', '更新失败')
  }

  if (loading) return <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center text-slate-400">加载中...</div>

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <div className="max-w-full mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">申请看板</h1>
            <p className="text-sm text-slate-500 mt-1">拖拽卡片更新进度，左右滑动查看更多</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索公司或职位..."
              className="pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm bg-white w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Desktop: kanban columns */}
        <div className="hidden md:block">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="flex gap-3 overflow-x-auto pb-4">
              {STATUS_LIST.map((status) => (
                <KanbanColumn key={status} status={status} items={grouped[status]} />
              ))}
            </div>
          </DndContext>
        </div>

        {/* Mobile: tab switcher */}
        <div className="md:hidden">
          <div className="flex gap-1 overflow-x-auto pb-3 mb-4">
            {STATUS_LIST.map((status) => {
              const active = mobileTab === status
              const colors = STATUS_COLORS[status]
              return (
                <button
                  key={status}
                  onClick={() => setMobileTab(status)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    active ? `${colors.bg} ${colors.text}` : 'bg-white text-slate-500 border border-slate-200'
                  }`}
                >
                  {STATUS_MAP[status]} {grouped[status].length > 0 && `(${grouped[status].length})`}
                </button>
              )
            })}
          </div>
          <div className="space-y-3">
            {grouped[mobileTab].length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">暂无岗位</div>
            ) : (
              grouped[mobileTab].map((app) => (
                <MobileCard key={app.id} app={app} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function KanbanColumn({ status, items }: { status: ApplicationStatus; items: Application[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const colors = STATUS_COLORS[status]

  return (
    <div
      ref={setNodeRef}
      className={`shrink-0 w-56 rounded-2xl p-3 transition-colors ${
        isOver ? 'bg-blue-50' : 'bg-slate-50'
      }`}
    >
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className={`text-sm font-medium ${colors.text}`}>{STATUS_MAP[status]}</span>
        <span className="text-xs text-slate-400">{items.length}</span>
      </div>
      <div className="space-y-2 min-h-[80px]">
        {items.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center text-xs text-slate-400">
            拖拽至此
          </div>
        ) : (
          items.map((app) => <DraggableCard key={app.id} app={app} />)
        )}
      </div>
    </div>
  )
}

function DraggableCard({ app }: { app: Application }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: app.id })
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <Link
        to={`/applications/${app.id}`}
        className="block bg-white rounded-xl border border-slate-100 shadow-sm p-3 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
        onClick={(e) => { if (isDragging) e.preventDefault() }}
      >
        <p className="font-medium text-sm text-slate-800 line-clamp-1">{app.title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{app.company}</p>
        <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
          {app.city && (
            <span className="flex items-center gap-0.5">
              <MapPin className="w-3 h-3" />
              {app.city}
            </span>
          )}
          <span className="flex items-center gap-0.5">
            <Clock className="w-3 h-3" />
            {timeAgo(app.imported_at)}
          </span>
        </div>
      </Link>
    </div>
  )
}

function MobileCard({ app }: { app: Application }) {
  return (
    <Link
      to={`/applications/${app.id}`}
      className="block bg-white rounded-2xl border border-slate-100 shadow-sm p-4"
    >
      <p className="font-medium text-slate-800">{app.title}</p>
      <p className="text-sm text-slate-500 mt-0.5">{app.company}</p>
      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
        {app.city && (
          <span className="flex items-center gap-0.5">
            <MapPin className="w-3 h-3" />
            {app.city}
          </span>
        )}
        <span className="flex items-center gap-0.5">
          <Clock className="w-3 h-3" />
          {timeAgo(app.imported_at)}
        </span>
      </div>
    </Link>
  )
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  return `${days} 天前`
}
