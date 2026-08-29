import React from 'react';
import { motion } from 'framer-motion';

const PHOTOS = {
  rock: ['https://images.unsplash.com/photo-1546708770-589dab7b22c7?auto=format&fit=crop&w=1800&q=85', 'Guns N’ Roses · AC/DC · Motörhead'],
  pop: ['https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=1800&q=85'], classical: ['https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1800&q=85'],
  metal: ['https://media.base44.com/images/public/69bfbc84f5aa64ed245721b1/f19f3b28d_image.png', 'Wacken Open Air · 83,400 voices'],  jazz: ['https://images.unsplash.com/photo-1630754157722-f18671962ff4?auto=format&fit=crop&w=1800&q=85'],
  blues: ['https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1800&q=85'], r_and_b: ['https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1800&q=85'],
  core: ['https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1800&q=85'], country: ['https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1800&q=85'],
  hip_hop: ['https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1800&q=85'], indie: ['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1800&q=85'],
  grunge: ['https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1800&q=85'], electronic: ['https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1800&q=85'],
  funk: ['https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1800&q=85'], acg: ['https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1800&q=85'], cinematic: ['https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1800&q=85'],
};

export default function GenrePhotoHero({ genreId, label, tagline, description, v }) {
  const [photo, note] = PHOTOS[genreId] || PHOTOS.electronic;
  return <motion.section initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative mb-14 min-h-[420px] overflow-hidden rounded-3xl" style={{ border: `1px solid ${v.accent}40` }}>
    <img src={photo} alt={`${label} live music scene`} className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${v.bg.includes('#') ? '#050509' : '#060712'}e8 0%, rgba(5,6,12,0.62) 55%, rgba(5,6,12,0.16) 100%)` }} />
    <div className="relative flex min-h-[420px] max-w-2xl flex-col justify-end p-7 sm:p-10"><p className="text-[10px] uppercase tracking-[0.28em] font-bold" style={{ color: v.text }}>{tagline}</p><h1 className="mt-3 font-playfair text-5xl italic leading-none sm:text-7xl" style={{ ...v.headerStyle, color: v.accent, textShadow: `0 0 45px ${v.accentGlow}` }}>{label}</h1><p className="mt-4 max-w-lg text-sm leading-relaxed sm:text-base" style={{ color: v.text }}>{description}</p>{note && <p className="mt-6 text-[10px] uppercase tracking-[0.2em]" style={{ color: `${v.text}aa` }}>{note}</p>}</div>
  </motion.section>;
}