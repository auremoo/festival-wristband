import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { Festival } from '../lib/types'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function getTimeLeft(festival: Festival): TimeLeft | 'live' | 'past' {
  const now = Date.now()
  const start = new Date(festival.dates.start + 'T00:00:00').getTime()
  const end = new Date((festival.dates.end || festival.dates.start) + 'T23:59:59').getTime()

  if (now >= start && now <= end) return 'live'
  if (now > end) return 'past'

  const diff = start - now
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export default function CountdownTimer({ festival }: { festival: Festival }) {
  const { t } = useTranslation()
  const [timeLeft, setTimeLeft] = useState<TimeLeft | 'live' | 'past'>(() => getTimeLeft(festival))

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft(festival)), 1000)
    return () => clearInterval(timer)
  }, [festival])

  if (timeLeft === 'live') {
    return (
      <div className="accent-glow rounded-2xl border border-accent bg-accent/10 p-6 text-center">
        <p className="pass-heading animate-pass-pulse text-2xl text-accent">{t('countdown.live')}</p>
        <p className="mt-1 text-sm text-text-secondary">{t('countdown.liveSub', { name: festival.name })}</p>
      </div>
    )
  }

  if (timeLeft === 'past') {
    return (
      <div className="rounded-2xl border border-border bg-surface-card p-6 text-center">
        <p className="text-lg text-text-secondary">{t('countdown.past')}</p>
      </div>
    )
  }

  const blocks = [
    { value: timeLeft.days, label: t('countdown.days') },
    { value: timeLeft.hours, label: t('countdown.hours') },
    { value: timeLeft.minutes, label: t('countdown.minutes') },
    { value: timeLeft.seconds, label: t('countdown.seconds') },
  ]

  return (
    <div>
      <h2 className="pass-heading mb-3 text-center text-xs tracking-widest text-text-muted">
        {t('countdown.title')}
      </h2>
      <div className="grid grid-cols-4 gap-2.5">
        {blocks.map((b) => (
          <div key={b.label} className="rounded-2xl border border-border bg-surface-card p-3 text-center">
            <div className="text-2xl font-black tabular-nums text-accent sm:text-3xl">
              {String(b.value).padStart(2, '0')}
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-wider text-text-muted">{b.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
