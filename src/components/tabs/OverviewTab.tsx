import { useTranslation } from 'react-i18next'
import CountdownTimer from '../CountdownTimer'
import StatTile from '../StatTile'
import RatingStars from '../RatingStars'
import { MapPinIcon, CalendarIcon, ClipboardIcon, WalletIcon, ExternalLinkIcon } from '../Icons'
import { durationDays, totalBudget, statusOf } from '../../lib/festival'
import { formatMoney } from '../../lib/format'
import type { Festival } from '../../lib/types'

export default function OverviewTab({ festival }: { festival: Festival }) {
  const { t, i18n } = useTranslation()
  const status = statusOf(festival)
  const checked = festival.checklist.filter((c) => c.checked).length
  const spent = totalBudget(festival)

  return (
    <div className="space-y-6 pb-4">
      {status !== 'past' && <CountdownTimer festival={festival} />}

      <div className="grid grid-cols-2 gap-2.5">
        <StatTile
          label={t('overview.duration')}
          value={durationDays(festival)}
          hint={t('overview.days', { count: durationDays(festival) })}
          icon={<CalendarIcon size={13} />}
          accent
        />
        <StatTile
          label={t('overview.checklist')}
          value={`${checked}/${festival.checklist.length}`}
          hint={t('overview.packed')}
          icon={<ClipboardIcon size={13} />}
          accent
        />
        <StatTile
          label={t('overview.budget')}
          value={formatMoney(spent, i18n.language)}
          hint={festival.budgetTarget ? t('overview.ofTarget', { target: formatMoney(festival.budgetTarget, i18n.language) }) : undefined}
          icon={<WalletIcon size={13} />}
          accent
        />
        <div className="rounded-2xl border border-border bg-surface-card p-4">
          <div className="flex items-center gap-1.5 text-text-muted">
            <MapPinIcon size={13} />
            <p className="text-[10px] font-semibold uppercase tracking-wider">{t('overview.location')}</p>
          </div>
          <p className="mt-1.5 text-base font-bold text-text-primary">{festival.location.city || '—'}</p>
          <p className="text-[11px] text-text-muted">{festival.location.country}</p>
        </div>
      </div>

      {/* Rating (attended) */}
      {festival.attended && (
        <div className="flex items-center justify-between rounded-2xl border border-border bg-surface-card p-4">
          <span className="text-sm text-text-secondary">{t('overview.rating')}</span>
          {festival.rating ? (
            <RatingStars value={festival.rating} size={20} />
          ) : (
            <span className="text-sm text-text-muted">{t('overview.notRated')}</span>
          )}
        </div>
      )}

      {/* Genres */}
      {festival.genres.length > 0 && (
        <div>
          <h3 className="pass-heading mb-2 text-xs tracking-widest text-text-muted">{t('overview.genres')}</h3>
          <div className="flex flex-wrap gap-2">
            {festival.genres.map((g) => (
              <span
                key={g}
                className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-accent"
              >
                {g}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Links */}
      {festival.links.length > 0 && (
        <div>
          <h3 className="pass-heading mb-2 text-xs tracking-widest text-text-muted">{t('overview.links')}</h3>
          <div className="space-y-2">
            {festival.links.map((l, i) => (
              <a
                key={i}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 rounded-2xl border border-accent/40 bg-accent/10 p-3.5 transition-colors active:bg-accent/20"
              >
                <span className="min-w-0 truncate text-sm font-semibold text-accent">{l.label}</span>
                <ExternalLinkIcon size={16} className="shrink-0 text-accent" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
