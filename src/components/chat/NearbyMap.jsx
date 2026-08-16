import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Free OpenStreetMap tiles — no API key, no billing. Positions are the coarse
// (~1km) ones the server returns, so nobody's exact spot is ever plotted.
export default function NearbyMap({ V, center, people, onOpen }) {
  const pinned = people.filter(p => typeof p.lat === 'number' && typeof p.lng === 'number');

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${V.border}`, height: 260 }}>
      <MapContainer center={center} zoom={11} style={{ height: '100%', width: '100%', background: '#0b0e20' }} scrollWheelZoom={false}>
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <CircleMarker center={center} radius={7} pathOptions={{ color: '#a5b4fc', fillColor: '#a5b4fc', fillOpacity: 0.9 }}>
          <Tooltip>You (approximate)</Tooltip>
        </CircleMarker>
        {pinned.map(p => (
          <CircleMarker
            key={p.email}
            center={[p.lat, p.lng]}
            radius={8}
            pathOptions={{ color: '#f0abfc', fillColor: '#c084fc', fillOpacity: 0.85 }}
            eventHandlers={{ click: () => onOpen(p.email, p.name) }}
          >
            <Tooltip>
              {p.name}{p.distance_km !== null ? ` · ${p.distance_km} km` : ''} — tap to chat
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}