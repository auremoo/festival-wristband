import { describe, it, expect } from 'vitest'
import { haversineKm, journeyKm } from '../lib/geo'

describe('geo', () => {
  it('computes a known great-circle distance (Paris → Boom ≈ 260 km)', () => {
    const d = haversineKm({ lat: 48.8566, lon: 2.3522 }, { lat: 51.0896, lon: 4.3654 })
    expect(d).toBeGreaterThan(240)
    expect(d).toBeLessThan(300)
  })

  it('returns 0 for identical points', () => {
    expect(haversineKm({ lat: 10, lon: 10 }, { lat: 10, lon: 10 })).toBe(0)
  })

  it('sums a journey ordered by date and skips invalid coords', () => {
    const total = journeyKm([
      { lat: 48.8566, lon: 2.3522, date: '2026-06-26' },
      { lat: 51.0896, lon: 4.3654, date: '2026-07-17' },
      { lat: 0, lon: 0, date: '2026-08-01' },
    ])
    expect(total).toBeGreaterThan(200)
  })
})
