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
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at 50% 0%, #0d1535 0%, #070910 55%, #020304 100%)' }}>
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

      <div className="max-w-4xl mx-auto px-4 pt-12 pb-20">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <div className="flex justify-center mb-4">
            <Headphones className="w-7 h-7" style={{ color: '#a5b4fc', opacity: 0.8 }} />
          </div>
          <h1
            className="font-playfair italic leading-none mb-3"
            style={{
              fontSize: 'clamp(2.5rem, 7vw, 4.5rem)',
              background: 'linear-gradient(135deg, #a5b4fc 0%, #818cf8 40%, #c084fc 80%, #f472b6 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              filter: 'drop-shadow(0 0 30px rgba(165,138,252,0.3))',
            }}
          >
            Music Podcasts
          </h1>
          <p className="text-sm max-w-lg mx-auto" style={{ color: 'rgba(160,175,215,0.6)' }}>
            {t('pod.subtitle')}
          </p>
        </motion.div>

        {isLoading ? (
          <div className="space-y-10">
            {[0, 1].map(s => (
              <div key={s} className="h-32 rounded-xl animate-pulse" style={{ background: 'rgba(124,111,255,0.08)' }} />
            ))}
          </div>
        ) : (
          PODCAST_CATEGORIES.map(cat => (
            <PodcastCategorySection
              key={cat.id}
              category={cat}
              episodes={episodes.filter(e => e.category === cat.id)}
              onAddClick={() => setAddCategory(cat.id)}
            />
          ))
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