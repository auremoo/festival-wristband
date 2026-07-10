import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageShell from '../components/PageShell'
import FestivalCard from '../components/FestivalCard'
import CountdownTimer from '../components/CountdownTimer'
import StatTile from '../components/StatTile'
import { PlusIcon, TicketIcon, GlobeIcon, MapPinIcon, StarIcon } from '../components/Icons'
import { useFestivals } from '../contexts/FestivalsContext'
import { statusOf, byStartDateAsc } from '../lib/festival'
import { journeyKm } from '../lib/geo'

export default function Dashboard() {
  const { t } = useTranslation()
  const { festivals, activeFestival } = useFestivals()

  useEffect(() => {
    document.title = 'Festival Wristband'
  }, [])

  const { upcoming, stats, nextUp } = useMemo(() => {
    const upcoming = festivals.filter((f) => statusOf(f) === 'upcoming').sort(byStartDateAsc)
    const attended = festivals.filter((f) => f.attended)
    const countries = new Set(attended.map((f) => f.location.country).filter(Boolean))
    const km = journeyKm(
      attended.map((f) => ({ lat: f.location.lat, lon: f.location.lon, date: f.dates.start })),
    )
    return {
      upcoming,
      nextUp: upcoming[0] ?? null,
      stats: { attended: attended.length, countries: countries.size, km },
    }
  }, [festivals])

  const addButton = (
    <Link
      to="/festivals/new"
      className="flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-on-accent transition-transform active:scale-95"
    >
      <PlusIcon size={16} />
      {t('common.add')}
    </Link>
  )

  return (
    <PageShell title="Festival Wristband" subtitle={t('app.tagline')} right={addButton}>
      <div className="space-y-6">
        {/* Live banner */}
        {activeFestival && (
          <Link
            to={`/festivals/${activeFestival.id}`}
            className="accent-glow block rounded-2xl border border-accent bg-accent/10 p-5 transition-transform active:scale-[0.99]"
          >
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 animate-pass-pulse rounded-full bg-accent" />
              <span className="text-xs font-bold uppercase tracking-widest text-accent">
                {t('dashboard.liveNow')}
              </span>
            </div>
            <p className="pass-heading mt-2 text-2xl text-text-primary">
              {t('dashboard.liveBanner', { name: activeFestival.name })}
            </p>
            <p className="mt-1 text-sm text-text-secondary">{t('dashboard.liveTap')}</p>
          </Link>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2.5">
          <StatTile label={t('dashboard.stats.attended')} value={stats.attended} accent icon={<TicketIcon size={13} />} />
          <StatTile label={t('dashboard.stats.countries')} value={stats.countries} icon={<GlobeIcon size={13} />} />
          <StatTile
            label={t('dashboard.stats.km')}
            value={stats.km.toLocaleString()}
            hint="km"
            icon={<MapPinIcon size={13} />}
          />
        </div>

        {/* Next up countdown */}
        {nextUp && (
          <section>
            <h2 className="pass-heading mb-3 text-xs tracking-widest text-text-muted">{t('dashboard.nextUp')}</h2>
            <div className="mb-3">
              <CountdownTimer festival={nextUp} />
            </div>
            <FestivalCard festival={nextUp} status="upcoming" />
          </section>
        )}

        {/* Upcoming list */}
        {upcoming.length > 1 && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="pass-heading text-xs tracking-widest text-text-muted">{t('dashboard.upcoming')}</h2>
              <Link to="/festivals" className="text-xs font-semibold text-accent">
                {t('dashboard.viewAll')}
              </Link>
            </div>
            <div className="space-y-3">
              {upcoming.slice(1).map((f) => (
                <FestivalCard key={f.id} festival={f} status="upcoming" />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {festivals.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-surface-card/50 p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent">
              <StarIcon size={24} />
            </div>
            <h2 className="pass-heading text-lg text-text-primary">{t('dashboard.empty.title')}</h2>
            <p className="mx-auto mt-2 max-w-xs text-sm text-text-secondary">{t('dashboard.empty.body')}</p>
            <Link
              to="/festivals/new"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-on-accent"
            >
              <PlusIcon size={16} />
              {t('dashboard.empty.cta')}
            </Link>
          </div>
        )}
      </div>
    </PageShell>
  )
}
