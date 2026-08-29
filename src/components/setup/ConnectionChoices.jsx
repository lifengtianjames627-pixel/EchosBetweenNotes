import React from 'react';
import { MapPin, Music2 } from 'lucide-react';

export default function ConnectionChoices({ locationAllowed, hasBand, bandName, onChange }) {
  return <section className="mt-7 space-y-3">
    <label className="flex gap-3 p-4 rounded-2xl cursor-pointer" style={{ background: 'rgba(124,111,255,0.07)', border: '1px solid rgba(124,111,255,0.16)' }}><input type="checkbox" checked={locationAllowed} onChange={e => onChange('location', e.target.checked)} className="mt-0.5" /><span><span className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#e6eaff' }}><MapPin className="w-4 h-4" style={{ color: '#a5b4fc' }} /> Let my network find nearby members</span><span className="block text-xs mt-1" style={{ color: 'rgba(160,175,215,0.58)' }}>This can be changed later. Your exact location is never shown.</span></span></label>
    <label className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer" style={{ background: 'rgba(244,114,182,0.055)', border: '1px solid rgba(244,114,182,0.16)' }}><input type="checkbox" checked={hasBand} onChange={e => onChange('band', e.target.checked)} /><Music2 className="w-4 h-4" style={{ color: '#f0abfc' }} /><span className="text-sm font-semibold" style={{ color: '#e6eaff' }}>I’m already in a band</span></label>
    {hasBand && <input value={bandName} onChange={e => onChange('bandName', e.target.value)} placeholder="Band name" className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(244,114,182,0.24)', color: '#e6eaff' }} />}
  </section>;
}