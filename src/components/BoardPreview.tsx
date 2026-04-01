import { Link } from 'react-router-dom'
import { LayoutGrid, Kanban } from 'lucide-react'
import { useSEO } from '../hooks/useSEO'

const mockStats = [
  { label: '待评估', count: 3, color: 'bg-amber-400' },
  { label: '笔试', count: 2, color: 'bg-indigo-400' },
  { label: '面试', count: 1, color: 'bg-violet-400' },
  { label: 'Offer', count: 1, color: 'bg-emerald-400' },
]

export default function BoardPreview() {
  useSEO({ title: '我的看板 - 校招助手', path: '/board' })

  return (
    <div className="min-h-screen bg-page">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-tag-bg flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-ink-muted" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink">我的看板</h1>
            <p className="text-xs text-ink-muted">管理每一个岗位的推进状态</p>
          </div>
        </div>

        {/* Preview card */}
        <div className="bg-brand rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-accent-soft font-medium px-2 py-0.5 rounded-full bg-white/10">看板预览</span>
            <span className="text-xs text-white/60 px-2 py-0.5 rounded-full bg-white/10">未登录也可预览</span>
          </div>
          <h2 className="text-lg font-bold text-white mb-4">从网申到 Offer，一目了然</h2>
          <div className="grid grid-cols-4 gap-2">
            {mockStats.map((s) => (
              <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center">
                <div className={`w-2 h-2 rounded-full ${s.color} mx-auto mb-1.5`} />
                <p className="text-xs text-white/60">{s.label}</p>
                <p className="text-xl font-bold text-white">{s.count}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Value proposition */}
        <div className="bg-white rounded-2xl border border-line-light shadow-sm p-6 text-center mb-4">
          <Kanban className="w-10 h-10 text-accent mx-auto mb-3" />
          <h3 className="text-lg font-bold text-ink mb-2">看板帮你追踪每个岗位的投递进度</h3>
          <p className="text-sm text-ink-muted leading-relaxed mb-6">
            从网申、笔试到 Offer，每一步都可视化。下次再也不用翻聊天记录找自己投过哪些公司。
          </p>
          <Link
            to="/login?redirect=/board"
            className="w-full flex items-center justify-center py-3 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-hover transition-colors"
          >
            免费注册，开始管理
          </Link>
          <Link
            to="/login?redirect=/board"
            className="mt-3 block text-sm text-accent hover:text-accent-hover"
          >
            已有账号？直接登录
          </Link>
        </div>
      </div>
    </div>
  )
}
