import { StarIcon } from './Icons'

interface Props {
  value: number | null
  size?: number
  /** When provided, stars become interactive. */
  onChange?: (value: number) => void
  className?: string
}

export default function RatingStars({ value, size = 16, onChange, className = '' }: Props) {
  const rating = value ?? 0
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= rating
        const star = (
          <StarIcon
            size={size}
            filled={filled}
            className={filled ? 'text-accent' : 'text-text-muted'}
          />
        )
        if (!onChange) return <span key={n}>{star}</span>
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n === value ? 0 : n)}
            className="p-1 transition-transform active:scale-90"
            aria-label={`${n}`}
          >
            {star}
          </button>
        )
      })}
    </div>
  )
}
