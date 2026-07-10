import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageShell from '../components/PageShell'
import WristbandChip from '../components/WristbandChip'
import RatingStars from '../components/RatingStars'
import { XIcon, ExternalLinkIcon } from '../components/Icons'
import { useFestivals, uuid } from '../contexts/FestivalsContext'
import { createChecklist } from '../data/checklistTemplates'
import { applyAccent } from '../lib/accent'
import { festivalDays } from '../lib/festival'
import { formatDay } from '../lib/format'
import type { Festival, FestivalLink, FestivalType } from '../lib/types'

const PRESET_COLORS = [
  '#c1121f', '#ea580c', '#f5a623', '#eab308', '#2fa84f', '#14b8a6',
  '#06b6d4', '#2563eb', '#4f46e5', '#8b2fc9', '#ff2d78', '#e7e5e4',
]

const inputClass =
  'w-full rounded-xl border border-border bg-surface-alt px-3.5 py-3 text-base text-text-primary placeholder-text-muted outline-none focus:border-accent/60'
const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-muted'

export default function FestivalForm() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const { getFestival, addFestival, updateFestival, activeFestival } = useFestivals()
  const editing = getFestival(id ?? '')

  const [name, setName] = useState(editing?.name ?? '')
  const [edition, setEdition] = useState(editing?.edition ?? String(new Date().getFullYear()))
  const [start, setStart] = useState(editing?.dates.start ?? '')
  const [end, setEnd] = useState(editing?.dates.end ?? '')
  const [city, setCity] = useState(editing?.location.city ?? '')
  const [country, setCountry] = useState(editing?.location.country ?? '')
  const [lat, setLat] = useState(editing ? String(editing.location.lat || '') : '')
  const [lon, setLon] = useState(editing ? String(editing.location.lon || '') : '')
  const [type, setType] = useState<FestivalType>(editing?.type ?? 'camping')
  const [accentColor, setAccentColor] = useState(editing?.accentColor ?? PRESET_COLORS[10])
  const [genres, setGenres] = useState<string[]>(editing?.genres ?? [])
  const [genreInput, setGenreInput] = useState('')
  const [attended, setAttended] = useState(editing?.attended ?? false)
  const [attendedDays, setAttendedDays] = useState<string[]>(editing?.attendedDays ?? [])
  const [rating, setRating] = useState<number | null>(editing?.rating ?? null)
  const [budgetTarget, setBudgetTarget] = useState(editing?.budgetTarget ? String(editing.budgetTarget) : '')
  const [links, setLinks] = useState<FestivalLink[]>(editing?.links ?? [])
  const [linkLabel, setLinkLabel] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = `${editing ? t('form.editTitle') : t('form.newTitle')} — Festival Wristband`
  }, [editing, t])

  // Live-theme the page to the chosen color; restore the active festival's on exit.
  useEffect(() => {
    applyAccent(accentColor)
    return () => applyAccent(activeFestival?.accentColor ?? null)
  }, [accentColor, activeFestival])

  // Live preview object.
  const preview = useMemo<Festival>(
    () => ({
      id: editing?.id ?? 'preview',
      name: name || t('form.previewName'),
      edition,
      dates: { start: start || '2026-01-01', end: end || start || '2026-01-01' },
      location: { city: city || '—', country, lat: Number(lat) || 0, lon: Number(lon) || 0 },
      type,
      accentColor,
      genres,
      attended,
      attendedDays,
      rating,
      notes: '',
      timetable: [],
      checklist: [],
      budget: [],
      budgetTarget: null,
      noteEntries: [],
      links: [],
      photos: [],
      createdAt: editing?.createdAt ?? new Date().toISOString(),
    }),
    [editing, name, edition, start, end, city, country, lat, lon, type, accentColor, genres, attended, attendedDays, rating, t],
  )

  // Festival days available for attendance selection (from the current dates).
  const dayOptions = start ? festivalDays(preview) : []

  function toggleAttendedDay(day: string) {
    // Empty attendedDays means "full run" — expand to all days before toggling.
    const current = attendedDays.length ? attendedDays : dayOptions
    const next = current.includes(day) ? current.filter((d) => d !== day) : [...current, day]
    // If every day is selected, collapse back to [] ("full").
    setAttendedDays(next.length >= dayOptions.length ? [] : next.sort())
  }

  function addGenre() {
    const g = genreInput.trim().toLowerCase()
    if (g && !genres.includes(g)) setGenres([...genres, g])
    setGenreInput('')
  }

  function addLink() {
    const url = linkUrl.trim()
    if (!url) return
    const href = /^https?:\/\//i.test(url) ? url : `https://${url}`
    setLinks([...links, { label: linkLabel.trim() || href, url: href }])
    setLinkLabel('')
    setLinkUrl('')
  }

  function submit() {
    if (!name.trim()) return setError(t('form.errorName'))
    if (!start) return setError(t('form.errorDate'))
    setError('')

    const base = {
      name: name.trim(),
      edition: edition.trim(),
      dates: { start, end: end || start },
      location: { city: city.trim(), country: country.trim(), lat: Number(lat) || 0, lon: Number(lon) || 0 },
      type,
      accentColor,
      genres,
      attended,
      attendedDays: attended ? attendedDays : [],
      rating,
      budgetTarget: budgetTarget ? Number(budgetTarget) : null,
      links,
    }

    if (editing) {
      updateFestival(editing.id, base)
      navigate(`/festivals/${editing.id}`)
    } else {
      const festival: Festival = {
        id: uuid(),
        ...base,
        notes: '',
        timetable: [],
        checklist: createChecklist(type),
        budget: [],
        noteEntries: [],
        photos: [],
        createdAt: new Date().toISOString(),
      }
      addFestival(festival)
      navigate(`/festivals/${festival.id}`)
    }
  }

  return (
    <PageShell title={editing ? t('form.editTitle') : t('form.newTitle')} back>
      <div className="space-y-6 pb-4">
        {/* Live wristband preview */}
        <div>
          <p className={labelClass}>{t('form.preview')}</p>
          <WristbandChip festival={preview} status={attended ? 'past' : 'upcoming'} />
        </div>

        {/* Identity */}
        <div className="space-y-4">
          <div>
            <label className={labelClass}>{t('form.name')}</label>
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Hellfest" />
          </div>
          <div>
            <label className={labelClass}>{t('form.edition')}</label>
            <input className={inputClass} value={edition} onChange={(e) => setEdition(e.target.value)} placeholder="2026" inputMode="numeric" />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>{t('form.startDate')}</label>
            <input type="date" className={inputClass} value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>{t('form.endDate')}</label>
            <input type="date" className={inputClass} value={end} min={start} onChange={(e) => setEnd(e.target.value)} />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{t('form.city')}</label>
              <input className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} placeholder="Clisson" />
            </div>
            <div>
              <label className={labelClass}>{t('form.country')}</label>
              <input className={inputClass} value={country} onChange={(e) => setCountry(e.target.value)} placeholder="France" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{t('form.lat')}</label>
              <input className={inputClass} value={lat} onChange={(e) => setLat(e.target.value)} placeholder="47.0879" inputMode="decimal" />
            </div>
            <div>
              <label className={labelClass}>{t('form.lon')}</label>
              <input className={inputClass} value={lon} onChange={(e) => setLon(e.target.value)} placeholder="-1.2833" inputMode="decimal" />
            </div>
          </div>
          <p className="text-[11px] text-text-muted">{t('form.coordsHint')}</p>
        </div>

        {/* Type */}
        <div>
          <label className={labelClass}>{t('form.type')}</label>
          <div className="grid grid-cols-3 gap-2">
            {(['camping', 'day', 'urban'] as FestivalType[]).map((ty) => (
              <button
                key={ty}
                type="button"
                onClick={() => setType(ty)}
                className={`rounded-xl border py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                  type === ty ? 'border-accent bg-accent/10 text-accent' : 'border-border text-text-muted'
                }`}
              >
                {t(`type.${ty}`)}
              </button>
            ))}
          </div>
          {!editing && <p className="mt-1.5 text-[11px] text-text-muted">{t('form.typeHint')}</p>}
        </div>

        {/* Accent color */}
        <div>
          <label className={labelClass}>{t('form.accentColor')}</label>
          <div className="flex flex-wrap items-center gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setAccentColor(c)}
                className={`h-9 w-9 rounded-full border-2 transition-transform active:scale-90 ${
                  accentColor.toLowerCase() === c.toLowerCase() ? 'border-white' : 'border-transparent'
                }`}
                style={{ background: c }}
                aria-label={c}
              />
            ))}
            <label className="relative h-9 w-9 cursor-pointer overflow-hidden rounded-full border-2 border-border">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="absolute -left-2 -top-2 h-14 w-14 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Genres */}
        <div>
          <label className={labelClass}>{t('form.genres')}</label>
          <div className="flex gap-2">
            <input
              className={inputClass}
              value={genreInput}
              onChange={(e) => setGenreInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault()
                  addGenre()
                }
              }}
              placeholder={t('form.genrePlaceholder')}
            />
            <button
              type="button"
              onClick={addGenre}
              className="shrink-0 rounded-xl border border-border px-4 text-sm font-semibold text-text-primary"
            >
              {t('common.add')}
            </button>
          </div>
          {genres.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {genres.map((g) => (
                <span
                  key={g}
                  className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-text-secondary"
                >
                  {g}
                  <button type="button" onClick={() => setGenres(genres.filter((x) => x !== g))} className="text-text-muted">
                    <XIcon size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Budget target */}
        <div>
          <label className={labelClass}>{t('form.budgetTarget')}</label>
          <input
            className={inputClass}
            value={budgetTarget}
            onChange={(e) => setBudgetTarget(e.target.value)}
            placeholder="750"
            inputMode="numeric"
          />
        </div>

        {/* Links */}
        <div>
          <label className={labelClass}>{t('form.links')}</label>
          <div className="space-y-2">
            <input
              className={inputClass}
              value={linkLabel}
              onChange={(e) => setLinkLabel(e.target.value)}
              placeholder={t('form.linkLabel')}
            />
            <div className="flex gap-2">
              <input
                className={inputClass}
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLink())}
                placeholder="https://…"
                inputMode="url"
              />
              <button
                type="button"
                onClick={addLink}
                className="shrink-0 rounded-xl border border-border px-4 text-sm font-semibold text-text-primary"
              >
                {t('common.add')}
              </button>
            </div>
          </div>
          {links.length > 0 && (
            <div className="mt-2 space-y-2">
              {links.map((l, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl border border-border bg-surface-card px-3 py-2">
                  <ExternalLinkIcon size={14} className="shrink-0 text-text-muted" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-text-primary">{l.label}</p>
                    <p className="truncate text-[11px] text-text-muted">{l.url}</p>
                  </div>
                  <button type="button" onClick={() => setLinks(links.filter((_, j) => j !== i))} className="text-text-muted">
                    <XIcon size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Attended + rating */}
        <div className="rounded-xl border border-border bg-surface-card p-4">
          <button
            type="button"
            onClick={() => setAttended(!attended)}
            className="flex w-full items-center justify-between"
          >
            <span className="text-sm text-text-primary">{t('form.attended')}</span>
            <div className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${attended ? 'bg-accent' : 'bg-surface-elevated'}`}>
              <div className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${attended ? 'left-6' : 'left-1'}`} />
            </div>
          </button>
          {attended && dayOptions.length > 1 && (
            <div className="mt-3 border-t border-border pt-3">
              <p className="mb-1 text-sm text-text-secondary">{t('form.attendedDays')}</p>
              <p className="mb-2 text-[11px] text-text-muted">{t('form.attendedDaysHint')}</p>
              <div className="flex flex-wrap gap-1.5">
                {dayOptions.map((d) => {
                  const on = attendedDays.length === 0 || attendedDays.includes(d)
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleAttendedDay(d)}
                      className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition-colors ${
                        on ? 'bg-accent text-on-accent' : 'border border-border text-text-muted'
                      }`}
                    >
                      {formatDay(d, i18n.language)}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          {attended && (
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <span className="text-sm text-text-secondary">{t('form.rating')}</span>
              <RatingStars value={rating} size={22} onChange={(v) => setRating(v === 0 ? null : v)} />
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 rounded-xl border border-border py-3.5 text-sm font-semibold text-text-secondary"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={submit}
            className="flex-[2] rounded-xl bg-accent py-3.5 text-sm font-bold uppercase tracking-wider text-on-accent transition-transform active:scale-[0.99]"
          >
            {editing ? t('common.save') : t('form.create')}
          </button>
        </div>
      </div>
    </PageShell>
  )
}
