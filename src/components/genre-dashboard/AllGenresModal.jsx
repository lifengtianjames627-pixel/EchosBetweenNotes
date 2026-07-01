import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { BUBBLE_COLORS, GENRE_ICONS } from '@/lib/genreVisuals';

export default function AllGenresModal({ genres, onClose, onSelect }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.75)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 22, stiffness: 260 }}
          className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl p-6"
          style={{ background: 'rgba(10,12,30,0.98)', border: '1px solid rgba(124,111,255,0.2)' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold" style={{ color: 'rgba(220,225,255,0.95)' }}>All Genres</h3>
            <button onClick={onClose} style={{ color: 'rgba(160,175,220,0.5)' }}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {genres.map((genre, i) => {
              const c = BUBBLE_COLORS[i % BUBBLE_COLORS.length];
              const IconSvg = GENRE_ICONS[genre.id] || GENRE_ICONS['electronic'];
              return (
                <button
                  key={genre.id}
                  onClick={() => onSelect(genre.id)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl transition-transform hover:scale-105"
                  style={{ background: c.bg, border: `1px solid ${c.border}55` }}
                >
                  <div style={{ width: 34, height: 34, filter: `drop-shadow(0 0 6px ${c.border})` }}>
                    {IconSvg(c.border)}
                  </div>
                  <span className="text-xs font-bold uppercase" style={{ color: c.text, letterSpacing: '0.08em' }}>
                    {genre.label}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}