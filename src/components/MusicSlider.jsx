import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Plus, Disc3, Music2 } from 'lucide-react';

// Simple waveform bars decoration
function Waveform({ accent, active }) {
  const bars = [3, 5, 8, 6, 9, 5, 7, 4, 8, 6, 4, 7, 5, 9, 6];
  return (
    <div className="flex items-end gap-[2px]" style={{ height: 16 }}>
      {bars.map((h, i) => (
        <motion.div
          key={i}
          animate={active ? { scaleY: [1, 0.4 + Math.random() * 0.6, 1] } : { scaleY: 0.3 }}
          transition={active ? { duration: 0.6 + i * 0.04, repeat: Infinity, ease: 'easeInOut', delay: i * 0.05 } : {}}
          style={{
            width: 2,
            height: h * 1.5,
            background: accent,
            borderRadius: 1,
            opacity: active ? 0.7 : 0.2,
            transformOrigin: 'bottom',
          }}
        />
      ))}
    </div>
  );
}

// Vinyl ring decoration for items without cover art
function VinylPlaceholder({ accent, spinning }) {
  return (
    <motion.div
      className="w-full h-full flex items-center justify-center relative"
      animate={spinning ? { rotate: 360 } : {}}
      transition={spinning ? { duration: 4, repeat: Infinity, ease: 'linear' } : {}}
    >
      {/* Outer ring */}
      <div className="absolute inset-4 rounded-full" style={{ border: `2px solid ${accent}30` }} />
      <div className="absolute inset-7 rounded-full" style={{ border: `1px solid ${accent}20` }} />
      <div className="absolute inset-10 rounded-full" style={{ border: `1px solid ${accent}15` }} />
      {/* Center */}
      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${accent}25`, border: `1px solid ${accent}40` }}>
        <div className="w-2 h-2 rounded-full" style={{ background: accent }} />
      </div>
    </motion.div>
  );
}

export default function MusicSlider({ items, v, onItemClick, onAddClick, label }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef(null);
  const itemRefs = useRef([]);

  const CARD_W = 180;
  const CARD_GAP = 20;

  // Scroll the active card into center
  const scrollToIdx = useCallback((idx) => {
    const container = containerRef.current;
    if (!container) return;
    const totalItems = items.length;
    if (totalItems === 0) return;
    const cw = container.clientWidth;
    const offset = idx * (CARD_W + CARD_GAP) - cw / 2 + CARD_W / 2;
    container.scrollTo({ left: Math.max(0, offset), behavior: 'smooth' });
  }, [items.length]);

  useEffect(() => {
    scrollToIdx(activeIdx);
  }, [activeIdx, scrollToIdx]);

  // Detect which card is closest to center on scroll
  const onScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    const cw = container.clientWidth;
    const center = container.scrollLeft + cw / 2;
    let closest = 0;
    let minDist = Infinity;
    items.forEach((_, i) => {
      const cardCenter = i * (CARD_W + CARD_GAP) + CARD_W / 2;
      const dist = Math.abs(cardCenter - center);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    setActiveIdx(closest);
  };

  const prev = () => setActiveIdx(i => Math.max(0, i - 1));
  const next = () => setActiveIdx(i => Math.min(items.length - 1, i + 1));

  const activeItem = items[activeIdx];

  return (
    <div className="mb-10">
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Music2 className="w-3.5 h-3.5" style={{ color: v.accent, opacity: 0.7 }} />
          <h2 className="text-xs uppercase tracking-widest font-bold" style={{ color: v.muted }}>{label}</h2>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${v.accent}15`, color: v.accent }}>
            {items.length}
          </span>
        </div>
        <button
          onClick={onAddClick}
          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105"
          style={{ border: `1px solid ${v.accent}50`, color: v.accent, background: `${v.accent}0d` }}
        >
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>

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
        <>
          {/* Active item info bar */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeItem?.id}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between mb-4 px-1"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: v.text }}>{activeItem?.title}</p>
                <p className="text-xs truncate" style={{ color: v.muted }}>{activeItem?.artist}{activeItem?.release_year ? ` · ${activeItem.release_year}` : ''}</p>
              </div>
              <div className="flex items-center gap-4 shrink-0 ml-4">
                <Waveform accent={v.accent} active={true} />
                {activeItem?.avg_rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3" style={{ color: v.accent }} fill="currentColor" />
                    <span className="text-xs font-semibold" style={{ color: v.accent }}>{activeItem.avg_rating?.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel */}
          <div className="relative">
            {/* Left fade */}
            <div className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none" style={{ background: `linear-gradient(to right, ${v.bg.includes('radial') ? '#000' : v.bg}, transparent)` }} />
            {/* Right fade */}
            <div className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none" style={{ background: `linear-gradient(to left, ${v.bg.includes('radial') ? '#000' : v.bg}, transparent)` }} />

            <div
              ref={containerRef}
              onScroll={onScroll}
              className="flex items-end pb-3 overflow-x-auto"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                gap: CARD_GAP,
                paddingLeft: '50%',
                paddingRight: '50%',
                cursor: 'grab',
              }}
            >
              {items.map((item, i) => {
                const isActive = i === activeIdx;
                const dist = Math.abs(i - activeIdx);
                const scale = isActive ? 1 : Math.max(0.78, 1 - dist * 0.1);
                const opacity = isActive ? 1 : Math.max(0.35, 1 - dist * 0.25);

                return (
                  <motion.div
                    key={item.id}
                    animate={{ scale, opacity }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                    className="shrink-0 cursor-pointer"
                    style={{ width: CARD_W, transformOrigin: 'bottom center' }}
                    onClick={() => {
                      if (isActive) onItemClick(item);
                      else setActiveIdx(i);
                    }}
                  >
                    {/* Cover art */}
                    <div
                      className="rounded-2xl overflow-hidden relative"
                      style={{
                        width: CARD_W,
                        height: CARD_W,
                        background: `${v.accent}14`,
                        border: isActive ? `1.5px solid ${v.accent}70` : `1px solid ${v.cardBorder}`,
                        boxShadow: isActive ? `0 0 30px ${v.accentGlow}, 0 8px 32px rgba(0,0,0,0.5)` : '0 4px 16px rgba(0,0,0,0.3)',
                      }}
                    >
                      {item.cover_url ? (
                        <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <VinylPlaceholder accent={v.accent} spinning={isActive} />
                      )}

                      {/* Active: tap hint overlay */}
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 flex items-end justify-center pb-3"
                        >
                          <span
                            className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(0,0,0,0.55)', color: v.accent, backdropFilter: 'blur(4px)' }}
                          >
                            Tap to review
                          </span>
                        </motion.div>
                      )}
                    </div>

                    {/* Dot indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="slider-dot"
                        className="mx-auto mt-2 w-1.5 h-1.5 rounded-full"
                        style={{ background: v.accent, boxShadow: `0 0 6px ${v.accent}` }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Dot pagination */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {items.length > 1 && items.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className="transition-all"
                style={{
                  width: i === activeIdx ? 16 : 5,
                  height: 5,
                  borderRadius: 3,
                  background: i === activeIdx ? v.accent : `${v.accent}30`,
                  boxShadow: i === activeIdx ? `0 0 6px ${v.accent}` : 'none',
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}