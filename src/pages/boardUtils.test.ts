import { describe, expect, it } from 'vitest'
import type { Application } from '../hooks/useApplications'
import {
  extractDisplayCity,
  extractPositionChips,
  filterApplications,
  getColorHex,
  groupApplicationsByStatus,
} from './boardUtils'

function makeApplication(overrides: Partial<Application>): Application {
  return {
    id: 'app-1',
    user_id: 'user-1',
    job_id: null,
    title: 'Frontend Engineer',
    company: 'Tencent',
    city: 'Shanghai',
    deadline: null,
    jd_url: null,
    status: 'pending_review',
    notes: null,
    reminder_date: null,
    reminder_note: null,
    imported_at: '2026-04-05T00:00:00.000Z',
    updated_at: '2026-04-05T00:00:00.000Z',
    ...overrides,
  }
}

describe('boardUtils', () => {
  it('returns the original list when search is empty', () => {
    const applications = [makeApplication({ id: 'app-1' })]

    expect(filterApplications(applications, '')).toBe(applications)
  })

  it('filters applications by title or company case-insensitively', () => {
    const applications = [
      makeApplication({ id: 'app-1', title: 'Frontend Engineer', company: 'Tencent' }),
      makeApplication({ id: 'app-2', title: 'Data Analyst', company: 'ByteDance' }),
    ]

    expect(filterApplications(applications, 'front')).toEqual([applications[0]])
    expect(filterApplications(applications, 'bytedance')).toEqual([applications[1]])
  })

  it('groups applications for every status and preserves empty columns', () => {
    const grouped = groupApplicationsByStatus([
      makeApplication({ id: 'app-1', status: 'applied' }),
      makeApplication({ id: 'app-2', status: 'interview' }),
    ])

    expect(grouped.applied).toHaveLength(1)
    expect(grouped.interview).toHaveLength(1)
    expect(grouped.offer).toEqual([])
    expect(grouped.pending_review).toEqual([])
  })

  it('extracts compact mobile chips from mixed delimiters', () => {
    expect(extractPositionChips('前端开发, 算法；AI/Go、x、this title is definitely too long')).toEqual([
      '前端开发',
      '算法',
      'AI',
      'Go',
    ])
  })

  it('extracts the leading display city across delimiters', () => {
    expect(extractDisplayCity('上海,北京')).toBe('上海')
    expect(extractDisplayCity('深圳、广州')).toBe('深圳')
    expect(extractDisplayCity(null)).toBeNull()
  })

  it('maps statuses to their kanban accent colors', () => {
    expect(getColorHex('written_test')).toBe('#6366f1')
    expect(getColorHex('rejected')).toBe('#ef4444')
  })
})
