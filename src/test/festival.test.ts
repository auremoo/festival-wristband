import { describe, it, expect } from 'vitest'
import { statusOf, durationDays, festivalDays, attendanceSummary } from '../lib/festival'
import type { Festival } from '../lib/types'

function make(start: string, end: string): Festival {
  return {
    id: 'x', name: 'Test', edition: '2026',
    dates: { start, end },
    location: { city: '', country: '', lat: 0, lon: 0 },
    type: 'camping', accentColor: '#fff', genres: [],
    attended: false, attendedDays: [], rating: null, notes: '',
    timetable: [], checklist: [], budget: [], budgetTarget: null,
    noteEntries: [], links: [], photos: [], createdAt: '2026-01-01T00:00:00Z',
  }
}

describe('festival status', () => {
  it('detects a live festival', () => {
    const now = new Date('2026-07-10T12:00:00')
    expect(statusOf(make('2026-07-03', '2026-07-18'), now)).toBe('live')
  })

  it('detects upcoming and past', () => {
    const now = new Date('2026-07-10T12:00:00')
    expect(statusOf(make('2026-07-17', '2026-07-19'), now)).toBe('upcoming')
    expect(statusOf(make('2026-06-19', '2026-06-21'), now)).toBe('past')
  })

  it('is inclusive of the last day', () => {
    const now = new Date('2026-07-18T22:00:00')
    expect(statusOf(make('2026-07-03', '2026-07-18'), now)).toBe('live')
  })
})

describe('duration + days', () => {
  it('counts inclusive duration', () => {
    expect(durationDays(make('2026-06-19', '2026-06-21'))).toBe(3)
    expect(durationDays(make('2026-06-19', '2026-06-19'))).toBe(1)
  })

  it('lists each covered day', () => {
    expect(festivalDays(make('2026-06-19', '2026-06-21'))).toEqual([
      '2026-06-19', '2026-06-20', '2026-06-21',
    ])
  })
})

describe('attendance summary', () => {
  it('reports full attendance when no specific days are set', () => {
    const f = { ...make('2026-06-19', '2026-06-21'), attended: true }
    const att = attendanceSummary(f)
    expect(att).toMatchObject({ full: true, count: 3, total: 3 })
  })

  it('reports a partial subset of days', () => {
    const f = { ...make('2026-06-19', '2026-06-21'), attended: true, attendedDays: ['2026-06-19', '2026-06-20'] }
    const att = attendanceSummary(f)
    expect(att.full).toBe(false)
    expect(att.count).toBe(2)
    expect(att.total).toBe(3)
  })

  it('ignores attended days outside the festival range', () => {
    const f = { ...make('2026-06-19', '2026-06-21'), attended: true, attendedDays: ['2020-01-01'] }
    expect(attendanceSummary(f).count).toBe(0)
  })
})
