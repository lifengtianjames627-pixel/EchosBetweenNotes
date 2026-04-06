import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Plus, Disc3, Music2 } from 'lucide-react';

function Waveform({ accent }) {
  const bars = [3, 5, 8, 6, 9, 5, 7, 4, 8, 6, 4, 7];
  return (
    <div className="flex items-end gap-[2px]" style={{ height: 14 }}>
      {bars.map((h, i) => (
        <motion.div
          key={i}
          animate={{ scaleY: [1, 0.3 + Math.random() * 0.7, 1] }}
          transition={{ duration: 0.7 + i * 0.05, repeat: Infinity, ease: 'easeInOut', delay: i * 0.06 }}
          style={{
            width: 2,
            height: h * 1.4,
            background: accent,
            borderRadius: 1,
            opacity: 0.6,
            transformOrigin: 'bottom',
          }}
        />
      ))}
    </div>
  );
}

function VinylPlaceholder({ accent }) {
  return (
    <motion.div
      className="w-full h-full flex items-center justify-center relative"
      animate={{ rotate: 360 }}
      transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
    >
      <div className="absolute inset-3 rounded-full" style={{ border: `2px solid ${accent}25` }} />
      <div className="absolute inset-6 rounded-full" style={{ border: `1px solid ${accent}18` }} />
      <div className="absolute inset-9 rounded-full" style={{ border: `1px solid ${accent}12` }} />
      <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: `${accent}20`, border: `1px solid ${accent}40` }}>
        <div className="w-2 h-2 rounded-full" style={{ background: accent }} />
      </div>
    </motion.div>
  );
}

export default function MusicSlider({ items, v, onItemClick, onAddClick, label }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="mb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Music2 className="w-3.5 h-3.5" style={{ color: v.accent, opacity: 0.7 }} />
          <h2 className="text-xs uppercase tracking-widest font-bold" style={{ color: v.muted }}>{label}</h2>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${v.accent}15`, color: v.accent }}>
            {items.length}
          </span>
          {items.length > 0 && <Waveform accent={v.accent} />}
        </div>
        <button
          onClick={onAddClick}
          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105"
          style={{ border: `1px solid ${v.accent}50`, color: v.accent, background: `${v.accent}0d` }}
        >
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>

      {/* Empty state */}
      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-10 rounded-2xl cursor-pointer"
          style={{ border: `1px dashed ${v.accent}25` }}
          onClick={onAddClick}
        >
          <Disc3 className="w-8 h-8 mb-2" style={{ color: v.accent, opacity: 0.3 }} />
          <p className="text-xs" style={{ color: v.muted }}>No {label.toLowerCase()} yet — add the first</p>
        </motion.div>
      ) : (
        /* Cards — centered when few, scrollable when many */
        <div
          className="flex gap-5 overflow-x-auto pb-3"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="shrink-0 cursor-pointer"
              style={{ width: 160 }}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onItemClick(item)}
            >
              {/* Cover */}
              <motion.div
                animate={{ scale: hovered === item.id ? 1.04 : 1, y: hovered === item.id ? -4 : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className="rounded-2xl overflow-hidden relative mb-3"
                style={{
                  width: 160,
                  height: 160,
                  background: `${v.accent}14`,
                  border: hovered === item.id ? `1.5px solid ${v.accent}80` : `1px solid ${v.cardBorder}`,
                  boxShadow: hovered === item.id
                    ? `0 0 28px ${v.accentGlow}, 0 8px 24px rgba(0,0,0,0.5)`
                    : `0 4px 14px rgba(0,0,0,0.3)`,
                }}
              >
                {item.cover_url ? (
                  <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <VinylPlaceholder accent={v.accent} />
                )}

                {/* Hover overlay */}
                <motion.div
                  animate={{ opacity: hovered === item.id ? 1 : 0 }}
                  transition={{ duration: 0.15 }}
                  className="absolute inset-0 flex items-end justify-center pb-3"
                  style={{ background: `linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)` }}
                >
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(0,0,0,0.5)', color: v.accent, backdropFilter: 'blur(4px)' }}
                  >
                    View Reviews
                  </span>
                </motion.div>
              </motion.div>

              <p className="text-sm font-semibold truncate" style={{ color: v.text }}>{item.title}</p>
              <p className="text-xs truncate mt-0.5" style={{ color: v.muted }}>{item.artist}</p>
              {item.avg_rating > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3 h-3" fill="currentColor" style={{ color: v.accent }} />
                  <span className="text-xs font-semibold" style={{ color: v.accent }}>{item.avg_rating?.toFixed(1)}</span>
                  <span className="text-xs" style={{ color: `${v.muted}80` }}>({item.review_count || 0})</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}