import React from 'react';
import { MapPin } from 'lucide-react';
import ChatSection from './ChatSection';
import PeerRow from './PeerRow';

// People currently active on the band board — same city first, and always
// inside the viewer's own age bracket.
export default function PeopleAround({ V, nearby, loading, city, matchedCity, isPinned, onTogglePin, onOpen }) {
  const hint = matchedCity && city ? `in ${city}` : 'on the board';

  return (
    <ChatSection V={V} icon={MapPin} label="People around you" hint={hint} count={nearby.length}>
      {loading ? (
        <div className="space-y-1.5">
          {[0, 1].map(i => <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: 'rgba(124,111,255,0.08)' }} />)}
        </div>
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
              subtitle={[p.city, p.school, p.kind === 'band' ? 'band recruiting' : 'player available'].filter(Boolean).join(' · ')}
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