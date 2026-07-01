export const PODCAST_CATEGORIES = [
  {
    id: 'amateur_review',
    label: 'Fan Frequencies',
    tagline: 'Amateur Enthusiast Reviews',
    desc: 'Unfiltered takes from everyday listeners who just love talking about music.',
    accent: '#7c6fff',
  },
  {
    id: 'artist_take',
    label: "Artist's Voice",
    tagline: 'Reviews From Musicians & Bands',
    desc: 'Artists reacting to and reviewing music made by their peers.',
    accent: '#f472b6',
  },
  {
    id: 'industry_insider',
    label: 'Behind the Board',
    tagline: 'Industry Insider Talk',
    desc: 'Producers, A&Rs, and critics on the business and craft of music.',
    accent: '#38bdf8',
  },
  {
    id: 'deep_dive',
    label: 'Liner Notes',
    tagline: 'Deep-Dive Documentaries',
    desc: 'Long-form explorations of albums, eras, and the stories behind them.',
    accent: '#fbbf24',
  },
  {
    id: 'genre_roundtable',
    label: 'Roundtable Sessions',
    tagline: 'Genre Roundtables',
    desc: 'Multiple hosts debating a genre, scene, or sound from every angle.',
    accent: '#34d399',
  },
  {
    id: 'listening_session',
    label: 'After Hours',
    tagline: 'Late-Night Listening Sessions',
    desc: 'Relaxed, ambient conversations recorded while spinning full albums.',
    accent: '#a78bfa',
  },
];

export const PODCAST_CATEGORY_MAP = Object.fromEntries(PODCAST_CATEGORIES.map(c => [c.id, c]));