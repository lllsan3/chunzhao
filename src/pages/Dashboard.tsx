import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, Loader2, MapPin } from 'lucide-react'
import { useSEO } from '../hooks/useSEO'
import { useApplications } from '../hooks/useApplications'
import { StatusBadge } from '../components/StatusBadge'
import { supabase } from '../lib/supabase'
import { getCached, setCache } from '../lib/queryCache'
import { splitPositions } from '../lib/splitPositions'
import type { ApplicationStatus } from '../lib/constants'

interface JobStats {
  total: number
  soe_count: number
  bigco_count: number
  week_new: number
  top_cities: { city: string; count: number }[]
}

interface DesktopMetricTileProps {
  label: string
  value: ReactNode
  className?: string
  meta?: string
  valueClassName?: string
}

interface CompactMetricCellProps {
  label: string
  value: ReactNode
  className?: string
  valueClassName?: string
}

function DesktopMetricTile({
  label,
  value,
  className = '',
  meta,
  valueClassName = 'text-4xl md:text-5xl font-light text-gray-900 tracking-tight',
}: DesktopMetricTileProps) {
  return (
    <div
      className={`flex min-h-[152px] flex-col justify-end bg-white px-5 py-5 ${className}`}
    >
      {meta ? (
        <p className="mb-auto text-xs tracking-[0.28em] text-gray-400">{meta}</p>
      ) : null}

      <div>
        <div className={valueClassName}>{value}</div>
        <p className="mt-2 text-xs tracking-[0.28em] text-gray-500">{label}</p>
      </div>
    </div>
  )
}

function CompactMetricCell({
  label,
  value,
  className = '',
  valueClassName = 'text-[26px] font-light leading-none tracking-tight text-gray-900',
}: CompactMetricCellProps) {
  return (
    <div className={`flex min-h-[60px] flex-col justify-between bg-white px-2 py-2 ${className}`}>
      <div className={valueClassName}>{value}</div>
      <p className="mt-1.5 text-[9px] leading-3 tracking-[0.14em] text-gray-500">{label}</p>
    </div>
  )
}

function useJobStats() {
  const [stats, setStats] = useState<JobStats | null>(() => {
    const cached = getCached<JobStats>('job_stats', 300_000)
    return cached?.data ?? null
  })

  useEffect(() => {
    const cached = getCached<JobStats>('job_stats', 300_000)
    if (cached?.fresh) return

    supabase.rpc('get_job_stats').then(({ data }) => {
      if (data) {
        setStats(data as JobStats)
        setCache('job_stats', data)
      }
    })
  }, [])

  return stats
}

function getCountdown(): { label: string; days: number } {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const target = month <= 6 ? new Date(year, 5, 30) : new Date(year, 11, 31)

  return {
    label: month <= 6 ? '春招倒计时' : '秋招倒计时',
    days: Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))),
  }
}

function getCompactCity(city: string | null) {
  if (!city) return null

  const compact = city
    .split(/[，,]/)[0]
    ?.split('、')[0]
    ?.trim()

  return compact || null
}

function formatCompactDate(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric',
    day: 'numeric',
  }).format(new Date(value))
}

function formatFullDate(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(new Date(value))
}

export default function Dashboard() {
  useSEO({ title: '进度概览 - 校招助手', path: '/dashboard' })

  const { applications, loading } = useApplications()
  const jobStats = useJobStats()
  const countdown = useMemo(() => getCountdown(), [])

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
      .filter((application) => {
        if (!application.reminder_date) return false

        const reminder = new Date(application.reminder_date)
        return reminder >= now && reminder <= sevenDaysLater
      })
      .sort(
        (left, right) =>
          new Date(left.reminder_date!).getTime() - new Date(right.reminder_date!).getTime()
      )
  }, [applications])

  const recent = useMemo(() => applications.slice(0, 10), [applications])

  const desktopApplicationMetrics: {
    label: string
    status: ApplicationStatus | null
    className: string
    meta?: string
    valueClassName?: string
  }[] = [
    {
      label: '总导入岗位',
      status: null,
      meta: '我的申请池',
      className: 'col-span-5 row-span-2 min-h-[313px]',
      valueClassName: 'text-7xl font-light text-gray-900 tracking-tight',
    },
    { label: '待评估', status: 'pending_review', className: 'col-span-2' },
    { label: '待投递', status: 'to_apply', className: 'col-span-2' },
    { label: '已投递', status: 'applied', className: 'col-span-3' },
    { label: '笔试', status: 'written_test', className: 'col-span-2' },
    { label: '面试', status: 'interview', className: 'col-span-3' },
    { label: '已录用', status: 'offer', className: 'col-span-2' },
    { label: '已拒绝', status: 'rejected', className: 'col-span-3' },
  ]

  const compactApplicationMetrics = [
    { label: '待评估', count: statusCounts.pending_review || 0, value: statusCounts.pending_review || 0 },
    { label: '待投递', count: statusCounts.to_apply || 0, value: statusCounts.to_apply || 0 },
    { label: '已投递', count: statusCounts.applied || 0, value: statusCounts.applied || 0 },
    { label: '笔试', count: statusCounts.written_test || 0, value: statusCounts.written_test || 0 },
    { label: '面试', count: statusCounts.interview || 0, value: statusCounts.interview || 0 },
    { label: '已录用', count: statusCounts.offer || 0, value: statusCounts.offer || 0 },
    { label: '已拒绝', count: statusCounts.rejected || 0, value: statusCounts.rejected || 0 },
    {
      label: countdown.label,
      count: countdown.days,
      alwaysVisible: true,
      value: (
        <div className="flex items-end gap-1">
          <span>{countdown.days}</span>
          <span className="text-sm font-normal text-slate-500">天</span>
        </div>
      ),
      valueClassName: 'flex items-end text-[26px] font-light leading-none tracking-tight text-gray-900',
    },
  ]
  const visibleCompactApplicationMetrics = compactApplicationMetrics.filter(
    (metric) => metric.alwaysVisible || metric.count > 0
  )

  const compactJobMetrics = jobStats
    ? [
        { label: '职位总量', value: jobStats.total.toLocaleString('zh-CN') },
        { label: '央国企岗位', value: jobStats.soe_count.toLocaleString('zh-CN') },
        { label: '大厂岗位', value: jobStats.bigco_count.toLocaleString('zh-CN') },
        { label: '本周新增', value: jobStats.week_new.toLocaleString('zh-CN') },
      ]
    : []

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9F9F6] text-slate-500">
        <div className="text-center">
          <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin" />
          正在生成进度概览...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9F9F6]">
      <div className="mx-auto max-w-6xl px-3 py-4 md:px-4 md:py-8">
        <section className="mb-4 md:mb-6">
          <p className="text-[10px] tracking-[0.28em] text-slate-400 md:text-xs">个人进度</p>
          <div className="mt-1 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="font-serif text-[28px] font-semibold tracking-tight text-slate-900 md:text-4xl">
                进度概览
              </h1>
              <p className="mt-1 max-w-[320px] text-[11px] leading-5 text-slate-500 md:max-w-none md:text-sm md:leading-6">
                手机端先看进度脉络，再把桌面端展开成一页干净的投递报表。
              </p>
            </div>
            <p className="hidden text-[11px] text-slate-500 md:block md:text-sm">
              最近 7 天提醒 {reminders.length} 条
            </p>
          </div>
        </section>

        <section className="md:hidden">
          <div className="overflow-hidden border border-gray-200 bg-white px-3 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] tracking-[0.28em] text-slate-400">我的申请池</p>
                <div className="mt-2.5 flex items-end gap-2">
                  <span className="text-[44px] font-light leading-none tracking-tight text-slate-900">
                    {applications.length.toLocaleString('zh-CN')}
                  </span>
                  <span className="pb-1 text-[10px] tracking-[0.2em] text-slate-500">
                    总导入岗位
                  </span>
                </div>
              </div>

              <div className="shrink-0 border-l border-gray-200 pl-3 text-right">
                <p className="text-[10px] tracking-[0.24em] text-slate-400">最近 7 天</p>
                <p className="mt-1.5 text-[30px] font-light leading-none tracking-tight text-slate-900">
                  {reminders.length}
                </p>
                <p className="mt-1 text-[10px] tracking-[0.24em] text-slate-500">提醒</p>
              </div>
            </div>
          </div>

          <div className="-mt-px overflow-hidden border border-t-0 border-gray-200 bg-gray-200">
            <div className={`grid gap-px ${visibleCompactApplicationMetrics.length <= 6 ? 'grid-cols-3' : 'grid-cols-4'}`}>
              {visibleCompactApplicationMetrics.map((metric) => (
                <CompactMetricCell
                  key={metric.label}
                  label={metric.label}
                  value={metric.value}
                  valueClassName={metric.valueClassName}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="hidden space-y-4 md:block">
          <div className="overflow-hidden border border-gray-200 bg-gray-200">
            <div className="grid grid-cols-12 gap-px">
              {desktopApplicationMetrics.map((metric) => {
                const value =
                  metric.status === null
                    ? applications.length.toLocaleString('zh-CN')
                    : (statusCounts[metric.status] || 0).toLocaleString('zh-CN')

                return (
                  <DesktopMetricTile
                    key={metric.label}
                    label={metric.label}
                    value={value}
                    meta={metric.meta}
                    className={metric.className}
                    valueClassName={metric.valueClassName}
                  />
                )
              })}
            </div>
          </div>
        </section>

        {jobStats ? (
          <section className="mt-6 hidden space-y-4 md:block">
            <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs tracking-[0.28em] text-slate-400">职位市场</p>
                <h2 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-slate-900">
                  职位库快照
                </h2>
              </div>
              <p className="text-sm text-slate-500">把供给、节奏和热门城市收进同一张报表里。</p>
            </div>

            <div className="overflow-hidden border border-gray-200 bg-gray-200">
              <div className="grid grid-cols-12 gap-px">
                <DesktopMetricTile
                  label="职位库总量"
                  value={jobStats.total.toLocaleString('zh-CN')}
                  meta="公开岗位"
                  className="col-span-3"
                />
                <DesktopMetricTile
                  label="央国企岗位"
                  value={jobStats.soe_count.toLocaleString('zh-CN')}
                  className="col-span-2"
                />
                <DesktopMetricTile
                  label="大厂岗位"
                  value={jobStats.bigco_count.toLocaleString('zh-CN')}
                  className="col-span-2"
                />
                <DesktopMetricTile
                  label="本周新增"
                  value={jobStats.week_new.toLocaleString('zh-CN')}
                  className="col-span-2"
                />
                <DesktopMetricTile
                  label={countdown.label}
                  value={
                    <div className="flex items-end gap-1">
                      <span>{countdown.days}</span>
                      <span className="mb-1 text-2xl font-normal text-slate-500">天</span>
                    </div>
                  }
                  className="col-span-3"
                />
              </div>
            </div>

            <div className="border border-gray-200 bg-white px-5 py-5">
              <div className="flex items-center gap-1.5 text-xs tracking-[0.28em] text-slate-400">
                <MapPin className="h-3.5 w-3.5" />
                热门城市分布
              </div>

              <div className="mt-4 space-y-4">
                {jobStats.top_cities.map((city, index) => {
                  const maxCount = jobStats.top_cities[0]?.count || 1
                  const width = Math.max(12, Math.round((city.count / maxCount) * 100))

                  return (
                    <div
                      key={city.city}
                      className="grid grid-cols-[72px_minmax(0,1fr)_72px] items-center gap-3 text-xs"
                    >
                      <span className="truncate text-slate-500">{city.city}</span>
                      <div className="h-1.5 overflow-hidden bg-slate-100">
                        <div
                          className={`h-full ${
                            index === 0 ? 'bg-slate-900' : index < 3 ? 'bg-slate-500' : 'bg-slate-300'
                          }`}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                      <span className="text-right text-slate-500">
                        {city.count.toLocaleString('zh-CN')}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        ) : null}

        {applications.length === 0 ? (
          <section className="mt-4 border border-gray-200 bg-white px-4 py-7 md:mt-6 md:px-8 md:py-12">
            <p className="text-base font-medium text-slate-900">你的申请池还是空的。</p>
            <p className="mt-2 text-sm text-slate-500">
              先去职位库导入几条岗位，这一页会自动长成你的投递报表。
            </p>
            <Link
              to="/jobs"
              className="mt-5 inline-flex items-center justify-center bg-black px-6 py-3 text-sm font-bold tracking-[0.16em] text-white transition-colors hover:bg-gray-800"
            >
              去职位库看看
            </Link>
          </section>
        ) : (
          <section className="mt-4 grid grid-cols-1 gap-3 md:mt-6 md:gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.7fr)]">
            <div className="border border-gray-200 bg-white">
              <div className="border-b border-gray-200 px-3 py-2.5 md:px-5 md:py-4">
                <p className="text-[10px] tracking-[0.28em] text-slate-400 md:text-xs">提醒</p>
                <h2 className="mt-1 text-sm font-medium text-slate-900 md:text-base">近期提醒</h2>
              </div>

              <div className="px-3 md:px-5">
                {reminders.length === 0 ? (
                  <div className="py-5 text-sm text-slate-500">未来 7 天暂时无提醒。</div>
                ) : (
                  reminders.map((application) => {
                    const positions = splitPositions(application.title)

                    return (
                      <Link
                        key={application.id}
                        to={`/applications/${application.id}`}
                        className="block border-b border-gray-200 py-2.5 last:border-b-0 md:py-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-900">
                              {application.company}
                            </p>

                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {positions.slice(0, 2).map((position) => (
                                <span
                                  key={position}
                                  className="rounded-sm bg-gray-100 px-2 py-1 text-[10px] text-gray-700 md:text-xs"
                                >
                                  {position}
                                </span>
                              ))}
                              {positions.length > 2 ? (
                                <span className="px-1 py-1 text-[10px] text-gray-400 md:text-xs">
                                  +{positions.length - 2}
                                </span>
                              ) : null}
                            </div>

                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 md:text-xs">
                              <span className="inline-flex items-center gap-1">
                                <CalendarClock className="h-3 w-3" />
                                {application.reminder_date
                                  ? formatFullDate(application.reminder_date)
                                  : '待安排'}
                              </span>

                              {application.reminder_note ? (
                                <>
                                  <span className="text-slate-300">·</span>
                                  <span className="line-clamp-1">{application.reminder_note}</span>
                                </>
                              ) : null}
                            </div>
                          </div>

                          <span className="shrink-0 text-[10px] tracking-[0.28em] text-slate-400 md:text-xs">
                            提醒
                          </span>
                        </div>
                      </Link>
                    )
                  })
                )}
              </div>
            </div>

            <div className="border border-gray-200 bg-white">
              <div className="border-b border-gray-200 px-3 py-2.5 md:px-5 md:py-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[10px] tracking-[0.28em] text-slate-400 md:text-xs">
                      申请记录
                    </p>
                    <h2 className="mt-1 text-sm font-medium text-slate-900 md:text-base">
                      最近申请记录
                    </h2>
                  </div>
                  <span className="text-[11px] text-slate-500 md:text-sm">{recent.length} 条</span>
                </div>
              </div>

              <div className="hidden border-b border-gray-200 px-5 py-3 md:grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.5fr)_auto_auto] md:items-center md:gap-4">
                <span className="text-[10px] tracking-[0.28em] text-slate-400">公司</span>
                <span className="text-[10px] tracking-[0.28em] text-slate-400">岗位标签</span>
                <span className="text-[10px] tracking-[0.28em] text-slate-400">状态</span>
                <span className="text-[10px] tracking-[0.28em] text-slate-400">导入时间</span>
              </div>

              <div className="px-3 md:px-5">
                {recent.map((application) => {
                  const positions = splitPositions(application.title)
                  const city = getCompactCity(application.city)

                  return (
                    <Link
                      key={application.id}
                      to={`/applications/${application.id}`}
                      className="block border-b border-gray-200 py-2.5 last:border-b-0 md:py-4"
                    >
                      <div className="space-y-1.5 md:grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.5fr)_auto_auto] md:items-center md:gap-4 md:space-y-0">
                        <div className="flex items-start justify-between gap-3 md:block">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900 transition-colors hover:text-slate-700 md:text-[15px]">
                              {application.company}
                            </p>

                            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 md:text-xs">
                              {city ? <span>{city}</span> : null}
                              {city ? <span className="text-slate-300">·</span> : null}
                              <span className="md:hidden">{formatCompactDate(application.imported_at)}</span>
                            </div>
                          </div>

                          <StatusBadge
                            status={application.status}
                            className="shrink-0 px-2 py-1 text-[10px] md:hidden"
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap gap-1">
                            {positions.slice(0, 2).map((position) => (
                              <span
                                key={position}
                                className="rounded-sm bg-gray-100 px-2 py-1 text-[10px] text-gray-700 md:text-xs"
                              >
                                {position}
                              </span>
                            ))}
                            {positions.length > 2 ? (
                              <span className="px-1 py-1 text-[10px] text-gray-400 md:text-xs">
                                +{positions.length - 2}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div className="hidden md:flex md:justify-start">
                          <StatusBadge status={application.status} className="px-2 py-1 text-[10px]" />
                        </div>

                        <div className="hidden text-right text-xs text-slate-500 md:block">
                          {formatFullDate(application.imported_at)}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {jobStats ? (
          <section className="mt-4 space-y-3 md:hidden">
            <div className="border border-gray-200 bg-white px-3 py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] tracking-[0.28em] text-slate-400">职位市场</p>
                  <h2 className="mt-1 text-base font-medium text-slate-900">职位库快照</h2>
                </div>
                <p className="max-w-[120px] text-right text-[11px] leading-5 text-slate-500">
                  用一张更薄的报表看供给、节奏和热度。
                </p>
              </div>

              <div className="mt-3 border-t border-gray-200">
                {compactJobMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="flex items-center justify-between gap-3 border-b border-gray-200 py-2 last:border-b-0"
                  >
                    <span className="text-[11px] text-slate-500">{metric.label}</span>
                    <span className="text-base font-light tracking-tight text-slate-900">
                      {metric.value}
                    </span>
                  </div>
                ))}

                <div className="flex items-center justify-between gap-3 border-b border-gray-200 py-2">
                  <span className="text-[11px] text-slate-500">{countdown.label}</span>
                  <span className="text-base font-light tracking-tight text-slate-900">
                    {countdown.days} 天
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-1.5 text-[10px] tracking-[0.28em] text-slate-400">
                  <MapPin className="h-3.5 w-3.5" />
                  热门城市
                </div>

                <div className="mt-3 space-y-2.5">
                  {jobStats.top_cities.slice(0, 4).map((city, index) => {
                    const maxCount = jobStats.top_cities[0]?.count || 1
                    const width = Math.max(12, Math.round((city.count / maxCount) * 100))

                    return (
                      <div
                        key={city.city}
                        className="grid grid-cols-[44px_minmax(0,1fr)_48px] items-center gap-2 text-[11px]"
                      >
                        <span className="truncate text-slate-500">{city.city}</span>
                        <div className="h-1.5 overflow-hidden bg-slate-100">
                          <div
                            className={`h-full ${
                              index === 0 ? 'bg-slate-900' : index < 3 ? 'bg-slate-500' : 'bg-slate-300'
                            }`}
                            style={{ width: `${width}%` }}
                          />
                        </div>
                        <span className="text-right text-slate-500">
                          {city.count.toLocaleString('zh-CN')}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}
