import { STATUS_MAP } from '../lib/constants'
import type { ApplicationStatus } from '../lib/constants'

interface StatusBadgeProps {
  status: ApplicationStatus
  className?: string
}

const STATUS_DOT_MAP: Record<ApplicationStatus, string> = {
  pending_review: 'bg-gray-500',
  to_apply: 'bg-gray-900',
  applied: 'bg-gray-700',
  written_test: 'bg-gray-600',
  interview: 'bg-gray-500',
  offer: 'bg-black',
  rejected: 'bg-gray-400',
  abandoned: 'bg-gray-300',
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const label = STATUS_MAP[status]

  return (
    <span
      className={`inline-flex items-center gap-1.5 border border-gray-200 bg-white px-2 py-1 text-[10px] font-medium tracking-[0.16em] text-gray-700 ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT_MAP[status]}`} />
      <span>{label}</span>
    </span>
  )
}
