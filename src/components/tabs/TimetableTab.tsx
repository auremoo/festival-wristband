import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PlusIcon, TrashIcon, UploadIcon, AlertIcon } from '../Icons'
import { useFestivals, uuid } from '../../contexts/FestivalsContext'
import { festivalDays } from '../../lib/festival'
import { formatDay } from '../../lib/format'
import type { Festival, SetEntry } from '../../lib/types'

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

/** Two sets conflict when they share a day and their time ranges overlap. */
function conflicts(a: SetEntry, b: SetEntry): boolean {
  if (a.day !== b.day || a.id === b.id) return false
  const aStart = toMinutes(a.startTime)
  let aEnd = toMinutes(a.endTime)
  const bStart = toMinutes(b.startTime)
  let bEnd = toMinutes(b.endTime)
  if (aEnd <= aStart) aEnd += 1440 // crosses midnight
  if (bEnd <= bStart) bEnd += 1440
  return aStart < bEnd && bStart < aEnd
}

export default function TimetableTab({ festival }: { festival: Festival }) {
  const { t, i18n } = useTranslation()
  const { updateFestival } = useFestivals()
  const fileRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState('')
  const [showPaste, setShowPaste] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const days = festivalDays(festival)
  const timetableDays = useMemo(() => {
    const set = new Set<string>([...days, ...festival.timetable.map((e) => e.day)])
    return [...set].filter(Boolean).sort()
  }, [days, festival.timetable])
  const [activeDay, setActiveDay] = useState<string>('all')

  // Manual-add form state
  const [artist, setArtist] = useState('')
  const [stage, setStage] = useState('')
  const [addDay, setAddDay] = useState(days[0] ?? '')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  const shown = useMemo(() => {
    return festival.timetable
      .filter((e) => activeDay === 'all' || e.day === activeDay)
      .sort((a, b) => (a.day + a.startTime).localeCompare(b.day + b.startTime))
  }, [festival.timetable, activeDay])

  const conflictIds = useMemo(() => {
    const ids = new Set<string>()
    for (const a of festival.timetable) {
      for (const b of festival.timetable) {
        if (conflicts(a, b)) {
          ids.add(a.id)
          ids.add(b.id)
        }
      }
    }
    return ids
  }, [festival.timetable])

  function importEntries(raw: string) {
    try {
      const parsed = JSON.parse(raw)
      const arr = Array.isArray(parsed) ? parsed : Array.isArray(parsed.timetable) ? parsed.timetable : null
      if (!arr) throw new Error('not an array')
      const entries: SetEntry[] = arr
        .filter((e: unknown) => e && typeof e === 'object')
        .map((e: Record<string, unknown>) => ({
          id: uuid(),
          artist: String(e.artist ?? ''),
          stage: String(e.stage ?? ''),
          day: String(e.day ?? ''),
          startTime: String(e.startTime ?? ''),
          endTime: String(e.endTime ?? ''),
        }))
        .filter((e: SetEntry) => e.artist)
      if (!entries.length) throw new Error('no valid entries')
      updateFestival(festival.id, (f) => ({ ...f, timetable: entries }))
      setImportError('')
      setShowPaste(false)
      setPasteText('')
    } catch {
      setImportError(t('timetable.importError'))
    }
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => importEntries(String(reader.result))
    reader.readAsText(file)
    e.target.value = ''
  }

  function addManual() {
    if (!artist.trim() || !addDay || !startTime) return
    updateFestival(festival.id, (f) => ({
      ...f,
      timetable: [
        ...f.timetable,
        { id: uuid(), artist: artist.trim(), stage: stage.trim(), day: addDay, startTime, endTime: endTime || startTime },
      ],
    }))
    setArtist('')
    setStage('')
    setStartTime('')
    setEndTime('')
    setShowAdd(false)
  }

  function remove(entryId: string) {
    updateFestival(festival.id, (f) => ({ ...f, timetable: f.timetable.filter((e) => e.id !== entryId) }))
  }

  function clearAll() {
    updateFestival(festival.id, (f) => ({ ...f, timetable: [] }))
  }

  const hasEntries = festival.timetable.length > 0

  return (
    <div className="space-y-4 pb-4">
      {/* Toolbar */}
      <div className="flex gap-2">
        <button
          onClick={() => fileRef.current?.click()}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border py-2.5 text-xs font-semibold uppercase tracking-wider text-text-primary"
        >
          <UploadIcon size={15} />
          {t('timetable.import')}
        </button>
        <button
          onClick={() => setShowPaste((v) => !v)}
          className="flex-1 rounded-xl border border-border py-2.5 text-xs font-semibold uppercase tracking-wider text-text-primary"
        >
          {t('timetable.paste')}
        </button>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="flex items-center justify-center rounded-xl bg-accent px-4 text-on-accent"
          aria-label={t('timetable.add')}
        >
          <PlusIcon size={18} />
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" onChange={onFile} className="hidden" />
      </div>
      {importError && <p className="text-xs text-red-400">{importError}</p>}

      {/* Paste box */}
      {showPaste && (
        <div className="space-y-2 rounded-2xl border border-border bg-surface-card p-3">
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={5}
            placeholder={t('timetable.schema')}
            className="w-full rounded-xl border border-border bg-surface-alt p-3 font-mono text-xs text-text-primary outline-none focus:border-accent/60"
          />
          <button
            onClick={() => importEntries(pasteText)}
            className="w-full rounded-xl bg-accent py-2.5 text-sm font-bold text-on-accent"
          >
            {t('timetable.replace')}
          </button>
        </div>
      )}

      {/* Manual add */}
      {showAdd && (
        <div className="space-y-3 rounded-2xl border border-border bg-surface-card p-3">
          <input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder={t('timetable.artist')} className="w-full rounded-xl border border-border bg-surface-alt px-3.5 py-2.5 text-base text-text-primary placeholder-text-muted outline-none focus:border-accent/60" />
          <input value={stage} onChange={(e) => setStage(e.target.value)} placeholder={t('timetable.stage')} className="w-full rounded-xl border border-border bg-surface-alt px-3.5 py-2.5 text-base text-text-primary placeholder-text-muted outline-none focus:border-accent/60" />
          <select value={addDay} onChange={(e) => setAddDay(e.target.value)} className="w-full rounded-xl border border-border bg-surface-alt px-3.5 py-2.5 text-base text-text-primary outline-none focus:border-accent/60">
            {days.map((d) => (
              <option key={d} value={d}>{formatDay(d, i18n.language)}</option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full rounded-xl border border-border bg-surface-alt px-3.5 py-2.5 text-base text-text-primary outline-none focus:border-accent/60" />
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full rounded-xl border border-border bg-surface-alt px-3.5 py-2.5 text-base text-text-primary outline-none focus:border-accent/60" />
          </div>
          <button onClick={addManual} className="w-full rounded-xl bg-accent py-2.5 text-sm font-bold text-on-accent">
            {t('common.add')}
          </button>
        </div>
      )}

      {/* Empty state */}
      {!hasEntries && !showPaste && !showAdd && (
        <div className="rounded-2xl border border-dashed border-border bg-surface-card/50 p-6 text-center">
          <p className="text-sm font-semibold text-text-primary">{t('timetable.emptyTitle')}</p>
          <p className="mx-auto mt-2 max-w-xs text-xs text-text-secondary">{t('timetable.importInstructions')}</p>
          <pre className="mt-3 overflow-x-auto rounded-xl border border-border bg-surface-alt p-3 text-left font-mono text-[10px] leading-relaxed text-text-muted">
{`[
  {
    "artist": "...",
    "stage": "...",
    "day": "2026-06-19",
    "startTime": "21:00",
    "endTime": "22:30"
  }
]`}
          </pre>
        </div>
      )}

      {/* Day filter */}
      {hasEntries && timetableDays.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveDay('all')}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider ${activeDay === 'all' ? 'bg-accent text-on-accent' : 'border border-border text-text-muted'}`}
          >
            {t('timetable.allDays')}
          </button>
          {timetableDays.map((d) => (
            <button
              key={d}
              onClick={() => setActiveDay(d)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider ${activeDay === d ? 'bg-accent text-on-accent' : 'border border-border text-text-muted'}`}
            >
              {formatDay(d, i18n.language)}
            </button>
          ))}
        </div>
      )}

      {/* Entries */}
      {shown.length > 0 && (
        <div className="space-y-2">
          {shown.map((e) => {
            const clash = conflictIds.has(e.id)
            return (
              <div
                key={e.id}
                className={`flex items-center gap-3 rounded-2xl border bg-surface-card p-3.5 ${clash ? 'border-red-500/50' : 'border-border'}`}
              >
                <div className="shrink-0 text-center">
                  <p className="font-mono text-sm font-bold tabular-nums text-accent">{e.startTime}</p>
                  <p className="font-mono text-[10px] tabular-nums text-text-muted">{e.endTime}</p>
                </div>
                <div className="min-w-0 flex-1 border-l border-border pl-3">
                  <p className="truncate text-sm font-semibold text-text-primary">{e.artist}</p>
                  <p className="truncate text-xs text-text-muted">
                    {e.stage}
                    {activeDay === 'all' ? ` · ${formatDay(e.day, i18n.language)}` : ''}
                  </p>
                  {clash && (
                    <p className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold text-red-400">
                      <AlertIcon size={11} />
                      {t('timetable.conflict')}
                    </p>
                  )}
                </div>
                <button onClick={() => remove(e.id)} className="p-1 text-text-muted hover:text-red-400">
                  <TrashIcon size={16} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {hasEntries && shown.length === 0 && (
        <p className="py-4 text-center text-sm text-text-muted">{t('timetable.noEntriesDay')}</p>
      )}

      {/* Clear */}
      {hasEntries && (
        <button onClick={clearAll} className="w-full rounded-xl border border-border py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
          {t('timetable.clear')}
        </button>
      )}
    </div>
  )
}
