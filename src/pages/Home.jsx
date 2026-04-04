import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GENRES } from '@/lib/genreConfig';

// Neon glow colors: bg = dark glass, border = neon edge, text = bright neon, glow = shadow color
const BUBBLE_COLORS = [
  { bg: 'rgba(30,20,80,0.55)',  border: '#7c6fff', text: '#c4baff', glow: '0 0 22px 4px rgba(124,111,255,0.55), 0 0 60px 8px rgba(124,111,255,0.18)' },
  { bg: 'rgba(10,40,80,0.55)',  border: '#38bdf8', text: '#93e4ff', glow: '0 0 22px 4px rgba(56,189,248,0.55), 0 0 60px 8px rgba(56,189,248,0.18)' },
  { bg: 'rgba(60,10,60,0.55)',  border: '#f472b6', text: '#ffb3d9', glow: '0 0 22px 4px rgba(244,114,182,0.55), 0 0 60px 8px rgba(244,114,182,0.18)' },
  { bg: 'rgba(10,55,35,0.55)',  border: '#34d399', text: '#a7f3d0', glow: '0 0 22px 4px rgba(52,211,153,0.55), 0 0 60px 8px rgba(52,211,153,0.18)' },
  { bg: 'rgba(70,35,10,0.55)',  border: '#fb923c', text: '#fed7aa', glow: '0 0 22px 4px rgba(251,146,60,0.55), 0 0 60px 8px rgba(251,146,60,0.18)' },
  { bg: 'rgba(65,10,30,0.55)',  border: '#f87171', text: '#fecaca', glow: '0 0 22px 4px rgba(248,113,113,0.55), 0 0 60px 8px rgba(248,113,113,0.18)' },
  { bg: 'rgba(55,10,70,0.55)',  border: '#c084fc', text: '#e9d5ff', glow: '0 0 22px 4px rgba(192,132,252,0.55), 0 0 60px 8px rgba(192,132,252,0.18)' },
  { bg: 'rgba(10,55,55,0.55)',  border: '#2dd4bf', text: '#99f6e4', glow: '0 0 22px 4px rgba(45,212,191,0.55), 0 0 60px 8px rgba(45,212,191,0.18)' },
  { bg: 'rgba(60,55,10,0.55)',  border: '#fbbf24', text: '#fde68a', glow: '0 0 22px 4px rgba(251,191,36,0.55), 0 0 60px 8px rgba(251,191,36,0.18)' },
  { bg: 'rgba(15,30,65,0.55)',  border: '#60a5fa', text: '#bfdbfe', glow: '0 0 22px 4px rgba(96,165,250,0.55), 0 0 60px 8px rgba(96,165,250,0.18)' },
  { bg: 'rgba(10,50,20,0.55)',  border: '#86efac', text: '#bbf7d0', glow: '0 0 22px 4px rgba(134,239,172,0.55), 0 0 60px 8px rgba(134,239,172,0.18)' },
  { bg: 'rgba(65,20,10,0.55)',  border: '#fdba74', text: '#fed7aa', glow: '0 0 22px 4px rgba(253,186,116,0.55), 0 0 60px 8px rgba(253,186,116,0.18)' },
  { bg: 'rgba(40,10,65,0.55)',  border: '#a78bfa', text: '#ddd6fe', glow: '0 0 22px 4px rgba(167,139,250,0.55), 0 0 60px 8px rgba(167,139,250,0.18)' },
];

// Positions arranged in a tight organic cluster (percentage of container)
// Hand-placed so they form one cohesive blob shape
const CLUSTER_POSITIONS = [
  { cx: 42,  cy: 50,  r: 1.05 }, // center large
  { cx: 25,  cy: 44,  r: 0.95 }, // left-center
  { cx: 59,  cy: 44,  r: 0.90 }, // right-center
  { cx: 42,  cy: 28,  r: 0.88 }, // top-center
  { cx: 42,  cy: 72,  r: 0.88 }, // bottom-center
  { cx: 14,  cy: 60,  r: 0.82 }, // far left
  { cx: 70,  cy: 60,  r: 0.82 }, // far right
  { cx: 28,  cy: 22,  r: 0.78 }, // top-left
  { cx: 56,  cy: 22,  r: 0.78 }, // top-right
  { cx: 14,  cy: 38,  r: 0.75 }, // mid-left
  { cx: 70,  cy: 38,  r: 0.75 }, // mid-right
  { cx: 30,  cy: 76,  r: 0.72 }, // bottom-left
  { cx: 54,  cy: 76,  r: 0.72 }, // bottom-right
];

const BASE_SIZE = 240; // px, base bubble diameter

const MUSIC_NOTES = ['♩', '♪', '♫', '♬', '𝄞'];

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

// Floating music notes around the title
function TitleNote({ note, x, y, delay }) {
  return (
    <motion.span
      className="absolute pointer-events-none select-none font-bold"
      style={{ left: x, top: y, color: 'hsl(230 55% 65%)', fontSize: rand(18, 32) }}
      animate={{
        y: [0, -18, 0, 12, 0],
        x: [0, 8, -6, 4, 0],
        opacity: [0.5, 1, 0.6, 1, 0.5],
        rotate: [-10, 10, -5, 8, -10],
      }}
      transition={{ duration: rand(3.5, 6), delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      {note}
    </motion.span>
  );
}

// Individual floating bubble — dark glass + neon glow style
function FloatingBubble({ genre, colorIdx, size, floatX, floatY, duration, delay }) {
  const c = BUBBLE_COLORS[colorIdx % BUBBLE_COLORS.length];
  return (
    <motion.div
      className="absolute rounded-full flex flex-col items-center justify-center cursor-pointer"
      style={{
        width: size,
        height: size,
        background: c.bg,
        border: `1.5px solid ${c.border}`,
        boxShadow: c.glow,
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
      animate={{
        x: [0, floatX, -floatX * 0.5, floatX * 0.3, 0],
        y: [0, floatY, -floatY * 0.6, floatY * 0.4, 0],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
      whileHover={{ scale: 1.12, zIndex: 50 }}
    >
      {/* Inner glass shimmer */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 35% 30%, rgba(255,255,255,0.18) 0%, transparent 65%)',
        }}
      />
      <span style={{ fontSize: size * 0.26, filter: 'drop-shadow(0 0 6px currentColor)' }}>{genre.icon}</span>
      <span
        className="font-bold tracking-widest text-center leading-tight px-3 uppercase"
        style={{
          color: c.text,
          fontSize: size * 0.095,
          textShadow: `0 0 10px ${c.border}, 0 0 20px ${c.border}`,
          letterSpacing: '0.12em',
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

  const titleNotes = useMemo(() => [
    { note: '♪', x: '-5%',  y: '10%',  delay: 0 },
    { note: '♫', x: '102%', y: '5%',   delay: 0.8 },
    { note: '♩', x: '-8%',  y: '60%',  delay: 1.4 },
    { note: '♬', x: '105%', y: '55%',  delay: 0.4 },
    { note: '𝄞', x: '48%',  y: '-30%', delay: 1.1 },
    { note: '♩', x: '20%',  y: '-25%', delay: 1.8 },
    { note: '♪', x: '75%',  y: '-20%', delay: 0.6 },
  ], []);

  // Container is a square — we derive bubble positions from percentages
  const containerSize = 760; // px logical size
  const minSize = 500;

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at 50% 0%, #0e1530 0%, #07090f 60%, #000 100%)' }}>
      {/* ── Animated Hero Title ── */}
      <div className="flex flex-col items-center justify-center pt-8 pb-4 px-4 text-center">
        <div className="relative inline-block px-16 pt-10 pb-4">
          {/* Floating notes */}
          {titleNotes.map((n, i) => (
            <TitleNote key={i} {...n} />
          ))}

          {/* Letters animate in one by one */}
          <motion.h1
            className="font-black leading-none"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: 'italic',
              fontSize: 'clamp(3rem, 9vw, 7.5rem)',
              color: '#a5b4fc',
              letterSpacing: '-0.01em',
            }}
          >
            {'Music Critics'.split('').map((char, i) => (
              <motion.span
                key={i}
                display="inline-block"
                style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : 'normal' }}
                animate={{
                  y: [0, -6, 0, 4, 0],
                  rotate: char === ' ' ? 0 : [0, -1.5, 0, 1.5, 0],
                }}
                transition={{
                  duration: rand(3, 5),
                  delay: i * 0.08,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                {char}
              </motion.span>
            ))}
          </motion.h1>

          {/* Subtle animated underline */}
          <motion.div
            className="h-1 rounded-full mt-2 mx-auto"
            style={{ background: 'linear-gradient(90deg, hsl(230 60% 55%), hsl(270 50% 60%), hsl(200 60% 50%))', originX: 0.5 }}
            animate={{ scaleX: [0.7, 1, 0.82, 1, 0.7], opacity: [0.6, 1, 0.7, 1, 0.6] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.5 }}
          className="mt-5 text-base md:text-lg max-w-xl"
          style={{ color: 'rgba(180,190,220,0.75)' }}
        >
          Honest reviews. Every genre. By people who actually care.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className="mt-7 flex gap-3"
        >
          <Link
            to="/discover"
            className="px-6 py-2.5 rounded-full text-sm font-semibold shadow-sm transition-all hover:opacity-90"
            style={{ background: 'hsl(230 60% 45%)', color: '#fff' }}
          >
            Browse Albums
          </Link>
          <Link
            to="/bands"
            className="px-6 py-2.5 rounded-full text-sm font-semibold border transition-all hover:bg-white"
            style={{ borderColor: 'rgba(120,140,200,0.4)', color: 'rgba(180,195,230,0.9)', background: 'rgba(255,255,255,0.04)' }}
          >
            Find Bands
          </Link>
        </motion.div>

        <p className="mt-8 text-center text-xs font-semibold uppercase tracking-widest"
           style={{ color: 'rgba(150,165,210,0.6)' }}>
          Explore by Genre
        </p>
      </div>

      {/* ── Bubble Cluster ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.7 }}
        className="pb-12 px-4 flex flex-col items-center -mt-32"
        onClick={() => navigate('/discover')}
      >

        {/* Absolute-positioned cluster */}
        <div
          className="relative mx-auto"
          style={{
            width: '100%',
            maxWidth: containerSize,
            height: Math.round(containerSize * 0.92),
          }}
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