import { STATUS_LIST, type ApplicationStatus } from '../lib/constants'
import type { Application } from '../hooks/useApplications'

export function filterApplications(applications: Application[], search: string): Application[] {
  if (!search) return applications

  const query = search.toLowerCase()
  return applications.filter(
    (application) =>
      application.title.toLowerCase().includes(query) ||
      application.company.toLowerCase().includes(query)
  )
}

export function groupApplicationsByStatus(applications: Application[]): Record<ApplicationStatus, Application[]> {
  const grouped = Object.fromEntries(
    STATUS_LIST.map((status) => [status, [] as Application[]])
  ) as Record<ApplicationStatus, Application[]>

  for (const application of applications) {
    grouped[application.status].push(application)
  }

  return grouped
}

export function extractDisplayCity(city: string | null | undefined): string | null {
  if (!city) return null
  return city.split(',')[0].split('、')[0] ?? null
}

export function extractPositionChips(title: string): string[] {
  return title
    .split(/[,，;；、/]+/)
    .map((value) => value.trim())
    .filter((value) => value.length >= 2 && value.length <= 20)
}

export function getColorHex(status: ApplicationStatus): string {
  const map: Record<ApplicationStatus, string> = {
    pending_review: '#f59e0b',
    to_apply: '#3b82f6',
    applied: '#10b981',
    written_test: '#6366f1',
    interview: '#8b5cf6',
    offer: '#10b981',
    rejected: '#ef4444',
    abandoned: '#94a3b8',
  }

  return map[status]
}
