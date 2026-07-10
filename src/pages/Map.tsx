import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import MapView from '../components/MapView'
import { MapPinIcon } from '../components/Icons'
import { useFestivals } from '../contexts/FestivalsContext'

export default function MapPage() {
  const { t, i18n } = useTranslation()
  const { festivals } = useFestivals()

  useEffect(() => {
    document.title = `${t('nav.map')} — Festival Wristband`
  }, [t])

  const withCoords = useMemo(
    () => festivals.filter((f) => (f.location.lat !== 0 || f.location.lon !== 0)),
    [festivals],
  )

  return (
    <div className="relative flex flex-1 flex-col">
      {/* Map fills the screen above the bottom nav */}
      <div className="absolute inset-0" style={{ bottom: 'calc(84px + env(safe-area-inset-bottom, 0px))' }}>
        <MapView festivals={withCoords} lang={i18n.language} className="h-full w-full" />
      </div>

      {/* Floating title */}
      <div className="pointer-events-none absolute left-3 right-3 top-3 z-[1100] flex items-center justify-between">
        <div className="rounded-2xl border border-border bg-surface/90 px-4 py-2 backdrop-blur-md">
          <h1 className="pass-heading text-lg text-text-primary">{t('nav.map')}</h1>
          <p className="text-[11px] text-text-muted">{t('map.count', { count: withCoords.length })}</p>
        </div>
      </div>

      {/* Legend */}
      {withCoords.length > 0 && (
        <div className="pointer-events-none absolute bottom-3 left-3 z-[1100] rounded-2xl border border-border bg-surface/90 px-3 py-2 backdrop-blur-md">
          <div className="flex flex-col gap-1 text-[10px] text-text-secondary">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-white" /> {t('status.live')}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-white/70" /> {t('status.past')}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-white/50" /> {t('status.upcoming')}
            </span>
          </div>
        </div>
      )}

      {/* Empty overlay */}
      {withCoords.length === 0 && (
        <div className="absolute inset-x-4 top-1/3 z-[1100] rounded-2xl border border-border bg-surface-card p-6 text-center">
          <MapPinIcon size={26} className="mx-auto mb-2 text-text-muted" />
          <p className="text-sm text-text-secondary">{t('map.empty')}</p>
          <Link
            to="/festivals/new"
            className="mt-4 inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-on-accent"
          >
            {t('common.addFestival')}
          </Link>
        </div>
      )}
    </div>
  )
}
