import React from 'react';

// Giant spinning vinyl record anchored to the right half of the hero.
// Sits behind the content, fades toward the centre so it never fights the text.
export default function VinylDisc() {
  return (
    <div
      aria-hidden
      className="absolute z-0 pointer-events-none hidden md:block top-1/2 -translate-y-1/2"
      style={{
        right: '-26vw', width: 'min(96vh, 64vw)', aspectRatio: '1',
        maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.25) 22%, #000 42%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.25) 22%, #000 42%)',
        opacity: 0.85,
      }}
    >
      <div className="relative w-full h-full rounded-full animate-[spin_9s_linear_infinite]"
        style={{
          background: 'repeating-radial-gradient(circle, #151412 0 1.5px, #22201c 1.5px 3px), #181714',
          boxShadow: '0 30px 80px rgba(40,30,20,0.35), inset 0 0 0 6px #0d0c0b',
        }}>
        {/* Light sheen sweeping across the grooves */}
        <div className="absolute inset-0 rounded-full"
          style={{ background: 'conic-gradient(from 20deg, transparent 0 12%, rgba(255,248,235,0.14) 18%, transparent 26% 55%, rgba(255,248,235,0.1) 62%, transparent 70%)' }} />
        {/* Paper-toned centre label */}
        <div className="absolute rounded-full flex items-center justify-center"
          style={{ inset: '34%', background: 'radial-gradient(circle, #d9a565 0%, #bf7a35 100%)', boxShadow: 'inset 0 0 0 3px rgba(26,24,21,0.5)' }}>
          <span className="font-playfair italic text-center leading-tight" style={{ color: '#1a1815', fontSize: 'clamp(10px, 1.4vw, 20px)' }}>
            Echo<br />Between Notes
          </span>
          <div className="absolute rounded-full" style={{ width: '9%', height: '9%', background: '#f3efe6' }} />
        </div>
      </div>
    </div>
  );
}