import React from 'react';

export default function GenreRail({ genres, onSelect }) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.24em] font-bold" style={{ color: '#6b6358' }}>Browse the stacks</p>
        <span className="text-xs" style={{ color: 'rgba(107,99,88,0.6)' }}>{genres.length} genres</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
        {genres.map(genre => (
          <button key={genre.id} onClick={() => onSelect(genre.id)} className="shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors" style={{ background: '#fbf8f2', border: '1px solid rgba(176,101,71,0.22)', color: '#5a4f44' }}>{genre.label}</button>
        ))}
      </div>
    </section>
  );
}