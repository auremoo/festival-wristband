import { useTranslation } from 'react-i18next'
import type { FestivalStatus } from '../lib/festival'

interface Props {
  status: FestivalStatus
  className?: string
}

export default function StatusBadge({ status, className = '' }: Props) {
  const { t } = useTranslation()

  const styles: Record<FestivalStatus, string> = {
    live: 'bg-accent text-on-accent animate-pass-pulse',
    upcoming: 'border border-accent/50 text-accent',
    past: 'border border-border text-text-muted',
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${styles[status]} ${className}`}
    >
      {status === 'live' && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {t(`status.${status}`)}
    </span>
  )
}
