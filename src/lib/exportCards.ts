import type { Application } from '../hooks/useApplications'
import type { ApplicationStatus } from './constants'
import { STATUS_MAP } from './constants'

export type ExportCardType = 'recent-applications' | 'deadline-reminders'
export type ExportAspect = '3:4' | '9:16'

export interface ExportStat {
  label: string
  value: string
}

export interface ExportListItem {
  company: string
  title: string
  status: string
  dateText: string | null
  city: string | null
}

export interface ExportCardData {
  eyebrow: string
  title: string
  subtitle: string
  dateRange: string
  stats: ExportStat[]
  items: ExportListItem[]
  emptyLabel: string
  fileSlug: string
}

export interface BuildExportCardDataParams {
  type: ExportCardType
  applications: Application[]
  reminders: Application[]
  statusCounts: Partial<Record<ApplicationStatus, number>>
  now?: Date
}

export const EXPORT_CARD_TYPE_OPTIONS: {
  value: ExportCardType
  label: string
  description: string
}[] = [
  {
    value: 'recent-applications',
    label: '最近申请记录',
    description: '导出最近一批投递清单和阶段进度。',
  },
  {
    value: 'deadline-reminders',
    label: '截止日提醒',
    description: '导出未来 7 天需要优先处理的提醒。',
  },
]

export const EXPORT_ASPECT_OPTIONS: {
  value: ExportAspect
  label: string
  description: string
}[] = [
  {
    value: '3:4',
    label: '3:4',
    description: '报表版',
  },
  {
    value: '9:16',
    label: '9:16',
    description: '全屏版',
  },
]

export const EXPORT_CARD_DIMENSIONS: Record<ExportAspect, { width: number; height: number }> = {
  '3:4': { width: 900, height: 1200 },
  '9:16': { width: 1080, height: 1920 },
}

function formatRangeDate(value: Date) {
  const month = `${value.getMonth() + 1}`.padStart(2, '0')
  const day = `${value.getDate()}`.padStart(2, '0')
  return `${value.getFullYear()}.${month}.${day}`
}

function formatRangeEndDate(value: Date) {
  const month = `${value.getMonth() + 1}`.padStart(2, '0')
  const day = `${value.getDate()}`.padStart(2, '0')
  return `${month}.${day}`
}

function formatMonthDay(value: string | null) {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric',
    day: 'numeric',
  }).format(date)
}

function compactCity(city: string | null) {
  if (!city) return null

  return city
    .split(/[，,]/)[0]
    ?.split('、')[0]
    ?.trim() || null
}

function getOngoingCount(statusCounts: Partial<Record<ApplicationStatus, number>>) {
  return (
    (statusCounts.pending_review || 0) +
    (statusCounts.to_apply || 0) +
    (statusCounts.applied || 0) +
    (statusCounts.written_test || 0) +
    (statusCounts.interview || 0)
  )
}

function getOfferCount(statusCounts: Partial<Record<ApplicationStatus, number>>) {
  return statusCounts.offer || 0
}

function getWeeklyNewCount(applications: Application[], now: Date) {
  const start = new Date(now)
  start.setDate(start.getDate() - 6)
  start.setHours(0, 0, 0, 0)

  return applications.filter((application) => {
    const importedAt = new Date(application.imported_at)
    return importedAt >= start && importedAt <= now
  }).length
}

function buildRecentApplicationsCard(
  applications: Application[],
  statusCounts: Partial<Record<ApplicationStatus, number>>,
  now: Date
): ExportCardData {
  const start = new Date(now)
  start.setDate(start.getDate() - 6)

  return {
    eyebrow: '申请记录',
    title: '最近申请记录',
    subtitle: '把最近一周的投递节奏收进一张可分享的进度卡。',
    dateRange: `${formatRangeDate(start)} - ${formatRangeEndDate(now)}`,
    stats: [
      { label: '本周新增投递', value: String(getWeeklyNewCount(applications, now)) },
      { label: '进行中流程', value: String(getOngoingCount(statusCounts)) },
      { label: '累计 Offer', value: String(getOfferCount(statusCounts)) },
    ],
    items: applications.slice(0, 10).map((application) => ({
      company: application.company,
      title: application.title,
      status: STATUS_MAP[application.status],
      dateText: formatMonthDay(application.imported_at)
        ? `导入 ${formatMonthDay(application.imported_at)}`
        : null,
      city: compactCity(application.city),
    })),
    emptyLabel: '最近还没有新的申请记录，先去职位库导入几条岗位。',
    fileSlug: '最近申请记录',
  }
}

function buildDeadlineRemindersCard(
  reminders: Application[],
  statusCounts: Partial<Record<ApplicationStatus, number>>,
  now: Date
): ExportCardData {
  const end = new Date(now)
  end.setDate(end.getDate() + 7)

  return {
    eyebrow: '行动清单',
    title: '截止日提醒',
    subtitle: '把未来 7 天需要优先处理的动作收进一张提醒卡。',
    dateRange: `${formatRangeDate(now)} - ${formatRangeEndDate(end)}`,
    stats: [
      { label: '7 日提醒', value: String(reminders.length) },
      { label: '进行中流程', value: String(getOngoingCount(statusCounts)) },
      { label: '累计 Offer', value: String(getOfferCount(statusCounts)) },
    ],
    items: reminders.slice(0, 10).map((application) => ({
      company: application.company,
      title: application.title,
      status: STATUS_MAP[application.status],
      dateText: formatMonthDay(application.reminder_date)
        ? `提醒 ${formatMonthDay(application.reminder_date)}`
        : null,
      city: compactCity(application.city),
    })),
    emptyLabel: '未来 7 天暂时没有提醒，可以把这张卡留给下一轮冲刺。',
    fileSlug: '截止日提醒',
  }
}

export function buildExportCardData({
  type,
  applications,
  reminders,
  statusCounts,
  now = new Date(),
}: BuildExportCardDataParams): ExportCardData {
  if (type === 'deadline-reminders') {
    return buildDeadlineRemindersCard(reminders, statusCounts, now)
  }

  return buildRecentApplicationsCard(applications, statusCounts, now)
}
