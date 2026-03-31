export const STATUS_MAP = {
  pending_review: '待评估',
  to_apply: '待投递',
  applied: '已投递',
  written_test: '笔试',
  interview: '面试',
  offer: '已发Offer',
  rejected: '已拒绝',
  abandoned: '已放弃',
} as const

export type ApplicationStatus = keyof typeof STATUS_MAP

export const STATUS_LIST: ApplicationStatus[] = [
  'pending_review',
  'to_apply',
  'applied',
  'written_test',
  'interview',
  'offer',
  'rejected',
  'abandoned',
]

export const STATUS_COLORS: Record<
  ApplicationStatus,
  { bg: string; text: string }
> = {
  pending_review: { bg: 'bg-amber-50', text: 'text-amber-700' },
  to_apply: { bg: 'bg-accent-soft', text: 'text-accent-hover' },
  applied: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  written_test: { bg: 'bg-indigo-50', text: 'text-indigo-700' },
  interview: { bg: 'bg-violet-50', text: 'text-violet-700' },
  offer: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  rejected: { bg: 'bg-red-50', text: 'text-red-700' },
  abandoned: { bg: 'bg-tag-bg', text: 'text-ink-muted' },
}

export const COMPANY_TYPES = [
  '全部',
  '央国企',
  '民营企业',
  '外企',
  '中外合资/港澳台资',
  '事业单位',
] as const
