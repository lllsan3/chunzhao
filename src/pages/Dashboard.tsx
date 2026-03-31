import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Kanban, Clock, Users, FileText, Send, PenLine, Award, XCircle, LogIn } from 'lucide-react'
import { useApplications } from '../hooks/useApplications'
import { useAuth } from '../hooks/useAuth'
import { StatusBadge } from '../components/StatusBadge'
import type { ApplicationStatus } from '../lib/constants'

export default function Dashboard() {
  const { user } = useAuth()
  const { applications, loading } = useApplications()

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const app of applications) {
      counts[app.status] = (counts[app.status] || 0) + 1
    }
    return counts
  }, [applications])

  const reminders = useMemo(() => {
    const now = new Date()
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    return applications
      .filter((a) => {
        if (!a.reminder_date) return false
        const d = new Date(a.reminder_date)
        return d >= now && d <= sevenDaysLater
      })
      .sort((a, b) => new Date(a.reminder_date!).getTime() - new Date(b.reminder_date!).getTime())
  }, [applications])

  const recent = useMemo(
    () => applications.slice(0, 10),
    [applications]
  )

  if (loading) return <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center text-slate-400">加载中...</div>

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <div className="text-center">
          <LogIn className="w-10 h-10 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 mb-4">请先登录以查看你的申请进度</p>
          <Link to="/login?redirect=/dashboard" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800">
            去登录
          </Link>
        </div>
      </div>
    )
  }

  const statCards: { label: string; status: ApplicationStatus | null; icon: typeof Kanban; color: string }[] = [
    { label: '总导入职位', status: null, icon: Kanban, color: 'text-blue-600 bg-blue-50' },
    { label: '待评估', status: 'pending_review', icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { label: '待投递', status: 'to_apply', icon: FileText, color: 'text-sky-600 bg-sky-50' },
    { label: '已投递', status: 'applied', icon: Send, color: 'text-emerald-600 bg-emerald-50' },
    { label: '笔试', status: 'written_test', icon: PenLine, color: 'text-indigo-600 bg-indigo-50' },
    { label: '面试', status: 'interview', icon: Users, color: 'text-violet-600 bg-violet-50' },
    { label: '已发Offer', status: 'offer', icon: Award, color: 'text-emerald-600 bg-emerald-50' },
    { label: '已拒绝', status: 'rejected', icon: XCircle, color: 'text-red-600 bg-red-50' },
  ]

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-slate-800">进度概览</h1>
        <p className="text-sm text-slate-500 mt-1 mb-6">快速了解你的春招申请状态</p>

        {/* Stats grid — 2 cols mobile, 4 cols desktop, 8 cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">{card.label}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.color}`}>
                  <card.icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800">
                {card.status === null ? applications.length : (statusCounts[card.status] || 0)}
              </p>
            </div>
          ))}
        </div>

        {applications.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <p className="text-slate-400 mb-4">暂无数据，快去职位库导入机会吧</p>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800"
            >
              去职位库看看
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Reminders */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="font-semibold text-slate-800 mb-3">近期提醒</h2>
              {reminders.length === 0 ? (
                <p className="text-sm text-slate-400">暂无近期提醒</p>
              ) : (
                <div className="space-y-3">
                  {reminders.map((app) => (
                    <Link
                      key={app.id}
                      to={`/applications/${app.id}`}
                      className="block p-3 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors"
                    >
                      <p className="text-sm font-medium text-slate-800">{app.title}</p>
                      <p className="text-xs text-slate-500">{app.company} · {app.reminder_date}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Recent */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="font-semibold text-slate-800 mb-3">最近申请记录</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                      <th className="pb-2 pr-4">公司</th>
                      <th className="pb-2 pr-4">职位</th>
                      <th className="pb-2 pr-4">状态</th>
                      <th className="pb-2">导入时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((app) => (
                      <tr key={app.id} className="border-b border-slate-50 last:border-0">
                        <td className="py-2.5 pr-4 text-slate-700">{app.company}</td>
                        <td className="py-2.5 pr-4">
                          <Link to={`/applications/${app.id}`} className="text-blue-600 hover:text-blue-700">
                            {app.title}
                          </Link>
                        </td>
                        <td className="py-2.5 pr-4">
                          <StatusBadge status={app.status} />
                        </td>
                        <td className="py-2.5 text-slate-400 text-xs">
                          {new Date(app.imported_at).toLocaleDateString('zh-CN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
