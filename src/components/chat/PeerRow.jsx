import React from 'react';
import { Pin, PinOff } from 'lucide-react';

// One person row, shared by the pinned / conversations / nearby lists.
export default function PeerRow({ V, name, email, subtitle, meta, color, pinned, online, onOpen, onTogglePin }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
      style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${V.border}` }}>
      <button onClick={onOpen} className="flex items-center gap-3 flex-1 min-w-0 text-left">
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
            style={color
              ? { background: `${color}26`, color, border: `1.5px solid ${color}`, opacity: online === false ? 0.55 : 1 }
              : { background: 'rgba(124,111,255,0.2)', color: V.accent, opacity: online === false ? 0.55 : 1 }}>
            {(name || email || '?')[0].toUpperCase()}
          </div>
          {online !== undefined && online !== null && (
            <span
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full"
              style={{
                background: online ? '#34d399' : 'rgba(140,155,210,0.5)',
                border: '2px solid #070910',
                boxShadow: online ? '0 0 6px #34d399' : 'none',
              }}
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm truncate" style={{ color: V.text }}>{name || email}</p>
          {subtitle && <p className="text-xs truncate" style={{ color: V.muted }}>{subtitle}</p>}
        </div>
        {meta && <span className="text-[10px] shrink-0 ml-2" style={{ color: 'rgba(140,155,210,0.4)' }}>{meta}</span>}
      </button>
      {onTogglePin && (
        <button
          onClick={onTogglePin}
          title={pinned ? 'Unpin' : 'Pin to top'}
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all"
          style={{
            background: pinned ? 'rgba(124,111,255,0.2)' : 'transparent',
            color: pinned ? V.accent : V.muted,
          }}
        >
          {pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
        </button>
      )}
    </div>
  );
}