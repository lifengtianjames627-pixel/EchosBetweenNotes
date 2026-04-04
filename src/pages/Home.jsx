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

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function FloatingBubble({ genre, colorIdx, size, floatX, floatY, duration, delay }) {
  const c = BUBBLE_COLORS[colorIdx % BUBBLE_COLORS.length];

  return (
    <motion.div
      animate={{
        x: [0, floatX, -floatX * 0.6, floatX * 0.4, 0],
        y: [0, floatY, -floatY * 0.5, floatY * 0.7, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{ width: size, height: size }}
    >
      <motion.div
        whileHover={{ scale: 1.18 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="w-full h-full rounded-full flex flex-col items-center justify-center cursor-pointer shadow-md"
        style={{
          background: c.bg,
          border: `2px solid ${c.border}`,
        }}
      >
        <span style={{ fontSize: size * 0.28 }}>{genre.icon}</span>
        <span
          className="font-semibold tracking-wide text-center leading-tight px-2"
          style={{ color: c.text, fontSize: size * 0.115 }}
        >
          {genre.label.toUpperCase()}
        </span>
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const navigate = useNavigate();

  // Generate random layout params once per mount
  const bubbleParams = useMemo(() => {
    return GENRES.map((_, i) => ({
      size: Math.floor(rand(100, 175)),
      floatX: rand(10, 30) * (Math.random() > 0.5 ? 1 : -1),
      floatY: rand(10, 28) * (Math.random() > 0.5 ? 1 : -1),
      duration: rand(5, 10),
      delay: rand(0, 3),
    }));
  }, []);

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

      {/* Bubble cluster */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="pb-24 px-4"
        onClick={() => navigate('/discover')}
      >
        <p className="text-center text-xs font-semibold uppercase tracking-widest mb-8"
           style={{ color: 'hsl(220 15% 55%)' }}>
          Explore by Genre
        </p>

        {/* Clustered flex with random-feeling layout via varying margins */}
        <div
          className="flex flex-wrap justify-center items-center"
          style={{ gap: '0px', maxWidth: '860px', margin: '0 auto' }}
        >
          {GENRES.map((genre, i) => {
            const p = bubbleParams[i];
            // stagger vertical offsets so bubbles cluster & overlap naturally
            const mt = Math.floor(rand(-30, 10));
            const ml = Math.floor(rand(-18, 6));
            return (
              <div
                key={genre.id}
                style={{ marginTop: mt, marginLeft: ml, marginRight: ml * 0.4, zIndex: Math.floor(rand(1, 10)) }}
              >
                <FloatingBubble
                  genre={genre}
                  colorIdx={i}
                  size={p.size}
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