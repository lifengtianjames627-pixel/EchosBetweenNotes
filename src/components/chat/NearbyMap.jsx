import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useLang } from '@/i18n/LanguageContext';

// Free OpenStreetMap tiles — no API key, no billing. Positions are the coarse
// (~1km) ones the server returns, so nobody's exact spot is ever plotted.
// People sharing the same coarse spot (e.g. same Wi-Fi) are fanned out in a
// small ring so every marker stays visible, each in its own rainbow color.
export default function NearbyMap({ V, center, people, onOpen }) {
  const { t } = useLang();
  const pinned = people.filter(p => typeof p.lat === 'number' && typeof p.lng === 'number');

  const seen = new Map();
  seen.set(`${center[0]},${center[1]}`, 1); // my own marker occupies the center
  const placed = pinned.map(p => {
    const key = `${p.lat},${p.lng}`;
    const n = seen.get(key) || 0;
    seen.set(key, n + 1);
    if (n === 0) return { ...p, plat: p.lat, plng: p.lng };
    const angle = (n - 1) * (Math.PI / 3);
    const r = 0.004; // ~400 m fan-out ring
    return { ...p, plat: p.lat + Math.sin(angle) * r, plng: p.lng + Math.cos(angle) * r };
  });

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${V.border}`, height: 260 }}>
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%', background: '#0b0e20' }} scrollWheelZoom={false}>
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <CircleMarker center={center} radius={7} pathOptions={{ color: '#a5b4fc', fillColor: '#a5b4fc', fillOpacity: 0.9 }}>
          <Tooltip>{t('chat.mapYou')}</Tooltip>
        </CircleMarker>
        {placed.map(p => (
          <CircleMarker
            key={p.email}
            center={[p.plat, p.plng]}
            radius={8}
            pathOptions={{ color: p.color, fillColor: p.color, fillOpacity: 0.85 }}
            eventHandlers={{ click: () => onOpen(p.email, p.name) }}
          >
            <Tooltip>
              {p.name}
              {p.same_network ? ` · ${t('chat.sameWifi')}` : p.distance_km !== null ? ` · ${p.distance_km} km` : ''}
              {' — '}{t('chat.tapToChat')}
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}