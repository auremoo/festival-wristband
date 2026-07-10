import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import WristbandChip from '../components/WristbandChip'
import {
  ChevronLeftIcon, EditIcon, TrashIcon, InfoIcon, ClipboardIcon,
  WalletIcon, CloudSunIcon, MusicIcon, NoteIcon,
} from '../components/Icons'
import { useFestivals } from '../contexts/FestivalsContext'
import { applyAccent } from '../lib/accent'
import { statusOf } from '../lib/festival'
import OverviewTab from '../components/tabs/OverviewTab'
import ChecklistTab from '../components/tabs/ChecklistTab'
import BudgetTab from '../components/tabs/BudgetTab'
import WeatherTab from '../components/tabs/WeatherTab'
import TimetableTab from '../components/tabs/TimetableTab'
import NotesTab from '../components/tabs/NotesTab'

type TabId = 'overview' | 'checklist' | 'budget' | 'weather' | 'timetable' | 'notes'

const TABS: { id: TabId; Icon: typeof InfoIcon }[] = [
  { id: 'overview', Icon: InfoIcon },
  { id: 'checklist', Icon: ClipboardIcon },
  { id: 'budget', Icon: WalletIcon },
  { id: 'weather', Icon: CloudSunIcon },
  { id: 'timetable', Icon: MusicIcon },
  { id: 'notes', Icon: NoteIcon },
]

export default function FestivalDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const { getFestival, removeFestival, activeFestival } = useFestivals()
  const festival = getFestival(id ?? '')
  const [tab, setTab] = useState<TabId>('overview')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const accentColor = festival?.accentColor
  // Theme the whole hub in this festival's color; restore active festival on exit.
  useEffect(() => {
    if (accentColor) applyAccent(accentColor)
    return () => applyAccent(activeFestival?.accentColor ?? null)
  }, [accentColor, activeFestival])

  useEffect(() => {
    if (festival) document.title = `${festival.name} — Festival Wristband`
  }, [festival])

  if (!festival) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center" style={{ paddingBottom: 100 }}>
        <p className="text-text-secondary">{t('detail.notFound')}</p>
        <Link to="/festivals" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-on-accent">
          {t('detail.backToList')}
        </Link>
      </div>
    )
  }

  const status = statusOf(festival)

  return (
    <div className="flex flex-1 flex-col" style={{ paddingBottom: 'calc(84px + env(safe-area-inset-bottom, 0px))' }}>
      {/* Header */}
      <div className="noise-bg relative bg-gradient-to-b from-accent/15 via-surface to-surface px-4 pb-4 pt-6">
        <div className="relative z-10">
          <div className="mb-3 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="-ml-2 flex items-center gap-1 rounded-lg py-1 pl-1 pr-2 text-sm text-text-muted transition-colors hover:text-text-primary"
            >
              <ChevronLeftIcon size={18} />
              {t('common.back')}
            </button>
            <div className="flex items-center gap-1">
              <Link
                to={`/festivals/${festival.id}/edit`}
                className="rounded-lg p-2.5 text-text-muted transition-colors hover:text-text-primary"
                aria-label={t('common.edit')}
              >
                <EditIcon size={18} />
              </Link>
              <button
                onClick={() => setConfirmDelete(true)}
                className="rounded-lg p-2.5 text-text-muted transition-colors hover:text-red-400"
                aria-label={t('common.delete')}
              >
                <TrashIcon size={18} />
              </button>
            </div>
          </div>
          <WristbandChip festival={festival} status={status} />
        </div>
      </div>

      {/* Sticky tab bar */}
      <div
        className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur-md"
      >
        <div className="flex gap-1 overflow-x-auto px-3 py-2">
          {TABS.map(({ id: tid, Icon }) => (
            <button
              key={tid}
              onClick={() => setTab(tid)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                tab === tid ? 'bg-accent text-on-accent' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <Icon size={15} />
              {t(`tabs.${tid}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-4 pt-4">
        {tab === 'overview' && <OverviewTab festival={festival} />}
        {tab === 'checklist' && <ChecklistTab festival={festival} />}
        {tab === 'budget' && <BudgetTab festival={festival} />}
        {tab === 'weather' && <WeatherTab festival={festival} />}
        {tab === 'timetable' && <TimetableTab festival={festival} />}
        {tab === 'notes' && <NotesTab festival={festival} />}
      </div>

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 md:items-center" onClick={() => setConfirmDelete(false)}>
          <div
            className="w-full max-w-sm rounded-2xl border border-border bg-surface-card p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="pass-heading text-lg text-text-primary">{t('detail.deleteTitle')}</h3>
            <p className="mt-2 text-sm text-text-secondary">{t('detail.deleteBody', { name: festival.name })}</p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 rounded-xl border border-border py-3 text-sm font-semibold text-text-secondary"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => {
                  removeFestival(festival.id)
                  navigate('/festivals')
                }}
                className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-bold uppercase tracking-wider text-white"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
