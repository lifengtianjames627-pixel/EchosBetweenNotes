import React from 'react';

export default function ProfileEssentials({ biography, onChange }) {
  return <section className="mt-7">
    <label className="block text-sm font-semibold" style={{ color: '#e6eaff' }}>A little about you</label>
    <p className="text-xs mt-1 mb-3" style={{ color: 'rgba(160,175,215,0.55)' }}>Your bio appears on your profile.</p>
    <textarea value={biography} onChange={e => onChange(e.target.value)} maxLength={280} rows={4} placeholder="The songs, artists or stories you want people to know…" className="w-full resize-none rounded-2xl px-4 py-3 text-sm outline-none" style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(124,111,255,0.2)', color: '#e6eaff' }} />
  </section>;
}