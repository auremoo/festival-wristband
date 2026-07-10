// localStorage persistence + JSON export/import for full portability.
// Single source of truth: the `festival-wristband-data` key.

import {
  CURRENT_DATA_VERSION,
  type Festival,
  type StoredData,
} from './types'

export const STORAGE_KEY = 'festival-wristband-data'

function emptyData(): StoredData {
  return { version: CURRENT_DATA_VERSION, festivals: [] }
}

/** Coerce an unknown parsed object into a valid Festival, filling defaults. */
function normalizeFestival(raw: unknown): Festival | null {
  if (!raw || typeof raw !== 'object') return null
  const f = raw as Record<string, unknown>
  if (typeof f.id !== 'string' || typeof f.name !== 'string') return null
  const loc = (f.location ?? {}) as Record<string, unknown>
  const dates = (f.dates ?? {}) as Record<string, unknown>
  return {
    id: f.id,
    name: f.name,
    edition: typeof f.edition === 'string' ? f.edition : '',
    dates: {
      start: typeof dates.start === 'string' ? dates.start : '',
      end: typeof dates.end === 'string' ? dates.end : '',
    },
    location: {
      city: typeof loc.city === 'string' ? loc.city : '',
      country: typeof loc.country === 'string' ? loc.country : '',
      lat: typeof loc.lat === 'number' ? loc.lat : 0,
      lon: typeof loc.lon === 'number' ? loc.lon : 0,
    },
    type: f.type === 'day' || f.type === 'urban' ? f.type : 'camping',
    accentColor: typeof f.accentColor === 'string' ? f.accentColor : '#e7e5e4',
    genres: Array.isArray(f.genres) ? (f.genres as unknown[]).filter((g): g is string => typeof g === 'string') : [],
    attended: f.attended === true,
    rating: typeof f.rating === 'number' ? f.rating : null,
    notes: typeof f.notes === 'string' ? f.notes : '',
    timetable: Array.isArray(f.timetable) ? (f.timetable as Festival['timetable']) : [],
    checklist: Array.isArray(f.checklist) ? (f.checklist as Festival['checklist']) : [],
    budget: Array.isArray(f.budget) ? (f.budget as Festival['budget']) : [],
    budgetTarget: typeof f.budgetTarget === 'number' ? f.budgetTarget : null,
    noteEntries: Array.isArray(f.noteEntries) ? (f.noteEntries as Festival['noteEntries']) : [],
    links: Array.isArray(f.links)
      ? (f.links as unknown[])
          .filter((l): l is { label: unknown; url: unknown } => !!l && typeof l === 'object')
          .map((l) => ({ label: String(l.label ?? ''), url: String(l.url ?? '') }))
          .filter((l) => l.url)
      : [],
    photos: Array.isArray(f.photos) ? (f.photos as string[]) : [],
    createdAt: typeof f.createdAt === 'string' ? f.createdAt : new Date().toISOString(),
  }
}

/** Parse + validate arbitrary JSON into StoredData. Throws on unusable input. */
export function parseData(json: string): StoredData {
  const parsed = JSON.parse(json)
  const source = Array.isArray(parsed) ? { festivals: parsed } : parsed
  if (!source || typeof source !== 'object') {
    throw new Error('Invalid data: not an object')
  }
  const rawFestivals: unknown[] = Array.isArray(source.festivals) ? source.festivals : []
  const festivals = rawFestivals
    .map(normalizeFestival)
    .filter((f): f is Festival => f !== null)
  return {
    version: CURRENT_DATA_VERSION,
    festivals,
  }
}

export function loadData(): StoredData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyData()
    return parseData(raw)
  } catch (err) {
    console.error('Failed to load Festival Wristband data, starting fresh.', err)
    return emptyData()
  }
}

export function saveData(data: StoredData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (err) {
    console.error('Failed to save Festival Wristband data.', err)
  }
}

/** Pretty-printed JSON blob for backup/download. */
export function exportJSON(data: StoredData): string {
  return JSON.stringify(
    { version: CURRENT_DATA_VERSION, festivals: data.festivals },
    null,
    2,
  )
}

export function clearData(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}
