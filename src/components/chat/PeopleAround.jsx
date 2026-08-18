import React, { useState } from 'react';
import { MapPin, List, Map as MapIcon, Wifi } from 'lucide-react';
import { peerColor } from './peerColors';
import ChatSection from './ChatSection';
import PeerRow from './PeerRow';
import LocationShareBar from './LocationShareBar';
import NearbyMap from './NearbyMap';
import { useLang } from '@/i18n/LanguageContext';

// People currently active on the band board — closest first when the viewer has
// shared their location, otherwise same city, and always inside their age bracket.
export default function PeopleAround({ V, nearby, loading, city, matchedCity, located, myLat, myLng, isPinned, onTogglePin, onOpen }) {
  const [view, setView] = useState('list');
  const { t } = useLang();
  const hint = located ? t('chat.closestFirst') : matchedCity && city ? t('chat.inCity', { c: city }) : t('chat.onBoard');
  const canMap = located && typeof myLat === 'number' && typeof myLng === 'number';
  const people = nearby.map((p, i) => ({ ...p, color: peerColor(i) }));

  return (
    <ChatSection V={V} icon={MapPin} label={t('chat.around')} hint={hint} count={nearby.length}>
      <LocationShareBar V={V} located={located} />

      <p className="flex items-start gap-1.5 text-[10px] leading-relaxed mb-2 px-1" style={{ color: V.muted }}>
        <Wifi className="w-3 h-3 shrink-0 mt-0.5" style={{ color: V.accent }} />
        {t('chat.wifiNote')}
      </p>

      {canMap && (
        <div className="flex gap-1.5 mb-2">
          {[
            { id: 'list', label: t('chat.list'), icon: List },
            { id: 'map', label: t('chat.map'), icon: MapIcon },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold"
              style={view === t.id
                ? { background: 'rgba(124,111,255,0.22)', border: '1px solid rgba(124,111,255,0.4)', color: V.accent }
                : { background: 'rgba(255,255,255,0.04)', border: `1px solid ${V.border}`, color: V.muted }}
            >
              <t.icon className="w-3 h-3" /> {t.label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-1.5">
          {[0, 1].map(i => <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: 'rgba(124,111,255,0.08)' }} />)}
        </div>
      ) : canMap && view === 'map' ? (
        <NearbyMap V={V} center={[myLat, myLng]} people={people} onOpen={onOpen} />
      ) : nearby.length === 0 ? (
        <p className="text-xs px-4 py-4 rounded-2xl" style={{ color: V.muted, background: 'rgba(255,255,255,0.03)', border: `1px dashed ${V.border}` }}>
          {t('chat.nearbyEmpty')}
        </p>
      ) : (
        <div className="space-y-1.5">
          {people.map(p => (
            <PeerRow
              key={p.email}
              V={V}
              name={p.name}
              email={p.email}
              color={p.color}
              subtitle={[
                p.same_network ? t('chat.sameWifi') : null,
                !p.same_network && p.distance_km !== null && p.distance_km !== undefined
                  ? p.distance_km < 1 ? t('chat.underKm') : t('chat.kmAway', { km: p.distance_km })
                  : null,
                p.city,
                p.school,
                p.kind ? (p.kind === 'band' ? t('sm.bandRecruiting') : t('sm.playerAvailable')) : null,
              ].filter(Boolean).join(' · ')}
              pinned={isPinned(p.email)}
              onOpen={() => onOpen(p.email, p.name)}
              onTogglePin={() => onTogglePin({ peer_email: p.email, peer_name: p.name })}
            />
          ))}
        </div>
      )}
    </ChatSection>
  );
}