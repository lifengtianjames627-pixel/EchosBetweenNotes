import React from 'react';

const OPTIONS = ['Rock', 'Pop', 'Classical', 'Metal', 'Jazz', 'Blues', 'R&B', 'Core', 'Country', 'Hip-hop', 'Indie', 'Grunge', 'Electronic', 'Funk', 'ACG', 'Cinematic'];

export default function MusicPreferences({ values, onToggle }) {
  return <section>
    <p className="text-sm font-semibold" style={{ color: '#e6eaff' }}>What moves you?</p>
    <p className="text-xs mt-1" style={{ color: 'rgba(160,175,215,0.55)' }}>Choose the sounds you come back to.</p>
    <div className="flex flex-wrap gap-2 mt-3">
      {OPTIONS.map(item => <button key={item} type="button" onClick={() => onToggle(item)} className="rounded-full px-3 py-1.5 text-xs font-medium" style={values.includes(item) ? { background: 'rgba(124,111,255,0.28)', border: '1px solid rgba(165,180,252,0.55)', color: '#e1e4ff' } : { background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(124,111,255,0.16)', color: 'rgba(185,198,235,0.62)' }}>{item}</button>)}
    </div>
  </section>;
}