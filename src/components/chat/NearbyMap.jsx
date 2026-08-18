import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useLang } from '@/i18n/LanguageContext';

// Live OpenStreetMap tiles — the map is re-rendered from the OSM database, which
// is community-updated continuously (new buildings usually appear within minutes
// of being mapped), no API key needed. Zoom in to street level (up to 19) to see
// individual building footprints. Other people's pins are ~100 m-coarse; people
// sharing the same spot (e.g. same Wi-Fi) fan out in a small ring, each marker
// in its own rainbow color matching the list.
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
    const r = 0.0009; // ~100 m fan-out ring
    return { ...p, plat: p.lat + Math.sin(angle) * r, plng: p.lng + Math.cos(angle) * r };
  });

  return (
    <div className="rounded-2xl overflow-hidden relative z-0" style={{ border: `1px solid ${V.border}`, height: 260, isolation: 'isolate' }}>
      <MapContainer center={center} zoom={15} maxZoom={19} style={{ height: '100%', width: '100%', background: '#0b0e20' }} scrollWheelZoom={true}>
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
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