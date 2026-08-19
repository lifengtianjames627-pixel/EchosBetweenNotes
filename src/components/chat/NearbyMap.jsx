import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useLang } from '@/i18n/LanguageContext';
import FitToPeople from './FitToPeople';

// Live OpenStreetMap tiles — community-updated continuously, no API key, zoomable
// to street level (19) so building footprints show. The view auto-fits every
// marker, so people far away are always visible instead of being cropped out.
// Other people's pins are ~100 m-coarse; people sharing the same spot (e.g. the
// same Wi-Fi) fan out in a small ring, each in its own rainbow color.
export default function NearbyMap({ V, center, people, onOpen }) {
  const { t } = useLang();
  const pinned = people.filter(p => typeof p.lat === 'number' && typeof p.lng === 'number');
  const missing = people.length - pinned.length;

  const seen = new Map();
  seen.set(`${center[0].toFixed(3)},${center[1].toFixed(3)}`, 1); // my own marker
  const placed = pinned.map(p => {
    const key = `${p.lat.toFixed(3)},${p.lng.toFixed(3)}`;
    const n = seen.get(key) || 0;
    seen.set(key, n + 1);
    if (n === 0) return { ...p, plat: p.lat, plng: p.lng };
    const angle = (n - 1) * (Math.PI / 3);
    const r = 0.0009; // ~100 m fan-out ring so stacked pins stay tappable
    return { ...p, plat: p.lat + Math.sin(angle) * r, plng: p.lng + Math.cos(angle) * r };
  });

  const points = [center, ...placed.map(p => [p.plat, p.plng])];

  return (
    <div>
      <div
        className="rounded-2xl overflow-hidden relative z-0 h-[320px] sm:h-[260px]"
        style={{ border: `1px solid ${V.border}`, isolation: 'isolate' }}
      >
        <MapContainer
          center={center}
          zoom={15}
          maxZoom={19}
          style={{ height: '100%', width: '100%', background: '#0b0e20' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
            attribution="&copy; OpenStreetMap contributors"
          />
          <FitToPeople points={points} />
          <CircleMarker center={center} radius={7} pathOptions={{ color: '#a5b4fc', fillColor: '#a5b4fc', fillOpacity: 0.9 }}>
            <Tooltip>{t('chat.mapYou')}</Tooltip>
          </CircleMarker>
          {placed.map(p => (
            <CircleMarker
              key={p.email}
              center={[p.plat, p.plng]}
              radius={9}
              pathOptions={{ color: p.color, fillColor: p.color, fillOpacity: 0.85, weight: 3 }}
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
      {missing > 0 && (
        <p className="text-[10px] mt-1.5 px-1 leading-relaxed" style={{ color: V.muted }}>
          {t('chat.mapMissing', { n: missing })}
        </p>
      )}
    </div>
  );
}