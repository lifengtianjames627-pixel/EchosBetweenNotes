import React from 'react';
import { BADGE_MAP } from '@/lib/badgeConfig';

const STAR_POINTS = '50,5 61,35 95,35 67,57 77,91 50,70 23,91 33,57 5,35 39,35';

export default function BadgeIcon({ badgeId, size = 'md', locked = false, showName = false, onClick }) {
  const badge = BADGE_MAP[badgeId];
  if (!badge) return null;

  const sizeMap = { xs: 28, sm: 44, md: 68, lg: 88 };
  const s = sizeMap[size] || 68;
  const fontSize = s * 0.32;
  // Use unique ID per badge+size combo to avoid SVG gradient conflicts
  const gradId = `bg-${badgeId}-${size}`;
  const shineId = `sh-${badgeId}-${size}`;

  return (
    <div
      className={`flex flex-col items-center gap-1 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      title={`${badge.name} — ${badge.desc}`}
    >
      <div
        style={{
          position: 'relative',
          width: s,
          height: s,
          filter: locked
            ? 'grayscale(1) opacity(0.28)'
            : `drop-shadow(0 0 ${Math.round(s * 0.12)}px ${badge.glow})`,
          transition: 'filter 0.2s, transform 0.2s',
        }}
      >
        <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <defs>
            <radialGradient id={gradId} cx="45%" cy="30%" r="65%">
              <stop offset="0%" stopColor={badge.color} stopOpacity="0.95" />
              <stop offset="60%" stopColor={badge.color} stopOpacity="0.55" />
              <stop offset="100%" stopColor={badge.color} stopOpacity="0.18" />
            </radialGradient>
            <radialGradient id={shineId} cx="38%" cy="22%" r="42%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Outer glow ring */}
          <circle cx="50" cy="50" r="46" fill="none" stroke={badge.color} strokeWidth="1.5" opacity="0.35" />
          {/* Star body */}
          <polygon points={STAR_POINTS} fill={`url(#${gradId})`} stroke={badge.color} strokeWidth="1.5" />
          {/* Shine overlay */}
          <polygon points={STAR_POINTS} fill={`url(#${shineId})`} />
        </svg>
        {/* Emoji center */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize, lineHeight: 1,
          paddingBottom: Math.round(s * 0.04),
        }}>
          {badge.emoji}
        </div>
      </div>
      {showName && (
        <span
          className="text-center font-semibold leading-tight"
          style={{
            fontSize: Math.round(s * 0.145),
            color: locked ? 'rgba(120,120,140,0.45)' : badge.color,
            maxWidth: s + 16,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          {badge.name}
        </span>
      )}
    </div>
  );
}