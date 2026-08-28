import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Headphones } from 'lucide-react';
import { PODCAST_CATEGORIES } from '@/lib/podcastConfig';
import PodcastCategorySection from '@/components/PodcastCategorySection';
import AddPodcastModal from '@/components/AddPodcastModal';
import { useLang } from '@/i18n/LanguageContext';

export default function Podcasts() {
  const navigate = useNavigate();
  const { t } = useLang();
  const queryClient = useQueryClient();
  const [addCategory, setAddCategory] = useState(null);

  const { data: episodes = [], isLoading } = useQuery({
    queryKey: ['podcasts'],
    queryFn: () => base44.entities.Podcast.list('-created_date', 300),
  });

  const addEpisode = useMutation({
    mutationFn: (data) => base44.entities.Podcast.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['podcasts'] });
      setAddCategory(null);
    },
  });

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'radial-gradient(ellipse at 50% 0%, #0d1535 0%, #070910 55%, #020304 100%)' }}>

      {/* Ambient background — glows, floating notes, a soft waveform */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(124,111,255,0.12) 0%, transparent 65%)', transform: 'translate(-40%, -40%)' }} />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(244,114,182,0.10) 0%, transparent 65%)', transform: 'translate(40%, 40%)' }} />

        {[
          { top: '10%', left: '8%',  note: '♪', size: 38, delay: 0   },
          { top: '34%', left: '5%',  note: '♫', size: 30, delay: 1.4 },
          { top: '62%', left: '9%',  note: '♬', size: 34, delay: 2.6 },
          { top: '14%', right: '7%', note: '♫', size: 36, delay: 0.8 },
          { top: '44%', right: '6%', note: '♩', size: 28, delay: 2.0 },
          { top: '70%', right: '8%', note: '♪', size: 40, delay: 3.2 },
        ].map((n, i) => (
          <motion.span
            key={`note-${i}`}
            className="absolute select-none"
            style={{ top: n.top, left: n.left, right: n.right, fontSize: n.size, color: 'rgba(165,138,252,0.5)', filter: 'drop-shadow(0 0 12px rgba(124,111,255,0.5))', lineHeight: 1 }}
            animate={{ y: [-10, 10, -10], opacity: [0.3, 0.55, 0.3] }}
            transition={{ duration: 7, delay: n.delay, repeat: Infinity, ease: 'easeInOut' }}
          >
            {n.note}
          </motion.span>
        ))}

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-end gap-[5px]" style={{ opacity: 0.16 }}>
          {[7,13,22,34,50,66,82,94,82,66,50,34,22,13,7].map((h, i) => (
            <motion.div key={i} className="rounded-full" style={{ width: 4, height: h, background: 'rgba(244,114,182,0.8)' }}
              animate={{ scaleY: [1, 0.3 + (i % 4) * 0.2, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.07 }}
            />
          ))}
        </div>
      </div>

      <div className="sticky top-0 z-40 backdrop-blur-xl border-b" style={{ background: 'rgba(0,0,0,0.6)', borderColor: 'rgba(124,111,255,0.15)' }}>
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: 'rgba(160,175,215,0.6)' }}
          >
            <ArrowLeft className="w-4 h-4" /> {t('nav.home')}
          </button>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-14 pb-24">
        {/* Editorial hero — asymmetric, layered */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(124,111,255,0.15)', border: '1px solid rgba(124,111,255,0.3)' }}>
              <Headphones className="w-5 h-5" style={{ color: '#a5b4fc' }} />
            </div>
            <span className="text-[11px] uppercase tracking-[0.28em] font-semibold" style={{ color: 'rgba(165,138,252,0.7)' }}>
              {t('pod.subtitle')}
            </span>
          </div>

          <h1
            className="font-playfair italic leading-none mb-4"
            style={{
              fontSize: 'clamp(2.6rem, 7vw, 4.6rem)',
              background: 'linear-gradient(135deg, #a5b4fc 0%, #818cf8 40%, #c084fc 80%, #f472b6 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              filter: 'drop-shadow(0 0 30px rgba(165,138,252,0.3))',
            }}
          >
            Music Podcasts
          </h1>

          <div className="flex items-center gap-4 max-w-md">
            <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(124,111,255,0.5), transparent)' }} />
            <span className="text-[10px] uppercase tracking-[0.3em] font-semibold" style={{ color: 'rgba(140,155,210,0.5)' }}>
              {PODCAST_CATEGORIES.length} series
            </span>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="space-y-16">
            {[0, 1].map(s => (
              <div key={s} className="h-40 rounded-2xl animate-pulse" style={{ background: 'rgba(124,111,255,0.08)' }} />
            ))}
          </div>
        ) : (
          <div className="space-y-20">
            {PODCAST_CATEGORIES.map((cat, i) => (
              <PodcastCategorySection
                key={cat.id}
                category={cat}
                index={i + 1}
                episodes={episodes.filter(e => e.category === cat.id)}
                onAddClick={() => setAddCategory(cat.id)}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {addCategory && (
          <AddPodcastModal
            defaultCategory={addCategory}
            onClose={() => setAddCategory(null)}
            onSubmit={(data) => addEpisode.mutate(data)}
            isPending={addEpisode.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}