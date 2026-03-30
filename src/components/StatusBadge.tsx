import { STATUS_MAP, STATUS_COLORS } from '../lib/constants'
import type { ApplicationStatus } from '../lib/constants'

interface StatusBadgeProps {
  status: ApplicationStatus
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const colors = STATUS_COLORS[status]
  const label = STATUS_MAP[status]

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${className}`}
    >
      {label}
    </span>
  )
}
