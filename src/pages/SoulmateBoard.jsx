import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Loader2, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import PosterCard from '@/components/soulmate/PosterCard';
import CreatePostModal, { INSTRUMENTS } from '@/components/soulmate/CreatePostModal';
import AgeGateModal from '@/components/soulmate/AgeGateModal';
import SoulmateHero from '@/components/soulmate/SoulmateHero';
import { useLang } from '@/i18n/LanguageContext';

const KINDS = [{ id: 'all', labelKey: 'sm.kind.all' }, { id: 'band', labelKey: 'sm.kind.band' }, { id: 'musician', labelKey: 'sm.kind.musician' }];

export default function SoulmateBoard() {
  const { t } = useLang(); const [kind, setKind] = useState('all'); const [role, setRole] = useState(null); const [search, setSearch] = useState(''); const [creating, setCreating] = useState(false);
  const { data: currentUser } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  const { data: allPosts = [], isLoading } = useQuery({ queryKey: ['recruit-posts'], queryFn: () => base44.entities.RecruitPost.filter({ status: 'active' }, '-created_date', 200), enabled: !!currentUser?.age_group });
  const posts = allPosts.filter(p => p.author_age_group === currentUser?.age_group).filter(p => !p.moderation_status || p.moderation_status === 'approved').filter(p => kind === 'all' || p.kind === kind).filter(p => !role || p.looking_for?.includes(role) || p.i_play?.includes(role)).filter(p => !search.trim() || [p.title, p.band_name, p.city, p.school, p.influences, p.description, ...(p.genre_tags || [])].filter(Boolean).some(v => String(v).toLowerCase().includes(search.toLowerCase())));
  if (currentUser && !currentUser.age_group) return <AgeGateModal />;
  return <div className="min-h-screen px-4 pb-16 sm:px-6" style={{ background: 'radial-gradient(ellipse at 50% 0%, #121946 0%, #070910 54%, #020304 100%)' }}><div className="mx-auto max-w-6xl pt-8"><SoulmateHero t={t} kinds={KINDS} kind={kind} setKind={setKind} instruments={INSTRUMENTS} role={role} setRole={setRole} search={search} setSearch={setSearch} onCreate={() => setCreating(true)} />{isLoading ? <div className="flex items-center justify-center gap-2 py-24 text-sm" style={{ color: 'rgba(170,185,225,0.56)' }}><Loader2 className="h-4 w-4 animate-spin" />{t('sm.loading')}</div> : posts.length ? <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{posts.map((post, index) => <PosterCard key={post.id} post={post} currentUser={currentUser} index={index} />)}</div> : <div className="py-24 text-center"><Users className="mx-auto mb-3 h-9 w-9" style={{ color: 'rgba(165,180,252,0.35)' }} /><p className="text-sm" style={{ color: 'rgba(185,198,235,0.65)' }}>{t('sm.empty')}</p><p className="mt-1 text-xs" style={{ color: 'rgba(165,180,252,0.45)' }}>{t('sm.emptyHint')}</p></div>}</div><AnimatePresence>{creating && currentUser && <CreatePostModal currentUser={currentUser} onClose={() => setCreating(false)} />}</AnimatePresence></div>;
}