import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { PlanItem } from '../lib/planOfDay'

const PRIORITY_COLORS: Record<string, string> = {
  High: '#dc2626',
  Medium: '#d97706',
  Low: '#16a34a',
}

export default function JobSiteMap({ items }: { items: PlanItem[] }) {
  if (items.length === 0) return null
  const centerLat = items.reduce((s, i) => s + i.asset.latitude, 0) / items.length
  const centerLon = items.reduce((s, i) => s + i.asset.longitude, 0) / items.length

  return (
    <div className="h-96 overflow-hidden rounded-xl border border-slate-200" data-testid="job-site-map">
      <MapContainer center={[centerLat, centerLon]} zoom={11} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {items.map((item) => (
          <CircleMarker
            key={item.id}
            center={[item.asset.latitude, item.asset.longitude]}
            radius={10}
            pathOptions={{
              color: PRIORITY_COLORS[item.priority],
              fillColor: PRIORITY_COLORS[item.priority],
              fillOpacity: 0.6,
            }}
          >
            <Popup>
              <strong>{item.title}</strong>
              <br />
              {item.asset.name}
              <br />
              Priority: {item.priority}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}
