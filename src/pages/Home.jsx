import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GENRES } from '@/lib/genreConfig';

const BUBBLE_COLORS = [
  { bg: 'hsl(230 55% 92%)', border: 'hsl(230 50% 75%)', text: 'hsl(230 55% 28%)' },
  { bg: 'hsl(250 50% 92%)', border: 'hsl(250 45% 73%)', text: 'hsl(250 50% 28%)' },
  { bg: 'hsl(200 55% 90%)', border: 'hsl(200 50% 70%)', text: 'hsl(200 55% 22%)' },
  { bg: 'hsl(160 45% 88%)', border: 'hsl(160 40% 62%)', text: 'hsl(160 50% 20%)' },
  { bg: 'hsl(30 55% 90%)',  border: 'hsl(30 50% 68%)',  text: 'hsl(30 55% 22%)'  },
  { bg: 'hsl(345 30% 91%)', border: 'hsl(345 28% 70%)', text: 'hsl(345 35% 25%)' },
  { bg: 'hsl(270 40% 92%)', border: 'hsl(270 38% 72%)', text: 'hsl(270 45% 26%)' },
  { bg: 'hsl(185 50% 89%)', border: 'hsl(185 45% 66%)', text: 'hsl(185 55% 20%)' },
  { bg: 'hsl(45 55% 90%)',  border: 'hsl(45 50% 66%)',  text: 'hsl(45 55% 20%)'  },
  { bg: 'hsl(215 45% 91%)', border: 'hsl(215 40% 70%)', text: 'hsl(215 50% 24%)' },
  { bg: 'hsl(130 35% 90%)', border: 'hsl(130 32% 66%)', text: 'hsl(130 40% 22%)' },
  { bg: 'hsl(12 45% 90%)',  border: 'hsl(12 40% 66%)',  text: 'hsl(12 50% 22%)'  },
  { bg: 'hsl(260 40% 92%)', border: 'hsl(260 36% 72%)', text: 'hsl(260 44% 26%)' },
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

const BASE_SIZE = 190; // px, base bubble diameter

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

// Individual floating bubble
function FloatingBubble({ genre, colorIdx, size, floatX, floatY, duration, delay }) {
  const c = BUBBLE_COLORS[colorIdx % BUBBLE_COLORS.length];
  return (
    <motion.div
      className="absolute rounded-full flex flex-col items-center justify-center cursor-pointer shadow-lg"
      style={{
        width: size,
        height: size,
        background: c.bg,
        border: `2.5px solid ${c.border}`,
      }}
      animate={{
        x: [0, floatX, -floatX * 0.5, floatX * 0.3, 0],
        y: [0, floatY, -floatY * 0.6, floatY * 0.4, 0],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
      whileHover={{ scale: 1.14, zIndex: 50 }}
    >
      <span style={{ fontSize: size * 0.27 }}>{genre.icon}</span>
      <span
        className="font-semibold tracking-wide text-center leading-tight px-3"
        style={{ color: c.text, fontSize: size * 0.105 }}
      >
        {genre.label.toUpperCase()}
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
    <div className="min-h-screen" style={{ background: 'hsl(220 20% 97%)' }}>
      {/* ── Animated Hero Title ── */}
      <div className="flex flex-col items-center justify-center pt-16 pb-6 px-4 text-center">
        <div className="relative inline-block">
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
              background: 'linear-gradient(135deg, hsl(230 70% 45%) 0%, hsl(270 60% 55%) 50%, hsl(200 75% 45%) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
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
          style={{ color: 'hsl(220 15% 48%)' }}
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
            style={{ borderColor: 'hsl(220 15% 80%)', color: 'hsl(220 25% 30%)' }}
          >
            Find Bands
          </Link>
        </motion.div>
      </div>

      {/* ── Bubble Cluster ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.7 }}
        className="pb-24 px-4 flex flex-col items-center"
        onClick={() => navigate('/discover')}
      >
        <p className="text-center text-xs font-semibold uppercase tracking-widest mb-4"
           style={{ color: 'hsl(220 15% 55%)' }}>
          Explore by Genre
        </p>

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