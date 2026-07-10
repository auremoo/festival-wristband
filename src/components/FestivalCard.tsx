import { Link } from 'react-router-dom'
import WristbandChip from './WristbandChip'
import type { FestivalStatus } from '../lib/festival'
import type { Festival } from '../lib/types'

interface Props {
  festival: Festival
  status?: FestivalStatus
  compact?: boolean
}

/** A tappable wristband linking to the festival hub. */
export default function FestivalCard({ festival, status, compact }: Props) {
  return (
    <Link
      to={`/festivals/${festival.id}`}
      className="block rounded-2xl transition-transform active:scale-[0.985]"
    >
      <WristbandChip festival={festival} status={status} compact={compact} />
    </Link>
  )
}
