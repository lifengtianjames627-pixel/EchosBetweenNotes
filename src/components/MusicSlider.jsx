import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Plus } from 'lucide-react';

export default function MusicSlider({ items, v, onItemClick, onAddClick, label }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 280, behavior: 'smooth' });
  };

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };

  return (
    <div className="mb-10">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs uppercase tracking-widest font-bold" style={{ color: v.muted }}>
          {label}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onAddClick}
            className="flex items-center gap-1 text-xs px-3 py-1 rounded-full"
            style={{ border: `1px solid ${v.accent}50`, color: v.accent }}
          >
            <Plus className="w-3 h-3" /> Add
          </button>
          <button
            onClick={() => scroll(-1)}
            disabled={!canScrollLeft}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-opacity"
            style={{ background: `${v.accent}20`, color: v.accent, opacity: canScrollLeft ? 1 : 0.3 }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll(1)}
            disabled={!canScrollRight}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-opacity"
            style={{ background: `${v.accent}20`, color: v.accent, opacity: canScrollRight ? 1 : 0.3 }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable row */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex gap-4 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.length === 0 && (
          <div
            className="shrink-0 w-40 h-52 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer"
            style={{ border: `1px dashed ${v.accent}30`, color: v.muted }}
            onClick={onAddClick}
          >
            <Plus className="w-5 h-5" />
            <span className="text-xs">Add first</span>
          </div>
        )}
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="shrink-0 w-40 cursor-pointer group"
            onClick={() => onItemClick(item)}
          >
            {/* Cover */}
            <div
              className="w-40 h-40 rounded-xl overflow-hidden mb-3 relative"
              style={{ background: `${v.accent}18`, border: `1px solid ${v.cardBorder}` }}
            >
              {item.cover_url ? (
                <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">🎵</div>
              )}
              {/* Hover overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl"
                style={{ background: `${v.accent}22`, boxShadow: `inset 0 0 20px ${v.accentGlow}` }}
              >
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: v.accent }}>Reviews</span>
              </div>
            </div>
            <p className="text-sm font-semibold truncate" style={{ color: v.text }}>{item.title}</p>
            <p className="text-xs truncate mt-0.5" style={{ color: v.muted }}>{item.artist}</p>
            {item.avg_rating > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3 h-3" style={{ color: v.accent }} fill="currentColor" />
                <span className="text-xs" style={{ color: v.muted }}>{item.avg_rating?.toFixed(1)}</span>
                <span className="text-xs" style={{ color: v.muted + '60' }}>({item.review_count || 0})</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}