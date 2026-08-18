import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Loader2, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import PosterCard from '@/components/soulmate/PosterCard';
import CreatePostModal, { INSTRUMENTS } from '@/components/soulmate/CreatePostModal';
import AgeGateModal from '@/components/soulmate/AgeGateModal';
import SafetyNotice from '@/components/soulmate/SafetyNotice';
import { useLang } from '@/i18n/LanguageContext';

const KINDS = [
  { id: 'all', labelKey: 'sm.kind.all' },
  { id: 'band', labelKey: 'sm.kind.band' },
  { id: 'musician', labelKey: 'sm.kind.musician' },
];

export default function SoulmateBoard() {
  const { t } = useLang();
  const [kind, setKind] = useState('all');
  const [role, setRole] = useState(null);
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);

  const { data: currentUser } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  const { data: allPosts = [], isLoading } = useQuery({
    queryKey: ['recruit-posts'],
    queryFn: () => base44.entities.RecruitPost.filter({ status: 'active' }, '-created_date', 200),
    enabled: !!currentUser?.age_group,
  });

  // Hard rule: you only ever see posts from your own age bracket, so adults and
  // minors are never matched with each other by this board.
  const posts = allPosts
    .filter(p => p.author_age_group === currentUser?.age_group)
    .filter(p => !p.moderation_status || p.moderation_status === 'approved')
    .filter(p => kind === 'all' || p.kind === kind)
    .filter(p => !role || p.looking_for?.includes(role) || p.i_play?.includes(role))
    .filter(p => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return [p.title, p.band_name, p.city, p.school, p.influences, p.description, ...(p.genre_tags || [])]
        .filter(Boolean).some(f => String(f).toLowerCase().includes(q));
    });

  // Age bracket must be declared before anything on this board is shown.
  if (currentUser && !currentUser.age_group) return <AgeGateModal />;

  return (
    <div className="min-h-screen relative" style={{ background: 'radial-gradient(ellipse at 50% 0%, #0d1535 0%, #070910 55%, #020304 100%)' }}>

      {/* Ambient glow, matching the rest of the app */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(124,111,255,0.12) 0%, transparent 65%)', transform: 'translate(-40%, -40%)' }} />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(244,114,182,0.09) 0%, transparent 65%)', transform: 'translate(40%, 40%)' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-5 py-10">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
          <h1
            className="font-playfair italic leading-none"
            style={{
              fontSize: 'clamp(2rem, 5.5vw, 3.6rem)',
              background: 'linear-gradient(135deg, #a5b4fc 0%, #c084fc 55%, #f472b6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 26px rgba(165,138,252,0.35))',
            }}
          >
            {t('home.soulmate')}
          </h1>
          <div className="h-px mt-4 mx-auto max-w-md"
            style={{ background: 'linear-gradient(90deg, transparent, #7c6fff, #f472b6, transparent)' }} />
          <p className="mt-4 text-sm max-w-xl mx-auto" style={{ color: 'rgba(160,175,215,0.7)' }}>
            {t('sm.subtitle')}
          </p>
        </motion.div>

        {/* Safety + post button */}
        <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto] items-start">
          <SafetyNotice />
          <button
            onClick={() => setCreating(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all hover:scale-[1.02]"
            style={{ background: 'rgba(124,111,255,0.2)', border: '1px solid rgba(124,111,255,0.45)', color: '#c4baff' }}
          >
            <Plus className="w-4 h-4" /> {t('sm.post')}
          </button>
        </div>

        {/* Filters */}
        <div className="mt-6 space-y-3">
          <div className="flex flex-wrap gap-2">
            {KINDS.map(k => (
              <button
                key={k.id}
                onClick={() => setKind(k.id)}
                className="text-xs px-3.5 py-1.5 rounded-full font-semibold transition-all"
                style={kind === k.id
                  ? { background: 'rgba(124,111,255,0.25)', color: '#c4baff', border: '1px solid rgba(124,111,255,0.5)' }
                  : { background: 'rgba(255,255,255,0.04)', color: 'rgba(160,175,215,0.6)', border: '1px solid rgba(124,111,255,0.14)' }
                }
              >
                {t(k.labelKey)}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {INSTRUMENTS.map(i => (
              <button
                key={i}
                onClick={() => setRole(r => (r === i ? null : i))}
                className="text-[11px] px-2.5 py-1 rounded-full transition-all"
                style={role === i
                  ? { background: 'rgba(244,114,182,0.2)', color: '#f9a8d4', border: '1px solid rgba(244,114,182,0.45)' }
                  : { background: 'rgba(255,255,255,0.03)', color: 'rgba(150,165,215,0.55)', border: '1px solid rgba(124,111,255,0.12)' }
                }
              >
                {i}
              </button>
            ))}
          </div>

          <div className="relative max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(140,155,210,0.5)' }} />
            <input
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(124,111,255,0.18)', color: 'rgba(220,225,255,0.9)' }}
              placeholder={t('sm.search')}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Board */}
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-24" style={{ color: 'rgba(140,155,210,0.55)' }}>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">{t('sm.loading')}</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24">
            <Users className="w-8 h-8 mx-auto mb-3" style={{ color: 'rgba(124,111,255,0.35)' }} />
            <p className="text-sm" style={{ color: 'rgba(150,165,215,0.65)' }}>{t('sm.empty')}</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(140,155,210,0.45)' }}>{t('sm.emptyHint')}</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <PosterCard key={post.id} post={post} currentUser={currentUser} index={i} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {creating && currentUser && (
          <CreatePostModal currentUser={currentUser} onClose={() => setCreating(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}