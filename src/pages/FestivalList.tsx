import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageShell from '../components/PageShell'
import FestivalCard from '../components/FestivalCard'
import { PlusIcon } from '../components/Icons'
import { useFestivals } from '../contexts/FestivalsContext'
import { statusOf, byStartDateAsc, byStartDateDesc } from '../lib/festival'
import type { FestivalType } from '../lib/types'

type StatusFilter = 'all' | 'upcoming' | 'live' | 'past'
type TypeFilter = 'all' | FestivalType

const statusFilters: StatusFilter[] = ['all', 'upcoming', 'live', 'past']
const typeFilters: TypeFilter[] = ['all', 'camping', 'day', 'urban']

export default function FestivalList() {
  const { t } = useTranslation()
  const { festivals } = useFestivals()
  const [status, setStatus] = useState<StatusFilter>('all')
  const [type, setType] = useState<TypeFilter>('all')

  useEffect(() => {
    document.title = `${t('festivals.title')} — Festival Wristband`
  }, [t])

  const filtered = useMemo(() => {
    return festivals
      .filter((f) => (status === 'all' ? true : statusOf(f) === status))
      .filter((f) => (type === 'all' ? true : f.type === type))
      .sort(status === 'past' ? byStartDateDesc : byStartDateAsc)
  }, [festivals, status, type])

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
    <PageShell
      title={t('festivals.title')}
      subtitle={t('festivals.count', { count: filtered.length })}
      right={addButton}
    >
      <div className="space-y-4">
        {/* Status segmented control */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                status === s ? 'bg-accent text-on-accent' : 'border border-border text-text-muted'
              }`}
            >
              {t(`filter.${s}`)}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {typeFilters.map((ty) => (
            <button
              key={ty}
              onClick={() => setType(ty)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                type === ty ? 'border border-accent text-accent' : 'border border-border text-text-muted'
              }`}
            >
              {ty === 'all' ? t('type.all') : t(`type.${ty}`)}
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((f) => (
              <FestivalCard key={f.id} festival={f} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-surface-card/50 p-8 text-center">
            <p className="text-sm text-text-secondary">
              {festivals.length === 0 ? t('festivals.emptyAll') : t('festivals.emptyFiltered')}
            </p>
            {festivals.length === 0 && (
              <Link
                to="/festivals/new"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-on-accent"
              >
                <PlusIcon size={16} />
                {t('common.addFestival')}
              </Link>
            )}
          </div>
        )}
      </div>
    </PageShell>
  )
}
