import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Mic2, Plus, Clock, Headphones } from 'lucide-react';
import { PODCAST_CATEGORY_MAP } from '@/lib/podcastConfig';
import AddPodcastModal from '@/components/AddPodcastModal';
import { useAuthed } from '@/hooks/useAuthed';
import { useLang } from '@/i18n/LanguageContext';

export default function PodcastSpace() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const { authed, login } = useAuthed();
  const category = PODCAST_CATEGORY_MAP[categoryId];

  const { data: episodes = [], isLoading } = useQuery({
    queryKey: ['podcasts'],
    queryFn: () => base44.entities.Podcast.list('-created_date', 300),
  });

  const addEpisode = useMutation({
    mutationFn: (data) => base44.entities.Podcast.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['podcasts'] });
      setAddOpen(false);
    },
  });

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#070910', color: 'rgba(140,155,210,0.6)' }}>
        <p className="font-playfair italic text-xl mb-4">Unknown series</p>
        <button onClick={() => navigate('/podcasts')} className="text-sm" style={{ color: category?.accent || '#a5b4fc' }}>← Back to staff</button>
      </div>
    );
  }

  const mine = episodes.filter(e => e.category === category.id);
  const handleAdd = authed ? () => setAddOpen(true) : login;

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: `radial-gradient(ellipse at 50% 0%, ${category.accent}14 0%, #070910 55%, #020304 100%)` }}>

      {/* ambient glow tinted by category */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full" style={{ background: `radial-gradient(circle, ${category.accent}1f 0%, transparent 65%)` }} />
      </div>

      <div className="sticky top-0 z-40 backdrop-blur-xl border-b" style={{ background: 'rgba(0,0,0,0.6)', borderColor: `${category.accent}22` }}>
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center">
          <button onClick={() => navigate('/podcasts')} className="flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70" style={{ color: 'rgba(160,175,215,0.6)' }}>
            <ArrowLeft className="w-4 h-4" /> Staff
          </button>
        </div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-12 pb-24">
        {/* hero */}
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
          <span className="text-[10px] uppercase tracking-[0.28em] font-semibold block mb-3" style={{ color: `${category.accent}bb` }}>
            {t(`pod.cat.${category.id}.tagline`)}
          </span>
          <h1 className="font-playfair italic leading-none mb-5" style={{ fontSize: 'clamp(2.4rem, 6vw, 3.8rem)', color: 'rgba(230,232,255,0.95)' }}>
            {t(`pod.cat.${category.id}.label`)}
          </h1>
          <p className="text-sm leading-relaxed max-w-xl" style={{ color: 'rgba(140,155,210,0.6)' }}>{t(`pod.cat.${category.id}.desc`)}</p>
          <button onClick={handleAdd} className="mt-6 flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full transition-all hover:opacity-80" style={{ color: category.accent, border: `1px solid ${category.accent}40` }}>
            <Plus className="w-3 h-3" /> {authed ? t('genre.add') : t('nav.login')}
          </button>
        </motion.div>

        {/* episodes */}
        {isLoading ? (
          <div className="space-y-4">
            {[0, 1].map(s => <div key={s} className="h-24 rounded-2xl animate-pulse" style={{ background: `${category.accent}14` }} />)}
          </div>
        ) : mine.length === 0 ? (
          <button onClick={handleAdd} className="w-full flex flex-col items-center justify-center py-16 rounded-2xl transition-all hover:opacity-80" style={{ borderTop: `1px solid ${category.accent}1a`, borderBottom: `1px solid ${category.accent}1a`, background: 'rgba(12,15,35,0.4)' }}>
            <Headphones className="w-8 h-8 mb-3" style={{ color: category.accent, opacity: 0.3 }} />
            <p className="text-sm font-playfair italic" style={{ color: 'rgba(140,155,210,0.45)' }}>{t('pod.empty')}</p>
          </button>
        ) : (
          <div className="space-y-4">
            {mine.map((ep, i) => (
              <motion.div key={ep.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="relative flex gap-4 p-4 rounded-2xl"
                style={{ background: 'rgba(12,15,35,0.6)', border: `1px solid ${category.accent}1f`, boxShadow: '0 6px 24px rgba(0,0,0,0.35)' }}>
                <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full" style={{ background: `linear-gradient(${category.accent}, transparent)` }} />
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 flex items-center justify-center" style={{ background: `${category.accent}14` }}>
                  {ep.cover_url ? <img src={ep.cover_url} alt={ep.title} className="w-full h-full object-cover" /> : <Mic2 className="w-6 h-6" style={{ color: category.accent, opacity: 0.5 }} />}
                </div>
                <div className="flex-1 min-w-0 flex flex-col">
                  <p className="font-playfair text-base font-semibold leading-snug" style={{ color: 'rgba(230,232,255,0.95)' }}>{ep.title}</p>
                  <p className="text-[11px] mt-0.5 uppercase tracking-wider truncate" style={{ color: `${category.accent}bb` }}>{ep.host_name}</p>
                  {ep.description && <p className="text-xs mt-1.5 line-clamp-2" style={{ color: 'rgba(140,155,210,0.55)' }}>{ep.description}</p>}
                  <div className="flex items-center gap-3 mt-auto pt-2">
                    {ep.duration_minutes > 0 && (
                      <span className="flex items-center gap-1 text-[10px]" style={{ color: 'rgba(140,155,210,0.4)' }}><Clock className="w-3 h-3" /> {ep.duration_minutes} {t('pod.min')}</span>
                    )}
                  </div>
                  {ep.audio_url && <audio controls src={ep.audio_url} className="w-full mt-2" style={{ height: 32 }} />}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {addOpen && (
          <AddPodcastModal defaultCategory={category.id} onClose={() => setAddOpen(false)} onSubmit={(data) => addEpisode.mutate(data)} isPending={addEpisode.isPending} />
        )}
      </AnimatePresence>
    </div>
  );
}