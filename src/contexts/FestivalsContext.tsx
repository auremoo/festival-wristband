import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  loadData,
  saveData,
  exportJSON,
  parseData,
  clearData,
  uuid,
} from '../lib/storage'
import { applyAccent } from '../lib/accent'
import { statusOf } from '../lib/festival'
import i18n from '../i18n'
import type { AppSettings, Festival, StoredData } from '../lib/types'

interface FestivalsContextValue {
  festivals: Festival[]
  /** The festival whose date range contains today, if any. */
  activeFestival: Festival | null
  getFestival: (id: string) => Festival | undefined
  addFestival: (f: Festival) => void
  updateFestival: (id: string, patch: Partial<Festival> | ((f: Festival) => Festival)) => void
  removeFestival: (id: string) => void
  /** The full store snapshot (festivals + settings), for export. */
  exportPayload: () => StoredData
  exportData: () => string
  importData: (json: string) => { ok: true; count: number } | { ok: false; error: string }
  resetAll: () => void
  settings: AppSettings
  setLanguage: (lang: string) => void
}

const FestivalsContext = createContext<FestivalsContextValue | null>(null)

export function FestivalsProvider({ children }: { children: ReactNode }) {
  // Start empty on first run — festivals are added by the user (no sample data).
  const [data, setData] = useState<StoredData>(() => loadData())

  // Persist on every change.
  useEffect(() => {
    saveData(data)
  }, [data])

  // Apply the stored language preference (source of truth = the JSON store).
  const storedLang = data.settings?.language
  useEffect(() => {
    if (storedLang && !i18n.language.startsWith(storedLang)) {
      i18n.changeLanguage(storedLang)
    }
  }, [storedLang])

  const activeFestival = useMemo(() => {
    return data.festivals.find((f) => statusOf(f) === 'live') ?? null
  }, [data.festivals])

  // Global accent = active festival's color (or neutral). Individual pages
  // (e.g. FestivalDetail) may temporarily override, then reapply this base.
  useEffect(() => {
    applyAccent(activeFestival?.accentColor ?? null)
  }, [activeFestival])

  const value = useMemo<FestivalsContextValue>(() => ({
    festivals: data.festivals,
    activeFestival,
    getFestival: (id) => data.festivals.find((f) => f.id === id),
    addFestival: (f) => setData((d) => ({ ...d, festivals: [...d.festivals, f] })),
    updateFestival: (id, patch) =>
      setData((d) => ({
        ...d,
        festivals: d.festivals.map((f) =>
          f.id === id ? (typeof patch === 'function' ? patch(f) : { ...f, ...patch }) : f,
        ),
      })),
    removeFestival: (id) =>
      setData((d) => ({ ...d, festivals: d.festivals.filter((f) => f.id !== id) })),
    exportPayload: () => data,
    exportData: () => exportJSON(data),
    importData: (json) => {
      try {
        const parsed = parseData(json)
        setData(parsed)
        return { ok: true, count: parsed.festivals.length }
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : 'Invalid JSON' }
      }
    },
    resetAll: () => {
      clearData()
      setData((d) => ({ version: 1, festivals: [], settings: d.settings }))
    },
    settings: data.settings ?? {},
    setLanguage: (lang) => {
      i18n.changeLanguage(lang)
      setData((d) => ({ ...d, settings: { ...d.settings, language: lang } }))
    },
  }), [data, activeFestival])

  return <FestivalsContext value={value}>{children}</FestivalsContext>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFestivals(): FestivalsContextValue {
  const ctx = useContext(FestivalsContext)
  if (!ctx) throw new Error('useFestivals must be used within FestivalsProvider')
  return ctx
}

// eslint-disable-next-line react-refresh/only-export-components
export { uuid }
