// Great-circle distance helpers for the "km traveled" stat.

const EARTH_RADIUS_KM = 6371

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

/** Haversine distance in kilometres between two lat/lon points. */
export function haversineKm(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
): number {
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}

/**
 * Total distance of a "festival journey": the sum of great-circle distances
 * between consecutive festivals ordered by start date. Points without valid
 * coordinates are skipped.
 */
export function journeyKm(
  points: Array<{ lat: number; lon: number; date: string }>,
): number {
  const valid = points
    .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon) && (p.lat !== 0 || p.lon !== 0))
    .sort((a, b) => a.date.localeCompare(b.date))
  let total = 0
  for (let i = 1; i < valid.length; i++) {
    total += haversineKm(valid[i - 1], valid[i])
  }
  return Math.round(total)
}
