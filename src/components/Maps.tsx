import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import type { Buyer } from '../data/seed'
import type { ListingRow } from './Shared'
import { gradeHex } from './ui'
import { inr, num } from '../lib/utils'

const TILE = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const ATTR = '&copy; OpenStreetMap'

export function ListingsMap({ rows, buyer, height = 300 }: { rows: ListingRow[]; buyer: Buyer; height?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line" style={{ height }}>
      <MapContainer center={[29.83, 76.42]} zoom={10} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer url={TILE} attribution={ATTR} />
        <CircleMarker center={[buyer.lat, buyer.lng]} radius={10} pathOptions={{ color: '#123C2A', fillColor: '#E3A62F', fillOpacity: 1, weight: 3 }}>
          <Tooltip direction="top" permanent offset={[0, -8]}>{buyer.short}</Tooltip>
        </CircleMarker>
        {rows.map(({ l, farmer, best, isNew }) => (
          <CircleMarker
            key={l.id}
            center={[farmer.lat, farmer.lng]}
            radius={6 + Math.min(10, l.tonnes / 2)}
            pathOptions={{ color: isNew ? '#D5573B' : '#fff', weight: isNew ? 3 : 2, fillColor: gradeHex[l.grade], fillOpacity: l.status === 'Paid' ? 0.35 : 0.9 }}
          >
            <Popup>
              <b>{farmer.name}</b> · {farmer.village}
              <br />
              {num(l.tonnes, 1)} t · Grade {l.grade} · {l.status}
              <br />
              Best offer: {best ? inr(best.price) + '/t' : '—'}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}

const stopIcon = (n: number) =>
  L.divIcon({
    className: 'stop-icon',
    html: `<div style="width:24px;height:24px;border-radius:999px;background:#123C2A;color:#fff;font:700 12px Lato,sans-serif;display:flex;align-items:center;justify-content:center;border:2px solid #E3A62F;box-shadow:0 2px 6px rgba(0,0,0,.3)">${n}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })

export function RouteMap({ start, stops, height = 170 }: { start: { lat: number; lng: number }; stops: { lat: number; lng: number; label: string }[]; height?: number }) {
  const pts: [number, number][] = [[start.lat, start.lng], ...stops.map((s) => [s.lat, s.lng] as [number, number])]
  const bounds = L.latLngBounds(pts.length > 1 ? pts : [[start.lat - 0.05, start.lng - 0.05], [start.lat + 0.05, start.lng + 0.05]])
  return (
    <div className="overflow-hidden rounded-xl border border-line" style={{ height }}>
      <MapContainer bounds={bounds.pad(0.25)} scrollWheelZoom={false} zoomControl={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer url={TILE} attribution={ATTR} />
        <Polyline positions={pts} pathOptions={{ color: '#D5573B', weight: 4, dashArray: '8 6' }} />
        <CircleMarker center={[start.lat, start.lng]} radius={8} pathOptions={{ color: '#fff', weight: 2, fillColor: '#E3A62F', fillOpacity: 1 }}>
          <Tooltip direction="top">Start · agent home</Tooltip>
        </CircleMarker>
        {stops.map((s, i) => (
          <Marker key={i} position={[s.lat, s.lng]} icon={stopIcon(i + 1)}>
            <Tooltip direction="top" offset={[0, -10]}>{s.label}</Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
