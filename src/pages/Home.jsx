import React, { useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GENRES } from '@/lib/genreConfig';

/* ── Genre bubble colors (elegant slate/indigo palette, no pink) ── */
const BUBBLE_COLORS = [
  { bg: 'hsl(230 55% 92%)', border: 'hsl(230 50% 75%)', text: 'hsl(230 55% 28%)', dot: 'hsl(230 60% 45%)' },
  { bg: 'hsl(250 50% 92%)', border: 'hsl(250 45% 73%)', text: 'hsl(250 50% 28%)', dot: 'hsl(250 55% 50%)' },
  { bg: 'hsl(200 55% 90%)', border: 'hsl(200 50% 70%)', text: 'hsl(200 55% 22%)', dot: 'hsl(200 65% 42%)' },
  { bg: 'hsl(160 45% 88%)', border: 'hsl(160 40% 62%)', text: 'hsl(160 50% 20%)', dot: 'hsl(160 50% 38%)' },
  { bg: 'hsl(30 55% 90%)',  border: 'hsl(30 50% 68%)',  text: 'hsl(30 55% 22%)',  dot: 'hsl(30 65% 42%)' },
  { bg: 'hsl(345 30% 91%)', border: 'hsl(345 28% 70%)', text: 'hsl(345 35% 25%)', dot: 'hsl(345 40% 45%)' },
  { bg: 'hsl(270 40% 92%)', border: 'hsl(270 38% 72%)', text: 'hsl(270 45% 26%)', dot: 'hsl(270 50% 48%)' },
  { bg: 'hsl(185 50% 89%)', border: 'hsl(185 45% 66%)', text: 'hsl(185 55% 20%)', dot: 'hsl(185 60% 38%)' },
  { bg: 'hsl(45 55% 90%)',  border: 'hsl(45 50% 66%)',  text: 'hsl(45 55% 20%)',  dot: 'hsl(45 65% 40%)' },
  { bg: 'hsl(215 45% 91%)', border: 'hsl(215 40% 70%)', text: 'hsl(215 50% 24%)', dot: 'hsl(215 55% 44%)' },
  { bg: 'hsl(130 35% 90%)', border: 'hsl(130 32% 66%)', text: 'hsl(130 40% 22%)', dot: 'hsl(130 45% 38%)' },
  { bg: 'hsl(12 45% 90%)',  border: 'hsl(12 40% 66%)',  text: 'hsl(12 50% 22%)',  dot: 'hsl(12 55% 42%)' },
  { bg: 'hsl(260 40% 92%)', border: 'hsl(260 36% 72%)', text: 'hsl(260 44% 26%)', dot: 'hsl(260 48% 46%)' },
];

/* ── Single genre bubble ── */
function GenreBubble({ genre, colorIdx, navigate }) {
  const c = BUBBLE_COLORS[colorIdx % BUBBLE_COLORS.length];

  return (
    <motion.div
      whileHover={{ scale: 1.12 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      onClick={() => navigate('/discover')}
      className="cursor-pointer select-none flex flex-col items-center justify-center rounded-full shadow-md"
      style={{
        background: c.bg,
        border: `2px solid ${c.border}`,
        width: 'clamp(110px, 14vw, 170px)',
        height: 'clamp(110px, 14vw, 170px)',
      }}
    >
      <span className="text-3xl mb-1">{genre.icon}</span>
      <span className="text-xs font-semibold tracking-wide" style={{ color: c.text }}>
        {genre.label.toUpperCase()}
      </span>
    </motion.div>
  );
}

/* ── Home ── */
export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ background: 'hsl(220 20% 97%)' }}>
      {/* Hero */}
      <div className="flex flex-col items-center justify-center pt-20 pb-10 px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="font-black tracking-tight leading-none"
          style={{
            fontSize: 'clamp(3rem, 10vw, 8rem)',
            color: 'hsl(220 30% 10%)',
            letterSpacing: '-0.03em',
          }}
        >
          Music Critics
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="mt-4 text-base md:text-lg max-w-xl"
          style={{ color: 'hsl(220 15% 48%)' }}
        >
          Honest reviews. Every genre. By people who actually care.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.38 }}
          className="mt-8 flex gap-3"
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

      {/* Genre bubbles */}
      <div className="pb-20 px-6">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs font-semibold uppercase tracking-widest mb-10"
          style={{ color: 'hsl(220 15% 55%)' }}
        >
          Explore by Genre
        </motion.p>
        <div className="flex flex-wrap justify-center gap-5 max-w-5xl mx-auto">
          {GENRES.map((genre, i) => (
            <motion.div
              key={genre.id}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.55 + i * 0.05 }}
            >
              <GenreBubble genre={genre} colorIdx={i} navigate={navigate} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}