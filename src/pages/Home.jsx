import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  { cx: 42,  cy: 50,  r: 1.05 },
  { cx: 25,  cy: 44,  r: 0.95 },
  { cx: 59,  cy: 44,  r: 0.90 },
  { cx: 42,  cy: 28,  r: 0.88 },
  { cx: 42,  cy: 72,  r: 0.88 },
  { cx: 14,  cy: 60,  r: 0.82 },
  { cx: 70,  cy: 60,  r: 0.82 },
  { cx: 28,  cy: 22,  r: 0.78 },
  { cx: 56,  cy: 22,  r: 0.78 },
  { cx: 14,  cy: 38,  r: 0.75 },
  { cx: 70,  cy: 38,  r: 0.75 },
  { cx: 30,  cy: 76,  r: 0.72 },
  { cx: 54,  cy: 76,  r: 0.72 },
];

const BASE_SIZE = 240;

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function FloatingBubble({ genre, colorIdx, size, floatX, floatY, duration, delay }) {
  const c = BUBBLE_COLORS[colorIdx % BUBBLE_COLORS.length];
  const iconSize = size * 0.38;
  const IconSvg = GENRE_ICONS[genre.id] || GENRE_ICONS['electronic'];
  return (
    <motion.div
      className="absolute rounded-full flex flex-col items-center justify-center cursor-pointer"
      style={{
        width: size,
        height: size,
        background: c.bg,
        border: `1.5px solid ${c.border}`,
        boxShadow: c.glow,
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
      }}
      animate={{
        x: [0, floatX, -floatX * 0.5, floatX * 0.3, 0],
        y: [0, floatY, -floatY * 0.6, floatY * 0.4, 0],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
      whileHover={{ scale: 1.12, zIndex: 50 }}
    >
      {/* Inner radial shimmer */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 35% 28%, rgba(255,255,255,0.13) 0%, transparent 62%)' }}
      />
      <div style={{ width: iconSize, height: iconSize, filter: `drop-shadow(0 0 8px ${c.border})` }}>
        {IconSvg(c.border)}
      </div>
      <span
        className="font-bold text-center uppercase"
        style={{
          color: c.text,
          fontSize: size * 0.088,
          letterSpacing: '0.14em',
          textShadow: `0 0 10px ${c.border}, 0 0 22px ${c.border}`,
          marginTop: size * 0.04,
          lineHeight: 1.1,
          paddingLeft: size * 0.08,
          paddingRight: size * 0.08,
        }}
      >
        {genre.label}
      </span>
    </motion.div>
  );
}

export default function Home() {
  const navigate = useNavigate();

  const bubbleParams = useMemo(() =>
    GENRES.map(() => ({
      floatX: rand(12, 28) * (Math.random() > 0.5 ? 1 : -1),
      floatY: rand(10, 24) * (Math.random() > 0.5 ? 1 : -1),
      duration: rand(5, 10),
      delay: rand(0, 3),
    })), []);

  const containerSize = 760;

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at 50% 0%, #0d1535 0%, #070910 55%, #020304 100%)' }}>
      {/* ── Hero ── */}
      <div className="flex flex-col items-center justify-center pt-10 pb-4 px-4 text-center">
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
          className="mt-7 flex gap-3"
        >
          <Link
            to="/discover"
            className="px-7 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-85"
            style={{
              background: 'linear-gradient(135deg, #7c6fff, #c084fc)',
              color: '#fff',
              boxShadow: '0 0 20px rgba(124,111,255,0.45)',
            }}
          >
            Browse Albums
          </Link>
          <Link
            to="/bands"
            className="px-7 py-2.5 rounded-full text-sm font-semibold transition-all"
            style={{
              border: '1px solid rgba(124,111,255,0.4)',
              color: 'rgba(180,195,235,0.85)',
              background: 'rgba(124,111,255,0.07)',
            }}
          >
            Find Bands
          </Link>
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
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="pb-12 px-4 flex flex-col items-center -mt-32"
        onClick={() => navigate('/discover')}
      >
        <div
          className="relative mx-auto"
          style={{ width: '100%', maxWidth: containerSize, height: Math.round(containerSize * 0.92) }}
        >
          {GENRES.map((genre, i) => {
            const pos = CLUSTER_POSITIONS[i % CLUSTER_POSITIONS.length];
            const p = bubbleParams[i];
            const size = Math.round(BASE_SIZE * pos.r);
            return (
              <div
                key={genre.id}
                style={{
                  position: 'absolute',
                  left: `${pos.cx}%`,
                  top: `${pos.cy}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: Math.round(pos.r * 10),
                }}
              >
                <FloatingBubble
                  genre={genre}
                  colorIdx={i}
                  size={size}
                  floatX={p.floatX}
                  floatY={p.floatY}
                  duration={p.duration}
                  delay={p.delay}
                />
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}