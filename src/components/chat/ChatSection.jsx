import React from 'react';

export default function ChatSection({ V, icon: Icon, label, hint, count, children }) {
  return (
    <div className="mt-7">
      <div className="flex items-center gap-2 mb-2.5 px-1">
        <Icon className="w-3.5 h-3.5" style={{ color: V.accent }} />
        <p className="text-[11px] uppercase tracking-[0.18em] font-bold" style={{ color: V.muted }}>{label}</p>
        {count > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(124,111,255,0.16)', color: V.accent }}>
            {count}
          </span>
        )}
        {hint && <span className="text-[10px] ml-auto" style={{ color: 'rgba(140,155,210,0.4)' }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}