import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLang } from '@/i18n/LanguageContext';
import FitToPeople from './FitToPeople';

// Live OpenStreetMap tiles — community-updated continuously, no API key, zoomable
// to street level (19) so building footprints show. The view auto-fits every
// marker, so people far away are always visible instead of being cropped out.
// Each person is drawn as their own avatar (greyed out when offline); tapping one
// opens their profile. Pins are ~100 m-coarse and people sharing the same spot
// fan out in a small ring so every avatar stays tappable.
function avatarIcon(person) {
  const offline = person.online === false;
  const initial = (person.name || person.email || '?')[0].toUpperCase();
  const ring = offline ? 'rgba(140,155,210,0.55)' : person.color;
  const fill = offline ? 'rgba(30,34,55,0.95)' : `${person.color}33`;
  const ink = offline ? 'rgba(190,200,230,0.7)' : '#ffffff';
  const dot = offline ? 'rgba(140,155,210,0.6)' : '#34d399';
  return L.divIcon({
    className: '',
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    html: `
      <div style="position:relative;width:38px;height:38px;${offline ? 'filter:grayscale(0.85);' : ''}">
        <div style="width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;
                    font:700 14px/1 Inter,sans-serif;color:${ink};background:${fill};
                    border:2.5px solid ${ring};box-shadow:0 2px 8px rgba(0,0,0,0.5);backdrop-filter:blur(2px);">
          ${initial}
        </div>
        <span style="position:absolute;bottom:-1px;right:-1px;width:11px;height:11px;border-radius:50%;
                     background:${dot};border:2px solid #0b0e20;"></span>
      </div>`,
  });
}

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
            <Marker
              key={p.email}
              position={[p.plat, p.plng]}
              icon={avatarIcon(p)}
              eventHandlers={{ click: () => onOpen(p.email, p.name) }}
            >
              <Tooltip>
                {p.name}
                {' · '}{p.online ? t('chat.online') : t('chat.offlineSpot')}
                {p.same_network ? ` · ${t('chat.sameWifi')}` : p.distance_km !== null ? ` · ${p.distance_km} km` : ''}
                {' — '}{t('chat.tapProfile')}
              </Tooltip>
            </Marker>
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