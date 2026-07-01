import React from 'react';
import { motion } from 'framer-motion';
import { Mic2, Plus, Clock } from 'lucide-react';

export default function PodcastCategorySection({ category, episodes, onAddClick }) {
  return (
    <div className="mb-14">
      <div className="flex items-start justify-between mb-5 gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.22em] font-medium block mb-1" style={{ color: `${category.accent}90` }}>
            {category.tagline}
          </span>
          <h2 className="font-playfair italic text-2xl leading-none" style={{ color: 'rgba(230,232,255,0.95)' }}>
            {category.label}
          </h2>
          <p className="text-xs mt-2 max-w-md" style={{ color: 'rgba(140,155,210,0.55)' }}>{category.desc}</p>
        </div>
        <button
          onClick={onAddClick}
          className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full shrink-0 transition-all hover:opacity-80"
          style={{ color: category.accent, border: `1px solid ${category.accent}40` }}
        >
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>

      {episodes.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-10 cursor-pointer"
          style={{ borderTop: `1px solid ${category.accent}18`, borderBottom: `1px solid ${category.accent}18` }}
          onClick={onAddClick}
        >
          <Mic2 className="w-6 h-6 mb-2" style={{ color: category.accent, opacity: 0.3 }} />
          <p className="text-xs font-playfair italic" style={{ color: 'rgba(140,155,210,0.45)' }}>No episodes yet — submit the first</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {episodes.map((ep, i) => (
            <motion.div
              key={ep.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex gap-4 p-4"
              style={{ borderTop: `1px solid ${category.accent}15` }}
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
                style={{ background: `${category.accent}14` }}>
                {ep.cover_url ? (
                  <img src={ep.cover_url} alt={ep.title} className="w-full h-full object-cover" />
                ) : (
                  <Mic2 className="w-6 h-6" style={{ color: category.accent, opacity: 0.5 }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-playfair text-sm font-semibold leading-snug truncate" style={{ color: 'rgba(230,232,255,0.95)' }}>{ep.title}</p>
                <p className="text-[11px] mt-0.5 uppercase tracking-wider truncate" style={{ color: `${category.accent}bb` }}>{ep.host_name}</p>
                {ep.description && <p className="text-xs mt-1.5 line-clamp-2" style={{ color: 'rgba(140,155,210,0.55)' }}>{ep.description}</p>}
                {ep.duration_minutes > 0 && (
                  <div className="flex items-center gap-1 mt-1.5 text-[10px]" style={{ color: 'rgba(140,155,210,0.4)' }}>
                    <Clock className="w-3 h-3" /> {ep.duration_minutes} min
                  </div>
                )}
                {ep.audio_url && (
                  <audio controls src={ep.audio_url} className="w-full mt-2" style={{ height: 32 }} />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}