import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertIcon } from '../Icons'
import { festivalDays, statusOf, daysUntil } from '../../lib/festival'
import { formatDay } from '../../lib/format'
import type { Festival } from '../../lib/types'

function decodeWeather(code: number): { emoji: string; key: string } {
  if (code === 0) return { emoji: '☀️', key: 'clear' }
  if (code === 1) return { emoji: '🌤️', key: 'mainlyClear' }
  if (code === 2) return { emoji: '⛅', key: 'partlyCloudy' }
  if (code === 3) return { emoji: '☁️', key: 'overcast' }
  if (code <= 48) return { emoji: '🌫️', key: 'fog' }
  if (code <= 55) return { emoji: '🌦️', key: 'drizzle' }
  if (code <= 65) return { emoji: '🌧️', key: 'rain' }
  if (code <= 75) return { emoji: '❄️', key: 'snow' }
  if (code <= 82) return { emoji: '🌨️', key: 'showers' }
  if (code <= 99) return { emoji: '⛈️', key: 'thunderstorm' }
  return { emoji: '🌡️', key: 'unknown' }
}

interface DayForecast {
  date: string
  weatherCode: number
  tempMax: number
  tempMin: number
  rainProbability: number
}
interface Current {
  temp: number
  weatherCode: number
  windspeed: number
}

export default function WeatherTab({ festival }: { festival: Festival }) {
  const { t, i18n } = useTranslation()
  const { lat, lon } = festival.location
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lon) && (lat !== 0 || lon !== 0)
  const days = festivalDays(festival)
  const status = statusOf(festival)

  const [current, setCurrent] = useState<Current | null>(null)
  const [forecast, setForecast] = useState<DayForecast[] | null>(null)
  const [loading, setLoading] = useState(hasCoords)
  const [error, setError] = useState(false)

  // How many days until the 16-day forecast window opens (0 = open now).
  const daysUntilStart = daysUntil(festival)
  const forecastOpen = daysUntilStart <= 16

  useEffect(() => {
    if (!hasCoords) return
    let cancelled = false
    async function run() {
      try {
        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
          `&current=temperature_2m,weathercode,windspeed_10m` +
          `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
          `&timezone=auto&forecast_days=16`
        const res = await fetch(url)
        if (!res.ok) throw new Error('fetch failed')
        const data = await res.json()
        if (cancelled) return
        setCurrent({
          temp: Math.round(data.current.temperature_2m),
          weatherCode: data.current.weathercode,
          windspeed: Math.round(data.current.windspeed_10m),
        })
        const times: string[] = data.daily.time
        const map: Record<string, DayForecast> = {}
        times.forEach((d, i) => {
          map[d] = {
            date: d,
            weatherCode: data.daily.weathercode[i],
            tempMax: Math.round(data.daily.temperature_2m_max[i]),
            tempMin: Math.round(data.daily.temperature_2m_min[i]),
            rainProbability: data.daily.precipitation_probability_max[i] ?? 0,
          }
        })
        const found = days.map((d) => map[d]).filter(Boolean) as DayForecast[]
        setForecast(found.length ? found : null)
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [festival.id, lat, lon])

  if (!hasCoords) {
    return (
      <div className="rounded-2xl border border-border bg-surface-card p-6 text-center">
        <AlertIcon size={22} className="mx-auto mb-2 text-text-muted" />
        <p className="text-sm text-text-secondary">{t('weather.noCoords')}</p>
      </div>
    )
  }

  const maxRain = forecast ? Math.max(...forecast.map((d) => d.rainProbability)) : 0

  return (
    <div className="space-y-4 pb-4">
      {/* Current */}
      <div className="rounded-2xl border border-border bg-surface-card p-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-text-muted">
          {t('weather.now', { city: festival.location.city })}
        </p>
        {loading && <p className="text-sm text-text-muted">{t('weather.loading')}</p>}
        {error && !loading && <p className="text-sm text-text-muted">{t('weather.error')}</p>}
        {current && !loading && (
          <div className="flex items-center gap-4">
            <span className="text-4xl">{decodeWeather(current.weatherCode).emoji}</span>
            <div>
              <p className="text-2xl font-bold text-text-primary">{current.temp}°C</p>
              <p className="text-sm text-text-secondary">{t(`weather.codes.${decodeWeather(current.weatherCode).key}`)}</p>
              <p className="text-xs text-text-muted">{t('weather.wind', { speed: current.windspeed })}</p>
            </div>
          </div>
        )}
      </div>

      {/* Forecast status */}
      {status === 'past' ? (
        <div className="rounded-2xl border border-border bg-surface-card p-3">
          <p className="text-xs text-text-muted">{t('weather.pastNote')}</p>
        </div>
      ) : !forecastOpen ? (
        <div className="rounded-2xl border border-accent/30 bg-accent/10 p-3">
          <p className="text-xs font-medium text-accent">{t('weather.unlocks', { days: daysUntilStart - 16 })}</p>
          <p className="mt-0.5 text-[11px] text-text-muted">{t('weather.unlocksNote')}</p>
        </div>
      ) : forecast && !loading ? (
        <>
          <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-3">
            <p className="text-xs font-medium text-green-400">{t('weather.liveForecast')}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {forecast.map((day) => {
              const w = decodeWeather(day.weatherCode)
              return (
                <div key={day.date} className="rounded-2xl border border-border bg-surface-card p-3">
                  <p className="text-xs font-semibold text-text-primary">{formatDay(day.date, i18n.language)}</p>
                  <div className="my-2 text-2xl">{w.emoji}</div>
                  <p className="text-xs font-medium text-text-secondary">{t(`weather.codes.${w.key}`)}</p>
                  <p className="mt-1 text-sm font-bold text-text-primary">{day.tempMax}° / {day.tempMin}°C</p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface-elevated">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: `${day.rainProbability}%` }} />
                    </div>
                    <span className="text-[10px] text-text-muted">{day.rainProbability}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        !loading && !error && (
          <div className="rounded-2xl border border-border bg-surface-card p-3">
            <p className="text-xs text-text-muted">{t('weather.noDays')}</p>
          </div>
        )
      )}

      {/* Advice */}
      {forecast && maxRain >= 40 && (
        <div className="flex items-start gap-2 rounded-2xl border border-border bg-surface-card p-4 text-sm text-text-secondary">
          <span className="text-base">🧥</span>
          {t('weather.rainAdvice')}
        </div>
      )}
    </div>
  )
}
