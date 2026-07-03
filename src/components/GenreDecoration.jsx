import React from 'react';
import { Guitar, Skull, Sparkles, Music2, Mic2, Music4, Radio, Flame, Disc3, Leaf, Volume2, Zap, PartyPopper, Gamepad2, Compass } from 'lucide-react';

const ICONS = {
  rock: Guitar,
  pop: Sparkles,
  classical: Music2,
  metal: Skull,
  jazz: Mic2,
  blues: Music4,
  r_and_b: Radio,
  hardcore: Flame,
  country: Compass,
  hip_hop: Disc3,
  indie: Leaf,
  grunge: Volume2,
  electronic: Zap,
  funk: PartyPopper,
  acg: Gamepad2,
};

// Subtle themed watermark icon shown in the corner of the review modal, per genre.
export default function GenreDecoration({ genreId, accent }) {
  const Icon = ICONS[genreId];
  if (!Icon) return null;

  return (
    <div className="absolute top-1 right-2 pointer-events-none" style={{ zIndex: 0 }}>
      <Icon
        style={{
          width: 88,
          height: 88,
          color: accent,
          opacity: 0.14,
          filter: `drop-shadow(0 0 18px ${accent})`,
        }}
        strokeWidth={1.2}
      />
    </div>
  );
}