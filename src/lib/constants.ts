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

export const COMPANY_TYPES = [
  '全部',
  '央国企',
  '民营企业',
  '外企',
  '中外合资/港澳台资',
  '事业单位',
] as const
