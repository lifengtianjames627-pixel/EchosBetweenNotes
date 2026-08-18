import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, CircleMarker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { X, Crosshair, Check } from 'lucide-react';
import { useLang } from '@/i18n/LanguageContext';

// Desktop browsers have no GPS — they estimate position from Wi-Fi/IP, which is
// kilometres-coarse and cannot be improved by any API. So the reliable fix is
// letting the user place the pin themselves: click the map, confirm, done.
function ClickCatcher({ onPick }) {
  useMapEvents({ click: (e) => onPick([e.latlng.lat, e.latlng.lng]) });
  return null;
}

export default function LocationPicker({ V, initialCenter, onConfirm, onClose }) {
  const { t } = useLang();
  const [pin, setPin] = useState(initialCenter || null);
  const center = initialCenter || [35.6762, 139.6503];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[310] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ type: 'spring', damping: 22, stiffness: 260 }}
        className="w-full max-w-lg rounded-2xl p-5"
        style={{ background: 'rgba(10,13,32,0.98)', border: '1px solid rgba(124,111,255,0.3)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <p className="flex items-center gap-2 font-playfair italic text-lg" style={{ color: '#e8e9ff' }}>
            <Crosshair className="w-4 h-4" style={{ color: V.accent }} /> {t('picker.title')}
          </p>
          <button onClick={onClose} style={{ color: V.muted }}><X className="w-4 h-4" /></button>
        </div>
        <p className="text-[11px] leading-relaxed mb-3" style={{ color: V.muted }}>{t('picker.help')}</p>

        <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${V.border}`, height: 300 }}>
          <MapContainer center={center} zoom={initialCenter ? 16 : 13} maxZoom={19} style={{ height: '100%', width: '100%', background: '#0b0e20' }}>
            {/* Live OSM tiles, zoomable to level 19 — building footprints render
                from ~level 15, so the pin can be dropped on an exact building. */}
            <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} attribution="&copy; OpenStreetMap contributors" />
            <ClickCatcher onPick={setPin} />
            {pin && (
              <CircleMarker center={pin} radius={9}
                pathOptions={{ color: '#a5b4fc', fillColor: '#a5b4fc', fillOpacity: 0.9 }} />
            )}
          </MapContainer>
        </div>

        <button
          disabled={!pin}
          onClick={() => onConfirm(pin)}
          className="w-full mt-3 py-2.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2"
          style={{
            background: 'rgba(124,111,255,0.2)',
            border: '1px solid rgba(124,111,255,0.4)',
            color: '#c4baff',
            opacity: pin ? 1 : 0.45,
          }}
        >
          <Check className="w-4 h-4" /> {t('picker.confirm')}
        </button>
      </motion.div>
    </motion.div>
  );
}