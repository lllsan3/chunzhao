import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Kanban, Clock, CheckCircle, Users, AlertTriangle, FileText } from 'lucide-react'
import { useApplications } from '../hooks/useApplications'
import { StatusBadge } from '../components/StatusBadge'

export default function Dashboard() {
  const { applications, loading } = useApplications()

  const stats = useMemo(() => {
    const now = new Date()
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    return {
      total: applications.length,
      toApply: applications.filter((a) => a.status === 'to_apply').length,
      applied: applications.filter((a) => a.status === 'applied').length,
      interview: applications.filter((a) => a.status === 'interview').length,
      nearDeadline: applications.filter((a) => {
        if (!a.deadline) return false
        // Try to parse deadline as date
        const d = parseDeadline(a.deadline)
        return d && d >= now && d <= sevenDaysLater
      }).length,
      needFollowUp: applications.filter((a) => {
        const updated = new Date(a.updated_at)
        return (
          updated < sevenDaysAgo &&
          !['offer', 'rejected', 'abandoned'].includes(a.status)
        )
      }).length,
    }
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

  const statCards = [
    { label: '总导入职位', value: stats.total, icon: Kanban, color: 'text-blue-600 bg-blue-50' },
    { label: '待投递', value: stats.toApply, icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { label: '已投递', value: stats.applied, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
    { label: '面试中', value: stats.interview, icon: Users, color: 'text-violet-600 bg-violet-50' },
    { label: '临近截止', value: stats.nearDeadline, icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
    { label: '需要跟进', value: stats.needFollowUp, icon: FileText, color: 'text-amber-600 bg-amber-50' },
  ]

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-slate-800">进度概览</h1>
        <p className="text-sm text-slate-500 mt-1 mb-6">快速了解你的春招申请状态</p>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">{card.label}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.color}`}>
                  <card.icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800">{card.value}</p>
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

function parseDeadline(deadline: string): Date | null {
  // Try YYYY.MM.DD or YYYY-MM-DD
  const match = deadline.match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/)
  if (!match) return null
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}
