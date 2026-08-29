import React from 'react';
import { MapPin, Music2, Radio } from 'lucide-react';

export default function ProfileDetails({ user }) {
  const preferences = user.music_preferences || [];
  return (
    <section className="rounded-3xl p-5 sm:p-6 mb-6" style={{ background: 'rgba(10,13,32,0.72)', border: '1px solid rgba(124,111,255,0.16)' }}>
      {user.biography && <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(220,225,255,0.76)' }}>{user.biography}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] font-bold mb-2" style={{ color: 'rgba(165,180,252,0.7)' }}><Radio className="w-3.5 h-3.5" /> Music taste</p>
          <div className="flex flex-wrap gap-1.5">{preferences.length ? preferences.map(item => <span key={item} className="rounded-full px-2.5 py-1 text-xs" style={{ background: 'rgba(124,111,255,0.14)', color: '#c4baff' }}>{item}</span>) : <span className="text-xs" style={{ color: 'rgba(160,175,215,0.48)' }}>Still finding the sound.</span>}</div>
        </div>
        <div className="space-y-2 text-xs" style={{ color: 'rgba(190,200,235,0.68)' }}>
          <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" style={{ color: '#a5b4fc' }} /> {user.location_network_allowed ? 'Network discovery is on' : 'Network discovery is off'}</p>
          <p className="flex items-center gap-2"><Music2 className="w-3.5 h-3.5" style={{ color: '#f0abfc' }} /> {user.has_band ? `In ${user.band_name || 'a band'}` : 'Not in a band right now'}</p>
        </div>
      </div>
    </section>
  );
}