import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { HomeIcon, TicketIcon, MapIcon, HistoryIcon, SettingsIcon } from './Icons'

const navItems = [
  { to: '/', Icon: HomeIcon, labelKey: 'nav.dashboard', end: true },
  { to: '/festivals', Icon: TicketIcon, labelKey: 'nav.festivals', end: false },
  { to: '/map', Icon: MapIcon, labelKey: 'nav.map', end: false },
  { to: '/history', Icon: HistoryIcon, labelKey: 'nav.history', end: false },
  { to: '/settings', Icon: SettingsIcon, labelKey: 'nav.settings', end: false },
]

export default function BottomNav() {
  const { t } = useTranslation()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-[#0d0d0d]/95 backdrop-blur-md md:left-1/2 md:right-auto md:w-[430px] md:-translate-x-1/2"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div
        className="mx-auto flex"
        style={{ paddingLeft: 'env(safe-area-inset-left, 0px)', paddingRight: 'env(safe-area-inset-right, 0px)' }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] uppercase tracking-wider transition-colors ${
                isActive ? 'text-accent' : 'text-text-muted hover:text-text-secondary'
              }`
            }
          >
            <item.Icon size={22} />
            <span>{t(item.labelKey)}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
