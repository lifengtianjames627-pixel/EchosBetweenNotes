// Genre skin layer (middle layer of the three-layer theme architecture).
// Top layer (nav) and bottom layer (cream #f3efe6 page base) never change.
// Only these values change per genre: hero photo overlay, accent colors,
// title typography, card radius. One template, 16 variable sets.

const HEAVY = "'Oswald', 'Arial Narrow', sans-serif";
const SLAB = "'Anton', 'Oswald', sans-serif";
const ROUND = "'Poppins', 'Inter', sans-serif";
const SERIF = "'Cormorant Garamond', Georgia, serif";
const ITALIC_SERIF = "'Playfair Display', Georgia, serif";
const TYPEWRITER = "'Courier Prime', 'Courier New', monospace";
const SOFT = "'Nunito', 'Inter', sans-serif";
const GEO = "'Space Grotesk', 'Inter', sans-serif";

// ink = hero title/desc color, subInk = hero tagline/note color.
const LIGHT_INK = { ink: '#faf8f2', subInk: 'rgba(250,248,242,0.72)' };
const DARK_INK = { ink: '#1a1815', subInk: 'rgba(26,24,21,0.6)' };

export const GENRE_SKINS = {
  rock: {
    accent: '#a0392e', accent2: '#7a2a22',
    overlay: 'linear-gradient(90deg, rgba(61,31,26,0.88) 0%, rgba(61,31,26,0.62) 55%, rgba(61,31,26,0.3) 100%)',
    titleFont: HEAVY, titleTransform: 'uppercase', titleStyle: { fontWeight: 700, letterSpacing: '-0.02em' },
    radius: 4, heroHeight: 440, ...LIGHT_INK,
  },
  pop: {
    accent: '#c45a7c', accent2: '#9c4460',
    overlay: 'linear-gradient(90deg, rgba(232,213,224,0.9) 0%, rgba(232,213,224,0.6) 55%, rgba(232,213,224,0.28) 100%)',
    titleFont: ROUND, titleTransform: 'none', titleStyle: { fontWeight: 700, letterSpacing: '-0.02em' },
    radius: 18, heroHeight: 420, ...DARK_INK,
  },
  classical: {
    accent: '#8b6914', accent2: '#6d5210',
    overlay: 'linear-gradient(90deg, rgba(26,39,68,0.86) 0%, rgba(26,39,68,0.62) 55%, rgba(26,39,68,0.34) 100%)',
    titleFont: SERIF, titleTransform: 'none', titleStyle: { fontWeight: 600, letterSpacing: '0.01em' },
    radius: 3, heroHeight: 400, narrow: true, ...LIGHT_INK,
  },
  metal: {
    accent: '#8b0000', accent2: '#666666',
    overlay: 'linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.72) 55%, rgba(0,0,0,0.42) 100%)',
    titleFont: HEAVY, titleTransform: 'uppercase', titleStyle: { fontWeight: 700, letterSpacing: '-0.03em' },
    radius: 0, heroHeight: 560, titleScale: 1.2, ...LIGHT_INK,
  },
  jazz: {
    accent: '#b8860b', accent2: '#722f37',
    overlay: 'linear-gradient(90deg, rgba(45,26,46,0.88) 0%, rgba(45,26,46,0.6) 55%, rgba(45,26,46,0.28) 100%)',
    titleFont: ITALIC_SERIF, titleTransform: 'none', titleStyle: { fontWeight: 700, fontStyle: 'italic', letterSpacing: '-0.01em' },
    radius: 10, heroHeight: 440, ...LIGHT_INK,
  },
  blues: {
    accent: '#1e3a5f', accent2: '#5c3a21',
    overlay: 'linear-gradient(90deg, rgba(45,31,15,0.88) 0%, rgba(45,31,15,0.64) 55%, rgba(45,31,15,0.32) 100%)',
    titleFont: TYPEWRITER, titleTransform: 'none', titleStyle: { fontWeight: 700, letterSpacing: '-0.02em' },
    radius: 5, heroHeight: 420, ...LIGHT_INK,
  },
  r_and_b: {
    accent: '#6b3fa0', accent2: '#a02060',
    overlay: 'linear-gradient(90deg, rgba(26,16,48,0.88) 0%, rgba(26,16,48,0.62) 55%, rgba(26,16,48,0.3) 100%)',
    titleFont: ROUND, titleTransform: 'none', titleStyle: { fontWeight: 600, fontStyle: 'italic', letterSpacing: '-0.01em' },
    radius: 12, heroHeight: 430, ...LIGHT_INK,
  },
  core: {
    accent: '#a8b800', accent2: '#ff6600',
    overlay: 'linear-gradient(90deg, rgba(0,0,0,0.93) 0%, rgba(0,0,0,0.74) 55%, rgba(0,0,0,0.44) 100%)',
    titleFont: SLAB, titleTransform: 'uppercase', titleStyle: { fontWeight: 400, letterSpacing: '-0.045em' },
    radius: 0, heroHeight: 470, titleScale: 1.1, ...LIGHT_INK,
  },
  country: {
    accent: '#4a6741', accent2: '#b87333',
    overlay: 'linear-gradient(90deg, rgba(61,43,31,0.86) 0%, rgba(61,43,31,0.58) 55%, rgba(61,43,31,0.26) 100%)',
    titleFont: TYPEWRITER, titleTransform: 'none', titleStyle: { fontWeight: 700, letterSpacing: '-0.01em' },
    radius: 6, heroHeight: 380, ...LIGHT_INK,
  },
  hip_hop: {
    accent: '#c5a028', accent2: '#d4581a',
    overlay: 'linear-gradient(90deg, rgba(26,26,26,0.9) 0%, rgba(26,26,26,0.68) 55%, rgba(26,26,26,0.36) 100%)',
    titleFont: SLAB, titleTransform: 'uppercase', titleStyle: { fontWeight: 400, letterSpacing: '-0.03em' },
    radius: 4, heroHeight: 460, titleScale: 1.15, ...LIGHT_INK,
  },
  indie: {
    accent: '#5a7a4a', accent2: '#c47a3a',
    overlay: 'linear-gradient(90deg, rgba(58,74,58,0.84) 0%, rgba(58,74,58,0.56) 55%, rgba(58,74,58,0.24) 100%)',
    titleFont: SOFT, titleTransform: 'none', titleStyle: { fontWeight: 600, letterSpacing: '-0.01em' },
    radius: 10, heroHeight: 420, ...LIGHT_INK,
  },
  grunge: {
    accent: '#8b3a3a', accent2: '#5a6b3a',
    overlay: 'linear-gradient(90deg, rgba(42,42,42,0.9) 0%, rgba(42,42,42,0.66) 55%, rgba(42,42,42,0.34) 100%)',
    titleFont: TYPEWRITER, titleTransform: 'none', titleStyle: { fontWeight: 700, letterSpacing: '-0.02em' },
    radius: 0, heroHeight: 430, ...LIGHT_INK,
  },
  electronic: {
    accent: '#0090a8', accent2: '#c03a92',
    overlay: 'linear-gradient(90deg, rgba(10,26,58,0.9) 0%, rgba(10,26,58,0.64) 55%, rgba(10,26,58,0.3) 100%)',
    titleFont: GEO, titleTransform: 'uppercase', titleStyle: { fontWeight: 600, letterSpacing: '0.06em' },
    radius: 6, heroHeight: 430, ...LIGHT_INK,
  },
  funk: {
    accent: '#e07020', accent2: '#7a3fa0',
    overlay: 'linear-gradient(90deg, rgba(74,42,16,0.86) 0%, rgba(74,42,16,0.58) 55%, rgba(74,42,16,0.26) 100%)',
    titleFont: ROUND, titleTransform: 'none', titleStyle: { fontWeight: 700, letterSpacing: '-0.03em' },
    radius: 14, heroHeight: 430, ...LIGHT_INK,
  },
  acg: {
    accent: '#d1638a', accent2: '#5a9fd4',
    overlay: 'linear-gradient(90deg, rgba(42,58,90,0.72) 0%, rgba(228,232,242,0.5) 55%, rgba(232,236,244,0.3) 100%)',
    titleFont: SOFT, titleTransform: 'none', titleStyle: { fontWeight: 800, letterSpacing: '-0.02em' },
    radius: 16, heroHeight: 420, ...LIGHT_INK,
  },
  cinematic: {
    accent: '#7a8899', accent2: '#a08040',
    overlay: 'linear-gradient(90deg, rgba(10,21,37,0.9) 0%, rgba(10,21,37,0.66) 55%, rgba(10,21,37,0.34) 100%)',
    titleFont: SERIF, titleTransform: 'uppercase', titleStyle: { fontWeight: 600, letterSpacing: '0.14em' },
    radius: 2, heroHeight: 400, cinemaBars: true, ...LIGHT_INK,
  },
};

const DEFAULT_SKIN = {
  accent: '#bf7a35', accent2: '#8a7e6f',
  overlay: 'linear-gradient(90deg, rgba(26,24,21,0.86) 0%, rgba(26,24,21,0.6) 55%, rgba(26,24,21,0.3) 100%)',
  titleFont: ITALIC_SERIF, titleTransform: 'none', titleStyle: { fontWeight: 700, fontStyle: 'italic' },
  radius: 12, heroHeight: 420, ...LIGHT_INK,
};

// Shared bottom-layer palette — identical on every page, every genre.
export const PAPER = {
  base: '#f3efe6',
  card: '#faf8f2',
  bar: '#e6ddc9',
  text: '#1a1815',
  muted: '#5a5a5a',
  faint: '#9a958a',
  border: '#e0d9c8',
};

export function getGenreSkin(genreId) {
  return GENRE_SKINS[genreId] || DEFAULT_SKIN;
}

// Builds the `v` theme object every genre component already consumes, with the
// paper base fixed and only the accent / typography coming from the skin.
export function buildGenreTheme(genreId) {
  const skin = getGenreSkin(genreId);
  return {
    ...skin,
    skin,
    bg: PAPER.base,
    pageBg: PAPER.base,
    text: PAPER.text,
    muted: PAPER.muted,
    cardBg: PAPER.card,
    cardBorder: PAPER.border,
    accent: skin.accent,
    accentGlow: `${skin.accent}2e`,
    headerStyle: { fontFamily: skin.titleFont, textTransform: skin.titleTransform, ...skin.titleStyle },
  };
}

// URL slug aliases so /genre/rnb, /genre/r&b, /genre/hip-hop all resolve.
export const GENRE_SLUG_ALIASES = {
  rnb: 'r_and_b',
  'r&b': 'r_and_b',
  'r-and-b': 'r_and_b',
  hiphop: 'hip_hop',
  'hip-hop': 'hip_hop',
  punk: 'core',
  'r_and_b': 'r_and_b',
};