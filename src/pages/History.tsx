import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageShell from '../components/PageShell'
import RatingStars from '../components/RatingStars'
import { HistoryIcon, MapPinIcon } from '../components/Icons'
import { useFestivals } from '../contexts/FestivalsContext'
import { byStartDateDesc } from '../lib/festival'
import { formatDateRange, formatMonthYear } from '../lib/format'

export default function History() {
  const { t, i18n } = useTranslation()
  const { festivals } = useFestivals()

  useEffect(() => {
    document.title = `${t('nav.history')} — Festival Wristband`
  }, [t])

  const attended = useMemo(
    () => festivals.filter((f) => f.attended).sort(byStartDateDesc),
    [festivals],
  )

  return (
    <PageShell title={t('history.title')} subtitle={t('history.subtitle', { count: attended.length })}>
      {attended.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface-card/50 p-8 text-center">
          <HistoryIcon size={26} className="mx-auto mb-2 text-text-muted" />
          <p className="text-sm text-text-secondary">{t('history.empty')}</p>
        </div>
      ) : (
        <div className="relative pl-2">
          {attended.map((f, i) => {
            const lastNote = [...f.noteEntries].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
            return (
              <div key={f.id} className="relative flex gap-4 pb-6">
                {/* Rail */}
                <div className="relative flex flex-col items-center">
                  <span
                    className="z-10 h-4 w-4 shrink-0 rounded-full border-2"
                    style={{ background: f.accentColor, borderColor: f.accentColor, boxShadow: `0 0 10px ${f.accentColor}66` }}
                  />
                  {i < attended.length - 1 && <span className="absolute top-4 h-full w-px bg-border" />}
                </div>

                {/* Card */}
                <Link
                  to={`/festivals/${f.id}`}
                  className="min-w-0 flex-1 rounded-2xl border border-border bg-surface-card p-4 transition-transform active:scale-[0.99]"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted">
                    {formatMonthYear(f.dates.start, i18n.language)}
                  </p>
                  <h3 className="pass-heading mt-0.5 text-xl text-text-primary" style={{ color: f.accentColor }}>
                    {f.name}
                  </h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-text-secondary">
                    <MapPinIcon size={13} className="text-text-muted" />
                    {f.location.city}
                    {f.location.country ? `, ${f.location.country}` : ''}
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {formatDateRange(f.dates.start, f.dates.end, i18n.language)}
                  </p>
                  {f.rating && <RatingStars value={f.rating} size={15} className="mt-2" />}
                  {lastNote && (
                    <p className="mt-2 line-clamp-2 border-l-2 border-border pl-2.5 text-sm italic text-text-secondary">
                      “{lastNote.text}”
                    </p>
                  )}
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </PageShell>
  )
}
