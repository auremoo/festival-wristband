import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { statusOf } from '../lib/festival'
import { formatDateRange } from '../lib/format'
import type { Festival } from '../lib/types'

interface Props {
  festivals: Festival[]
  lang: string
  className?: string
}

const SIZE: Record<string, number> = { live: 22, past: 16, upcoming: 12 }

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string,
  )
}

export default function MapView({ festivals, lang, className = '' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: [48.5, 6],
      zoom: 4,
      zoomControl: true,
      attributionControl: true,
    })
    mapRef.current = map

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map)

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // (Re)draw markers whenever the festival list changes.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const layer = L.layerGroup().addTo(map)
    const points: L.LatLngExpression[] = []

    festivals.forEach((f) => {
      const { lat, lon } = f.location
      if (!Number.isFinite(lat) || !Number.isFinite(lon) || (lat === 0 && lon === 0)) return
      const st = statusOf(f)
      const size = SIZE[st]
      const color = f.accentColor

      const icon = L.divIcon({
        className: '',
        html: `<div class="pass-map-dot ${st === 'live' ? 'is-live' : ''}" style="width:${size}px;height:${size}px;background:${color};color:${color};"></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      })

      const stars = f.rating ? '★'.repeat(f.rating) + '☆'.repeat(5 - f.rating) : ''
      const popup = `
        <div style="min-width:150px">
          <div style="font-weight:800;text-transform:uppercase;letter-spacing:.03em;color:${color}">${escapeHtml(f.name)}</div>
          <div style="font-size:12px;color:#a3a3a3;margin-top:2px">${escapeHtml(f.location.city)}, ${escapeHtml(f.location.country)}</div>
          <div style="font-size:12px;color:#fafafa;margin-top:2px">${escapeHtml(formatDateRange(f.dates.start, f.dates.end, lang))}</div>
          ${stars ? `<div style="color:${color};margin-top:4px;letter-spacing:2px">${stars}</div>` : ''}
          <a href="#/festivals/${f.id}" style="display:inline-block;margin-top:8px;font-size:12px;font-weight:700;color:${color}">→</a>
        </div>`

      const marker = L.marker([lat, lon], { icon }).addTo(layer)
      marker.bindPopup(popup)
      points.push([lat, lon])
    })

    if (points.length === 1) {
      map.setView(points[0], 6)
    } else if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points).pad(0.25), { maxZoom: 8 })
    }

    return () => {
      layer.remove()
    }
  }, [festivals, lang])

  return <div ref={containerRef} className={className} />
}
