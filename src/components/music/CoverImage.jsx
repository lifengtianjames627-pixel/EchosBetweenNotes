import React, { useMemo, useState } from 'react';

const FALLBACKS = [
  'https://media.base44.com/images/public/69bfbc84f5aa64ed245721b1/9e48e0666_generated_image.png',
  'https://media.base44.com/images/public/69bfbc84f5aa64ed245721b1/77f788a45_generated_image.png',
  'https://media.base44.com/images/public/69bfbc84f5aa64ed245721b1/2b2f8e2e1_generated_image.png',
  'https://media.base44.com/images/public/69bfbc84f5aa64ed245721b1/150deb65c_generated_image.png',
  'https://media.base44.com/images/public/69bfbc84f5aa64ed245721b1/085f8937d_generated_image.png',
];

export default function CoverImage({ src, alt, className, loading = 'lazy' }) {
  const start = useMemo(() => Array.from(`${alt}${src}`).reduce((sum, char) => sum + char.charCodeAt(0), 0) % FALLBACKS.length, [alt, src]);
  const [fallbackStep, setFallbackStep] = useState(0);
  const imageSrc = src && fallbackStep === 0 ? src : FALLBACKS[(start + fallbackStep - (src ? 1 : 0) + FALLBACKS.length) % FALLBACKS.length];
  return <img src={imageSrc} alt={alt} loading={loading} decoding="async" className={className} onError={() => setFallbackStep(step => step < FALLBACKS.length ? step + 1 : step)} />;
}