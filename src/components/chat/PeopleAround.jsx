import React, { useState } from 'react';
import { MapPin, List, Map as MapIcon } from 'lucide-react';
import ChatSection from './ChatSection';
import PeerRow from './PeerRow';
import LocationShareBar from './LocationShareBar';
import NearbyMap from './NearbyMap';

// People currently active on the band board — closest first when the viewer has
// shared their location, otherwise same city, and always inside their age bracket.
export default function PeopleAround({ V, nearby, loading, city, matchedCity, located, myLat, myLng, isPinned, onTogglePin, onOpen }) {
  const [view, setView] = useState('list');
  const hint = located ? 'closest first' : matchedCity && city ? `in ${city}` : 'on the board';
  const canMap = located && typeof myLat === 'number' && typeof myLng === 'number';

  return (
    <ChatSection V={V} icon={MapPin} label="People around you" hint={hint} count={nearby.length}>
      <LocationShareBar V={V} located={located} />

      {canMap && (
        <div className="flex gap-1.5 mb-2">
          {[
            { id: 'list', label: 'List', icon: List },
            { id: 'map', label: 'Map', icon: MapIcon },
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
        <NearbyMap V={V} center={[myLat, myLng]} people={nearby} onOpen={onOpen} />
      ) : nearby.length === 0 ? (
        <p className="text-xs px-4 py-4 rounded-2xl" style={{ color: V.muted, background: 'rgba(255,255,255,0.03)', border: `1px dashed ${V.border}` }}>
          Nobody nearby on the board yet. Put up a poster and people will find you.
        </p>
      ) : (
        <div className="space-y-1.5">
          {nearby.map(p => (
            <PeerRow
              key={p.email}
              V={V}
              name={p.name}
              email={p.email}
              subtitle={[
                p.distance_km !== null && p.distance_km !== undefined
                  ? p.distance_km < 1 ? 'under 1 km away' : `${p.distance_km} km away`
                  : null,
                p.city,
                p.school,
                p.kind === 'band' ? 'band recruiting' : 'player available',
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