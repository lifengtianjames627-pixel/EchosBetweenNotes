import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GENRES } from '@/lib/genreConfig';

// Neon glow colors: dark glass bg + neon border/text/glow
const BUBBLE_COLORS = [
  { bg: 'rgba(30,20,80,0.6)',  border: '#7c6fff', text: '#c4baff', glow: '0 0 28px 6px rgba(124,111,255,0.5), 0 0 70px 10px rgba(124,111,255,0.15)' },
  { bg: 'rgba(10,40,80,0.6)',  border: '#38bdf8', text: '#93e4ff', glow: '0 0 28px 6px rgba(56,189,248,0.5), 0 0 70px 10px rgba(56,189,248,0.15)' },
  { bg: 'rgba(60,10,60,0.6)',  border: '#f472b6', text: '#ffb3d9', glow: '0 0 28px 6px rgba(244,114,182,0.5), 0 0 70px 10px rgba(244,114,182,0.15)' },
  { bg: 'rgba(10,55,35,0.6)',  border: '#34d399', text: '#a7f3d0', glow: '0 0 28px 6px rgba(52,211,153,0.5), 0 0 70px 10px rgba(52,211,153,0.15)' },
  { bg: 'rgba(70,35,10,0.6)',  border: '#fb923c', text: '#fed7aa', glow: '0 0 28px 6px rgba(251,146,60,0.5), 0 0 70px 10px rgba(251,146,60,0.15)' },
  { bg: 'rgba(65,10,30,0.6)',  border: '#f87171', text: '#fecaca', glow: '0 0 28px 6px rgba(248,113,113,0.5), 0 0 70px 10px rgba(248,113,113,0.15)' },
  { bg: 'rgba(55,10,70,0.6)',  border: '#c084fc', text: '#e9d5ff', glow: '0 0 28px 6px rgba(192,132,252,0.5), 0 0 70px 10px rgba(192,132,252,0.15)' },
  { bg: 'rgba(10,55,55,0.6)',  border: '#2dd4bf', text: '#99f6e4', glow: '0 0 28px 6px rgba(45,212,191,0.5), 0 0 70px 10px rgba(45,212,191,0.15)' },
  { bg: 'rgba(60,55,10,0.6)',  border: '#fbbf24', text: '#fde68a', glow: '0 0 28px 6px rgba(251,191,36,0.5), 0 0 70px 10px rgba(251,191,36,0.15)' },
  { bg: 'rgba(15,30,65,0.6)',  border: '#60a5fa', text: '#bfdbfe', glow: '0 0 28px 6px rgba(96,165,250,0.5), 0 0 70px 10px rgba(96,165,250,0.15)' },
  { bg: 'rgba(10,50,20,0.6)',  border: '#86efac', text: '#bbf7d0', glow: '0 0 28px 6px rgba(134,239,172,0.5), 0 0 70px 10px rgba(134,239,172,0.15)' },
  { bg: 'rgba(65,20,10,0.6)',  border: '#fdba74', text: '#fed7aa', glow: '0 0 28px 6px rgba(253,186,116,0.5), 0 0 70px 10px rgba(253,186,116,0.15)' },
  { bg: 'rgba(40,10,65,0.6)',  border: '#a78bfa', text: '#ddd6fe', glow: '0 0 28px 6px rgba(167,139,250,0.5), 0 0 70px 10px rgba(167,139,250,0.15)' },
];

// SVG icons per genre — clean, minimal, edgy
const GENRE_ICONS = {
  rock: (color) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 32 L16 8 L22 20 L28 12 L32 32" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="32" cy="32" r="3" fill={color}/>
      <circle cx="8" cy="32" r="3" fill={color}/>
    </svg>
  ),
  pop: (color) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="10" stroke={color} strokeWidth="2.2"/>
      <path d="M20 4 L20 10 M20 30 L20 36 M4 20 L10 20 M30 20 L36 20" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
      <circle cx="20" cy="20" r="3" fill={color}/>
    </svg>
  ),
  classical: (color) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 30 L12 12 Q12 8 16 8 Q20 8 20 12 L20 24" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
      <ellipse cx="9" cy="30" rx="4" ry="3" stroke={color} strokeWidth="2"/>
      <path d="M20 28 L20 14 M20 14 L28 10 L28 24" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
      <ellipse cx="31" cy="24" rx="4" ry="3" stroke={color} strokeWidth="2"/>
    </svg>
  ),
  metal: (color) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 8 L20 32 L32 8" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 20 L28 20" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M6 36 L34 36" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
    </svg>
  ),
  jazz: (color) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 32 Q14 18 22 14 Q30 10 30 18 Q30 26 22 28 L14 32" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="33" r="3.5" stroke={color} strokeWidth="2"/>
      <path d="M22 28 L22 38" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
    </svg>
  ),
  blues: (color) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 26 Q14 20 20 26 Q26 32 32 26" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M8 18 Q14 12 20 18 Q26 24 32 18" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M8 10 Q14 4 20 10 Q26 16 32 10" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.5"/>
    </svg>
  ),
  r_and_b: (color) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="14" width="10" height="16" rx="5" stroke={color} strokeWidth="2.2"/>
      <rect x="22" y="10" width="10" height="20" rx="5" stroke={color} strokeWidth="2.2"/>
      <path d="M18 22 L22 22" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  hardcore: (color) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 34 L20 6 L34 34 Z" stroke={color} strokeWidth="2.5" strokeLinejoin="round"/>
      <path d="M12 26 L28 26" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  country: (color) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 6 Q28 6 32 14 L32 32 Q28 36 20 36 Q12 36 8 32 L8 14 Q12 6 20 6Z" stroke={color} strokeWidth="2"/>
      <path d="M14 20 Q17 16 20 20 Q23 24 26 20" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 28 L20 36" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
    </svg>
  ),
  hip_hop: (color) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="10" width="28" height="20" rx="3" stroke={color} strokeWidth="2.2"/>
      <path d="M12 20 L16 16 L20 22 L24 14 L28 20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  indie: (color) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="13" stroke={color} strokeWidth="2.2"/>
      <circle cx="20" cy="20" r="7" stroke={color} strokeWidth="1.8"/>
      <circle cx="20" cy="20" r="2.5" fill={color}/>
      <path d="M20 7 L20 3" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 37 L20 33" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  grunge: (color) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 20 Q11 10 20 10 Q29 10 32 20 Q29 30 20 30 Q11 30 8 20Z" stroke={color} strokeWidth="2"/>
      <path d="M14 20 L18 16 L22 24 L26 20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  electronic: (color) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 20 L10 20 L14 10 L18 30 L22 14 L26 26 L30 20 L36 20" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

const CLUSTER_POSITIONS = [
  { cx: 50,  cy: 50,  r: 1.05 },
  { cx: 33,  cy: 44,  r: 0.95 },
  { cx: 67,  cy: 44,  r: 0.90 },
  { cx: 50,  cy: 28,  r: 0.88 },
  { cx: 50,  cy: 72,  r: 0.88 },
  { cx: 22,  cy: 60,  r: 0.82 },
  { cx: 78,  cy: 60,  r: 0.82 },
  { cx: 36,  cy: 22,  r: 0.78 },
  { cx: 64,  cy: 22,  r: 0.78 },
  { cx: 22,  cy: 38,  r: 0.75 },
  { cx: 78,  cy: 38,  r: 0.75 },
  { cx: 38,  cy: 76,  r: 0.72 },
  { cx: 62,  cy: 76,  r: 0.72 },
];

const BASE_SIZE = 240;

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function FloatingBubble({ genre, colorIdx, size, floatX, floatY, duration, delay, hovered, onHover, onLeave }) {
  const c = BUBBLE_COLORS[colorIdx % BUBBLE_COLORS.length];
  const iconSize = (hovered ? size * 1.22 : size) * 0.38;
  const IconSvg = GENRE_ICONS[genre.id] || GENRE_ICONS['electronic'];
  return (
    <motion.div
      className="rounded-full flex flex-col items-center justify-center cursor-pointer select-none"
      style={{
        width: size,
        height: size,
        background: hovered
          ? c.bg.replace('0.6', '0.85')
          : c.bg,
        border: `${hovered ? 2 : 1.5}px solid ${c.border}`,
        boxShadow: hovered
          ? `0 0 48px 14px ${c.border}55, 0 0 110px 20px ${c.border}22, 0 0 0 2px ${c.border}44`
          : c.glow,
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        position: 'relative',
      }}
      animate={{
        x: [0, floatX, -floatX * 0.5, floatX * 0.3, 0],
        y: [0, floatY, -floatY * 0.6, floatY * 0.4, 0],
        scale: hovered ? 1.22 : 1,
      }}
      transition={{
        x: { duration, delay, repeat: Infinity, ease: 'easeInOut' },
        y: { duration, delay, repeat: Infinity, ease: 'easeInOut' },
        scale: { duration: 0.28, ease: [0.34, 1.56, 0.64, 1] },
        boxShadow: { duration: 0.25 },
      }}
      onHoverStart={onHover}
      onHoverEnd={onLeave}
    >
      {/* Inner radial shimmer */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 35% 28%, rgba(255,255,255,0.13) 0%, transparent 62%)' }}
      />
      <motion.div
        animate={{ width: iconSize, height: iconSize }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{ filter: `drop-shadow(0 0 ${hovered ? 14 : 8}px ${c.border})` }}
      >
        {IconSvg(c.border)}
      </motion.div>
      <motion.span
        className="font-bold text-center uppercase"
        animate={{ opacity: hovered ? 1 : 0.55, y: hovered ? 0 : 4 }}
        transition={{ duration: 0.22 }}
        style={{
          color: c.text,
          fontSize: size * 0.088,
          letterSpacing: '0.14em',
          textShadow: hovered
            ? `0 0 14px ${c.border}, 0 0 32px ${c.border}`
            : `0 0 8px ${c.border}`,
          marginTop: size * 0.04,
          lineHeight: 1.1,
          paddingLeft: size * 0.08,
          paddingRight: size * 0.08,
        }}
      >
        {genre.label}
      </motion.span>
    </motion.div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const bubbleParams = useMemo(() =>
    GENRES.map(() => ({
      floatX: rand(12, 28) * (Math.random() > 0.5 ? 1 : -1),
      floatY: rand(10, 24) * (Math.random() > 0.5 ? 1 : -1),
      duration: rand(5, 10),
      delay: rand(0, 3),
    })), []);

  const containerSize = 760;

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'radial-gradient(ellipse at 50% 0%, #0d1535 0%, #070910 55%, #020304 100%)' }}>

      {/* ── Ambient background decorations ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Floating vinyl records */}
        {[
          { top: '8%', left: '4%', size: 90, rot: -18, opacity: 0.13, dur: 18 },
          { top: '70%', left: '2%', size: 60, rot: 12, opacity: 0.09, dur: 22 },
          { top: '20%', right: '3%', size: 110, rot: 25, opacity: 0.11, dur: 20 },
          { top: '60%', right: '5%', size: 70, rot: -8, opacity: 0.10, dur: 25 },
          { top: '85%', left: '45%', size: 50, rot: 5, opacity: 0.08, dur: 16 },
        ].map((v, i) => (
          <motion.div
            key={`vinyl-${i}`}
            className="absolute rounded-full"
            style={{
              top: v.top, left: v.left, right: v.right,
              width: v.size, height: v.size,
              opacity: v.opacity,
              rotate: v.rot,
              background: `conic-gradient(from 0deg, #1a1a2e, #16213e, #0f3460, #1a1a2e, #0d0d1a, #1a1a2e)`,
              boxShadow: `0 0 0 ${v.size * 0.06}px rgba(255,255,255,0.06), 0 0 0 ${v.size * 0.12}px rgba(255,255,255,0.02), inset 0 0 ${v.size * 0.3}px rgba(0,0,0,0.8)`,
            }}
            animate={{ rotate: [v.rot, v.rot + 360] }}
            transition={{ duration: v.dur, repeat: Infinity, ease: 'linear' }}
          >
            {/* Center hole */}
            <div className="absolute rounded-full bg-black" style={{ width: v.size * 0.15, height: v.size * 0.15, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
            {/* Groove rings */}
            {[0.35, 0.5, 0.65, 0.78].map((r, j) => (
              <div key={j} className="absolute rounded-full border" style={{ width: `${r * 100}%`, height: `${r * 100}%`, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', borderColor: 'rgba(255,255,255,0.06)' }} />
            ))}
          </motion.div>
        ))}

        {/* Floating music notes */}
        {[
          { top: '15%', left: '12%', note: '♪', size: 22, color: '#7c6fff', dur: 6, delay: 0 },
          { top: '35%', left: '8%', note: '♫', size: 18, color: '#f472b6', dur: 8, delay: 1 },
          { top: '55%', left: '14%', note: '♩', size: 16, color: '#38bdf8', dur: 7, delay: 2 },
          { top: '75%', left: '9%', note: '♬', size: 20, color: '#34d399', dur: 9, delay: 0.5 },
          { top: '12%', right: '10%', note: '♫', size: 20, color: '#fbbf24', dur: 7, delay: 1.5 },
          { top: '40%', right: '8%', note: '♪', size: 16, color: '#c084fc', dur: 6, delay: 3 },
          { top: '65%', right: '12%', note: '♩', size: 24, color: '#f87171', dur: 10, delay: 0.8 },
          { top: '88%', right: '18%', note: '♬', size: 15, color: '#2dd4bf', dur: 8, delay: 2.5 },
        ].map((n, i) => (
          <motion.span
            key={`note-${i}`}
            className="absolute select-none font-bold"
            style={{ top: n.top, left: n.left, right: n.right, fontSize: n.size, color: n.color, filter: `drop-shadow(0 0 8px ${n.color})`, opacity: 0.35 }}
            animate={{ y: [-8, 8, -8], opacity: [0.2, 0.45, 0.2], rotate: [-5, 5, -5] }}
            transition={{ duration: n.dur, delay: n.delay, repeat: Infinity, ease: 'easeInOut' }}
          >
            {n.note}
          </motion.span>
        ))}

        {/* Waveform lines left */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-[3px] opacity-[0.07] pl-2">
          {Array.from({ length: 18 }).map((_, i) => {
            const h = [14,22,38,55,70,82,90,78,60,45,68,85,72,50,32,20,12,8][i];
            return (
              <motion.div key={i} className="rounded-full" style={{ width: 3, height: h, background: 'linear-gradient(to top, #7c6fff, #c084fc)' }}
                animate={{ scaleY: [1, 0.4 + Math.random() * 0.8, 1] }}
                transition={{ duration: 1.4 + i * 0.1, repeat: Infinity, ease: 'easeInOut', delay: i * 0.07 }}
              />
            );
          })}
        </div>

        {/* Waveform lines right */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-[3px] opacity-[0.07] pr-2">
          {Array.from({ length: 18 }).map((_, i) => {
            const h = [8,12,20,32,50,72,85,68,45,60,78,90,82,70,55,38,22,14][i];
            return (
              <motion.div key={i} className="rounded-full" style={{ width: 3, height: h, background: 'linear-gradient(to top, #f472b6, #c084fc)' }}
                animate={{ scaleY: [1, 0.4 + Math.random() * 0.8, 1] }}
                transition={{ duration: 1.4 + i * 0.1, repeat: Infinity, ease: 'easeInOut', delay: i * 0.07 }}
              />
            );
          })}
        </div>

        {/* Subtle radial glows in corners */}
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(124,111,255,0.07) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(244,114,182,0.07) 0%, transparent 70%)' }} />
        <div className="absolute top-1/3 right-0 w-48 h-48 rounded-full" style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.05) 0%, transparent 70%)' }} />
      </div>

      {/* ── Hero ── */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-10 pb-4 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative inline-block px-10 pt-8 pb-4"
        >
          <motion.h1
            className="font-black leading-none"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: 'italic',
              fontSize: 'clamp(3rem, 9vw, 7.5rem)',
              background: 'linear-gradient(135deg, #a5b4fc 0%, #818cf8 40%, #c084fc 80%, #f472b6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.01em',
              filter: 'drop-shadow(0 0 30px rgba(165,138,252,0.4))',
            }}
          >
            Music Critics
          </motion.h1>
          {/* Animated underline */}
          <motion.div
            className="h-px mt-3 mx-auto"
            style={{ background: 'linear-gradient(90deg, transparent, #7c6fff, #c084fc, #f472b6, transparent)', originX: 0.5 }}
            animate={{ scaleX: [0.5, 1, 0.7, 1, 0.5], opacity: [0.4, 1, 0.6, 1, 0.4] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-4 text-base md:text-lg max-w-xl"
          style={{ color: 'rgba(160,175,215,0.7)', letterSpacing: '0.01em' }}
        >
          Honest reviews. Every genre. By people who actually care.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="mt-7"
        >
          <p className="text-sm" style={{ color: 'rgba(160,175,215,0.5)' }}>
            Pick a genre below to enter its space
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'rgba(140,155,210,0.45)', letterSpacing: '0.22em' }}
        >
          Explore by Genre
        </motion.p>
      </div>

      {/* ── Bubble Cluster ── */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="pb-12 px-4 flex flex-col items-center mt-4"
      >
        <div
          className="relative mx-auto"
          style={{ width: '100%', maxWidth: containerSize, height: Math.round(containerSize * 0.92) }}
        >
          {GENRES.map((genre, i) => {
            const pos = CLUSTER_POSITIONS[i % CLUSTER_POSITIONS.length];
            const p = bubbleParams[i];
            const size = Math.round(BASE_SIZE * pos.r);
            const isHovered = hoveredIdx === i;
            return (
              <div
                key={genre.id}
                style={{
                  position: 'absolute',
                  left: `${pos.cx}%`,
                  top: `${pos.cy}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: isHovered ? 50 : Math.round(pos.r * 10),
                }}
              >
                <div onClick={() => navigate(`/genre/${genre.id}`)}>
                  <FloatingBubble
                    genre={genre}
                    colorIdx={i}
                    size={size}
                    floatX={p.floatX}
                    floatY={p.floatY}
                    duration={p.duration}
                    delay={p.delay}
                    hovered={isHovered}
                    onHover={() => setHoveredIdx(i)}
                    onLeave={() => setHoveredIdx(null)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}