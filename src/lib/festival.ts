// Date + status helpers shared across pages. Status is derived from "today"
// against a festival's date range.

import type { Festival } from './types'

export type FestivalStatus = 'live' | 'upcoming' | 'past'

/** Midnight-local start of a given day, so "today" comparisons are inclusive of the whole day. */
function dayStart(iso: string): number {
  const d = new Date(iso + 'T00:00:00')
  return d.getTime()
}
function dayEnd(iso: string): number {
  const d = new Date(iso + 'T23:59:59')
  return d.getTime()
}

export function statusOf(f: Festival, now: Date = new Date()): FestivalStatus {
  const t = now.getTime()
  const start = f.dates.start ? dayStart(f.dates.start) : Infinity
  const end = f.dates.end ? dayEnd(f.dates.end) : (f.dates.start ? dayEnd(f.dates.start) : Infinity)
  if (t >= start && t <= end) return 'live'
  if (t < start) return 'upcoming'
  return 'past'
}

export function isLive(f: Festival, now: Date = new Date()): boolean {
  return statusOf(f, now) === 'live'
}

/** Whole days until a festival starts (0 if today or past). */
export function daysUntil(f: Festival, now: Date = new Date()): number {
  if (!f.dates.start) return 0
  const diff = dayStart(f.dates.start) - now.getTime()
  return Math.max(0, Math.ceil(diff / 86_400_000))
}

/** Duration in days (inclusive). */
export function durationDays(f: Festival): number {
  if (!f.dates.start) return 1
  const start = dayStart(f.dates.start)
  const end = f.dates.end ? dayStart(f.dates.end) : start
  return Math.max(1, Math.round((end - start) / 86_400_000) + 1)
}

/** Format a Date as a local YYYY-MM-DD (avoids UTC shift from toISOString). */
function localISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** List of ISO day strings covered by the festival. */
export function festivalDays(f: Festival): string[] {
  if (!f.dates.start) return []
  const days: string[] = []
  const start = new Date(f.dates.start + 'T00:00:00')
  const n = durationDays(f)
  for (let i = 0; i < n; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    days.push(localISO(d))
  }
  return days
}

/** Effective days attended: the explicit subset, or the full run when unspecified. */
export function effectiveAttendedDays(f: Festival): string[] {
  if (!f.attended) return []
  const all = festivalDays(f)
  if (!f.attendedDays.length) return all
  return all.filter((d) => f.attendedDays.includes(d))
}

/** Summary of attendance for display. */
export function attendanceSummary(f: Festival): {
  full: boolean
  count: number
  total: number
  days: string[]
} {
  const all = festivalDays(f)
  const days = effectiveAttendedDays(f)
  return { full: all.length > 0 && days.length >= all.length, count: days.length, total: all.length, days }
}

export function totalBudget(f: Festival): number {
  return f.budget.reduce((sum, e) => sum + (Number.isFinite(e.amount) ? e.amount : 0), 0)
}

/** Sort helper: soonest upcoming first, then live, then most-recent past. */
export function byStartDateAsc(a: Festival, b: Festival): number {
  return (a.dates.start || '').localeCompare(b.dates.start || '')
}
export function byStartDateDesc(a: Festival, b: Festival): number {
  return (b.dates.start || '').localeCompare(a.dates.start || '')
}
