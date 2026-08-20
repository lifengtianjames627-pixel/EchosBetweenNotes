import React from 'react';
import { motion } from 'framer-motion';

// Stat tiles with a staggered rise — same information, more rhythm.
export default function StatStrip({ stats }) {
  return (
    <div className="grid grid-cols-4 gap-2.5 sm:gap-3 mb-7">
      {stats.map(({ label, val }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 * i, duration: 0.4, ease: 'easeOut' }}
          className="relative overflow-hidden text-center px-2 py-3.5 rounded-2xl"
          style={{ background: 'rgba(12,15,35,0.8)', border: '1px solid rgba(124,111,255,0.12)' }}
        >
          <span aria-hidden className="absolute inset-x-0 top-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(165,180,252,0.6), transparent)' }} />
          <p className="text-2xl font-black" style={{ color: '#a5b4fc', fontFamily: 'Playfair Display, Georgia, serif' }}>{val}</p>
          <p className="text-[10px] uppercase tracking-widest mt-1" style={{ color: 'rgba(140,155,210,0.45)' }}>{label}</p>
        </motion.div>
      ))}
    </div>
  );
}