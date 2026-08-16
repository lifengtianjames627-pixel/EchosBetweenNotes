import React from 'react';
import { Navigation, LocateFixed, ShieldCheck } from 'lucide-react';
import { useMyLocation } from './useMyLocation';

// Lets the user turn real distance sorting on or off for "People around you".
export default function LocationShareBar({ V, located }) {
  const { status, share, clear } = useMyLocation();

  if (located) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl mb-1.5"
        style={{ background: 'rgba(124,111,255,0.08)', border: `1px solid ${V.border}` }}>
        <LocateFixed className="w-3.5 h-3.5 shrink-0" style={{ color: V.accent }} />
        <p className="text-[11px] flex-1" style={{ color: V.muted }}>
          Sorted by real distance from your location.
        </p>
        <button onClick={clear} className="text-[11px] shrink-0 underline" style={{ color: V.muted }}>
          Turn off
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 rounded-2xl mb-1.5"
      style={{ background: 'rgba(255,255,255,0.03)', border: `1px dashed ${V.border}` }}>
      <button
        onClick={share}
        disabled={status === 'asking'}
        className="flex items-center gap-2 text-xs font-semibold"
        style={{ color: V.accent, opacity: status === 'asking' ? 0.6 : 1 }}
      >
        <Navigation className="w-3.5 h-3.5" />
        {status === 'asking' ? 'Locating…' : 'Use my location to sort by distance'}
      </button>
      <p className="flex items-start gap-1.5 text-[10px] mt-2 leading-relaxed" style={{ color: 'rgba(140,155,210,0.5)' }}>
        <ShieldCheck className="w-3 h-3 shrink-0 mt-0.5" />
        {status === 'denied'
          ? 'Location permission was blocked — allow it in your browser to sort by distance.'
          : status === 'unsupported'
          ? 'This device does not support location.'
          : 'Your exact position is never shown to anyone — others only ever see a distance in km.'}
      </p>
    </div>
  );
}