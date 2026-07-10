import { useTranslation } from 'react-i18next'
import { MapPinIcon, TentIcon, SunIcon, BuildingIcon } from './Icons'
import StatusBadge from './StatusBadge'
import RatingStars from './RatingStars'
import { statusOf, type FestivalStatus } from '../lib/festival'
import { formatDateRange, wristbandSerial } from '../lib/format'
import type { Festival, FestivalType } from '../lib/types'

const typeIcon: Record<FestivalType, typeof TentIcon> = {
  camping: TentIcon,
  day: SunIcon,
  urban: BuildingIcon,
}

interface Props {
  festival: Festival
  status?: FestivalStatus
  /** Compact variant for dense lists (hides genres/serial). */
  compact?: boolean
}

/**
 * A festival rendered as an RFID-style wristband: a colored band strip down the
 * left edge, a faint tint of the festival's own color, its name, dates, and a
 * pseudo serial number. Uses the festival's own accentColor (not the global
 * accent) so every chip keeps its identity inside a list.
 */
export default function WristbandChip({ festival, status, compact }: Props) {
  const { t, i18n } = useTranslation()
  const st = status ?? statusOf(festival)
  const color = festival.accentColor
  const TypeIcon = typeIcon[festival.type]

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border bg-surface-card"
      style={{ borderColor: st === 'live' ? color : undefined }}
    >
      {/* Faint color wash from the band side */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.10]"
        style={{ background: `linear-gradient(90deg, ${color} 0%, transparent 55%)` }}
      />
      {/* Colored band strip */}
      <div
        className="absolute inset-y-0 left-0 w-2.5"
        style={{ background: color, boxShadow: st === 'live' ? `0 0 12px ${color}` : undefined }}
      />

      <div className="relative pl-5 pr-4 py-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color }}>
              <TypeIcon size={13} />
              <span>{t(`type.${festival.type}`)}</span>
              <span className="text-text-muted">· {festival.edition}</span>
            </div>
            <h3 className="pass-heading mt-1 truncate text-xl text-text-primary">{festival.name}</h3>
          </div>
          <StatusBadge status={st} />
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-sm text-text-secondary">
          <MapPinIcon size={14} className="shrink-0 text-text-muted" />
          <span className="truncate">
            {festival.location.city}
            {festival.location.country ? `, ${festival.location.country}` : ''}
          </span>
        </div>

        <div className="mt-1 text-sm font-medium text-text-primary">
          {formatDateRange(festival.dates.start, festival.dates.end, i18n.language)}
        </div>

        {!compact && (
          <div className="mt-3 flex items-center justify-between gap-2">
            {festival.attended && festival.rating ? (
              <RatingStars value={festival.rating} size={13} />
            ) : festival.genres.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {festival.genres.slice(0, 3).map((g) => (
                  <span
                    key={g}
                    className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-text-muted"
                  >
                    {g}
                  </span>
                ))}
              </div>
            ) : (
              <span />
            )}
            <span className="shrink-0 font-mono text-[9px] tracking-tight text-text-muted/70">
              {wristbandSerial(festival.id, festival.edition)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
