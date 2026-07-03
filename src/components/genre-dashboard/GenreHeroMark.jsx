import React from 'react';
import { GENRE_DECOR_ICONS } from '@/lib/genreIcons';

// Large, flat, low-opacity genre silhouette for the genre space hero's empty right side.
// Deliberately different treatment from the modal's glowing corner icon: no glow, no motion, pure silhouette.
export default function GenreHeroMark({ genreId, accent }) {
  const Icon = GENRE_DECOR_ICONS[genreId];
  if (!Icon) return null;

  return (
    <div
      className="hidden md:block absolute right-0 top-1/2 pointer-events-none select-none"
      style={{ transform: 'translateY(-50%)', zIndex: 0 }}
    >
      <Icon style={{ width: 220, height: 220, color: accent, opacity: 0.07 }} strokeWidth={1} />
    </div>
  );
}