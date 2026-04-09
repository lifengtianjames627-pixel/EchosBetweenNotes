import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Disc3 } from 'lucide-react';

// SVG grain filter for film/vinyl texture
function GrainFilter({ id }) {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0 }}>
      <defs>
        <filter id={id}>
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feBlend in="SourceGraphic" mode="multiply" />
        </filter>
      </defs>
    </svg>
  );
}

function VinylPlaceholder({ accent }) {
  return (
    <motion.div
      className="w-full h-full flex items-center justify-center relative"
      animate={{ rotate: 360 }}
      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
    >
      {[3, 6, 9, 12].map((inset, i) => (
        <div key={i} className="absolute rounded-full" style={{
          inset, border: `1px solid ${accent}${['25', '1a', '12', '08'][i]}`,
        }} />
      ))}
      <div className="w-6 h-6 rounded-full" style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}>
        <div className="w-2 h-2 rounded-full m-auto mt-2" style={{ background: accent }} />
      </div>
    </motion.div>
  );
}

export default function MusicSlider({ items, v, onItemClick, onAddClick, label }) {
  const [hovered, setHovered] = useState(null);
  const filterId = `grain-${label}`;

  return (
    <div className="mb-14">
      <GrainFilter id={filterId} />

      {/* Section header — editorial, left-aligned */}
      <div className="flex items-baseline justify-between mb-7">
        <div>
          <span className="text-[10px] uppercase tracking-[0.22em] font-medium block mb-1" style={{ color: `${v.muted}80` }}>
            {label === 'Albums' ? 'Long-form' : 'Singles & EPs'}
          </span>
          <h2 className="font-playfair italic text-2xl leading-none" style={{ color: v.text, letterSpacing: '-0.01em' }}>
            {label}
          </h2>
        </div>
        <button
          onClick={onAddClick}
          className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full transition-all hover:opacity-80"
          style={{ color: v.muted, border: `1px solid ${v.accent}30` }}
        >
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>

      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 cursor-pointer"
          style={{ borderTop: `1px solid ${v.accent}15`, borderBottom: `1px solid ${v.accent}15` }}
          onClick={onAddClick}
        >
          <Disc3 className="w-7 h-7 mb-3" style={{ color: v.accent, opacity: 0.25 }} />
          <p className="text-xs font-playfair italic" style={{ color: `${v.muted}60` }}>
            No {label.toLowerCase()} yet — be the first
          </p>
        </motion.div>
      ) : (
        <div
          className="flex gap-7 overflow-x-auto pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className="shrink-0 cursor-pointer group"
              style={{ width: 176 }}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onItemClick(item)}
            >
              {/* Cover — dominant visual element */}
              <motion.div
                animate={{
                  scale: hovered === item.id ? 1.035 : 1,
                  y: hovered === item.id ? -6 : 0,
                }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                className="relative overflow-hidden mb-4"
                style={{
                  width: 176,
                  height: 176,
                  borderRadius: 8,
                  background: `${v.accent}10`,
                  boxShadow: hovered === item.id
                    ? `0 20px 50px rgba(0,0,0,0.7), 0 0 0 1px ${v.accent}30`
                    : `0 6px 20px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.04)`,
                }}
              >
                {item.cover_url ? (
                  <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <VinylPlaceholder accent={v.accent} />
                )}

                {/* Film grain overlay */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    filter: `url(#${filterId})`,
                    opacity: 0.06,
                    mixBlendMode: 'overlay',
                    background: '#888',
                  }}
                />

                {/* Inner vignette */}
                <div className="absolute inset-0 pointer-events-none rounded"
                  style={{ boxShadow: 'inset 0 0 30px rgba(0,0,0,0.55)' }} />

                {/* Hover label */}
                <motion.div
                  animate={{ opacity: hovered === item.id ? 1 : 0 }}
                  className="absolute inset-0 flex items-end pb-3 justify-center"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)' }}
                >
                  <span className="text-[9px] uppercase tracking-[0.18em] font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    Read Reviews
                  </span>
                </motion.div>
              </motion.div>

              {/* Text — humanist, unboxed */}
              <p className="font-playfair text-sm font-semibold leading-snug truncate" style={{ color: v.text }}>{item.title}</p>
              <p className="text-[11px] mt-0.5 truncate uppercase tracking-wider" style={{ color: `${v.muted}90` }}>{item.artist}</p>

              {/* Rating — numeric, minimal */}
              {item.avg_rating > 0 && (
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="font-playfair font-bold text-sm" style={{ color: v.accent }}>
                    {(item.avg_rating * 2).toFixed(1)}
                  </span>
                  <span className="text-[10px]" style={{ color: `${v.muted}50` }}>/ 10</span>
                  {item.review_count > 0 && (
                    <span className="text-[10px] ml-1" style={{ color: `${v.muted}40` }}>
                      {item.review_count} {item.review_count === 1 ? 'review' : 'reviews'}
                    </span>
                  )}
                </div>
              )}

              {/* Tags */}
              {item.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm"
                      style={{ background: `${v.accent}12`, color: `${v.accent}99` }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}