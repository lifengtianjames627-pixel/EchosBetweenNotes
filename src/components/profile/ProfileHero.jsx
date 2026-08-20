import React from 'react';
import { motion } from 'framer-motion';
import BadgeIcon from '@/components/BadgeIcon';

// Artistic header shared by your own profile and other members' profiles:
// a slow aurora wash, a rotating vinyl ring around the avatar and a live
// equaliser baseline — movement that feels musical without stealing focus.
const BARS = [10, 22, 14, 30, 18, 26, 12, 34, 16, 24, 11, 28, 20, 15, 32, 13, 25, 19, 29, 17];

export default function ProfileHero({ name, email, initial, badges = [], online, statusText, children }) {
  return (
    <div className="relative overflow-hidden rounded-3xl mb-6"
      style={{ background: 'rgba(10,13,32,0.85)', border: '1px solid rgba(124,111,255,0.18)' }}>

      {/* Aurora wash */}
      <motion.div
        aria-hidden
        className="absolute -top-24 -left-16 w-72 h-72 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(124,111,255,0.45), transparent 70%)' }}
        animate={{ x: [0, 40, 0], y: [0, 20, 0], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-28 -right-10 w-72 h-72 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(192,132,252,0.35), transparent 70%)' }}
        animate={{ x: [0, -30, 0], y: [0, -18, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative px-5 sm:px-7 pt-7 pb-5">
        <div className="flex items-start gap-4 sm:gap-5">
          {/* Avatar inside a rotating vinyl ring */}
          <div className="relative shrink-0">
            <motion.div
              aria-hidden
              className="absolute -inset-2 rounded-full"
              style={{ background: 'conic-gradient(from 0deg, rgba(124,111,255,0.7), rgba(192,132,252,0.15), rgba(52,211,153,0.5), rgba(124,111,255,0.7))', opacity: 0.55 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            />
            <div className="relative w-[74px] h-[74px] rounded-full flex items-center justify-center text-3xl font-black"
              style={{
                background: 'linear-gradient(150deg, rgba(28,24,66,0.98), rgba(12,15,35,0.98))',
                color: '#c4baff',
                border: '1px solid rgba(124,111,255,0.35)',
                fontFamily: 'Playfair Display, Georgia, serif',
              }}>
              {initial}
            </div>
            {online !== undefined && online !== null && (
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full"
                style={{
                  background: online ? '#34d399' : 'rgba(140,155,210,0.5)',
                  border: '2.5px solid #0a0d20',
                  boxShadow: online ? '0 0 8px #34d399' : 'none',
                }} />
            )}
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-2xl sm:text-3xl font-black leading-tight truncate"
              style={{ color: 'rgba(232,236,255,0.97)', fontFamily: 'Playfair Display, Georgia, serif' }}>
              {name}
            </h1>
            <p className="text-xs mt-1 truncate" style={{ color: 'rgba(140,155,210,0.55)' }}>
              {statusText || email}
            </p>
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {badges.map(id => <BadgeIcon key={id} badgeId={id} size="xs" />)}
              </div>
            )}
          </div>
        </div>

        {children && <div className="flex flex-wrap gap-2.5 mt-5">{children}</div>}
      </div>

      {/* Equaliser baseline */}
      <div aria-hidden className="relative flex items-end gap-[3px] h-9 px-5 sm:px-7 pb-3">
        {BARS.map((h, i) => (
          <motion.span
            key={i}
            className="flex-1 rounded-t-sm"
            style={{ background: 'linear-gradient(180deg, rgba(165,180,252,0.85), rgba(124,111,255,0.15))' }}
            animate={{ height: [h * 0.35, h, h * 0.5, h * 0.8, h * 0.35] }}
            transition={{ duration: 2.4 + (i % 5) * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.07 }}
          />
        ))}
      </div>
    </div>
  );
}