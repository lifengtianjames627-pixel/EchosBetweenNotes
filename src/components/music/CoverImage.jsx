import React, { useState } from 'react';
import { Music } from 'lucide-react';

// When a real cover URL exists, show it. When it's missing or fails to load,
// show a clean, honest placeholder (title + music note) — never fake
// performance photography masquerading as album art.
export default function CoverImage({ src, alt, className, loading = 'lazy' }) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return (
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        className={className}
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div className={className} style={{ background: 'linear-gradient(135deg, #1a1a22 0%, #0f0f16 100%)' }}>
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-center">
        <Music className="h-6 w-6 shrink-0 opacity-25" style={{ color: '#9a9ab0' }} />
        <span className="line-clamp-3 text-xs leading-tight opacity-50" style={{ color: '#c8c8d8' }}>
          {alt}
        </span>
      </div>
    </div>
  );
}