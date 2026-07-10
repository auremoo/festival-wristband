// Core data model for Festival Wristband. Everything is stored in localStorage
// under a single key and is fully export/importable as JSON.

export type FestivalType = 'camping' | 'day' | 'urban'

export type BudgetCategory =
  | 'transport'
  | 'accommodation'
  | 'tickets'
  | 'food'
  | 'merch'
  | 'misc'

export interface SetEntry {
  id: string
  artist: string
  stage: string
  day: string // ISO date (YYYY-MM-DD)
  startTime: string // HH:mm
  endTime: string // HH:mm
}

export interface ChecklistItem {
  id: string
  label: string
  checked: boolean
  /** Optional grouping key from the template (e.g. "essentials", "camping"). */
  group?: string
}

export interface BudgetEntry {
  id: string
  label: string
  amount: number
  category: BudgetCategory
  date?: string // ISO date
}

export interface NoteEntry {
  id: string
  text: string
  createdAt: string // ISO timestamp
}

export interface FestivalLink {
  label: string
  url: string
}

export interface Festival {
  id: string
  name: string
  edition: string // e.g. "2026"
  dates: {
    start: string // ISO date
    end: string // ISO date
  }
  location: {
    city: string
    country: string
    lat: number
    lon: number
  }
  type: FestivalType
  accentColor: string // hex
  genres: string[]
  attended: boolean
  /** Specific festival days actually attended (ISO dates). Empty = attended the
      full run. Only meaningful when `attended` is true. */
  attendedDays: string[]
  rating: number | null // 1-5
  /** Optional single free-text note (legacy field, kept for JSON compatibility). */
  notes: string
  timetable: SetEntry[]
  checklist: ChecklistItem[]
  budget: BudgetEntry[]
  budgetTarget: number | null
  /** Auto-timestamped journal entries (Notes tab). */
  noteEntries: NoteEntry[]
  /** External links shown on the festival (official site, tickets, companion app…). */
  links: FestivalLink[]
  photos: string[] // placeholder for future
  createdAt: string // ISO timestamp
}

export const CURRENT_DATA_VERSION = 1

export interface StoredData {
  version: number
  festivals: Festival[]
}
