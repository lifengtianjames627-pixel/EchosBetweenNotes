import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, TrendingUp, Trophy, Eye } from 'lucide-react';
import { useLang } from '@/i18n/LanguageContext';

export default function GenreRankings({ items, v }) {
  const { t } = useLang();
  const [tab, setTab] = useState('rating');

  const albums = items.filter(i => !i.type || i.type === 'album');

  const byRating = [...albums]
    .filter(a => a.avg_rating > 0)
    .sort((a, b) => {
      // Bayesian-weighted: (v * R + m * C) / (v + m)
      // v = review count, R = avg rating, m = min reviews threshold (3), C = global mean
      const globalMean = albums.reduce((s, x) => s + (x.avg_rating || 0), 0) / (albums.length || 1);
      const m = 3;
      const scoreA = ((a.review_count || 0) * (a.avg_rating || 0) + m * globalMean) / ((a.review_count || 0) + m);
      const scoreB = ((b.review_count || 0) * (b.avg_rating || 0) + m * globalMean) / ((b.review_count || 0) + m);
      return scoreB - scoreA;
    })
    .slice(0, 5);

  const byPopularity = [...albums]
    .sort((a, b) => (b.click_count || 0) - (a.click_count || 0))
    .slice(0, 5);

  const ranked = tab === 'rating' ? byRating : byPopularity;

  if (albums.length === 0) return null;

  const MEDALS = ['🥇', '🥈', '🥉'];

  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-5">
        <Trophy className="w-3.5 h-3.5" style={{ color: v.accent, opacity: 0.7 }} />
        <h2 className="text-xs uppercase tracking-widest font-bold" style={{ color: v.muted }}>{t('genre.rankings')}</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'rating', icon: Star, label: t('genre.highestRated') },
          { key: 'popular', icon: TrendingUp, label: t('genre.mostViewed') },
        ].map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={tab === key
              ? { background: v.accent, color: '#000' }
              : { border: `1px solid ${v.accent}40`, color: v.muted }
            }
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>

      {ranked.length === 0 ? (
        <p className="text-xs py-4 text-center" style={{ color: `${v.muted}70` }}>
          {tab === 'rating' ? t('genre.noRated') : t('genre.noViews')}
        </p>
      ) : (
        <div className="space-y-2">
          {ranked.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: `${v.accent}0a`, border: `1px solid ${v.cardBorder}` }}
            >
              <span className="text-lg w-7 text-center shrink-0">{MEDALS[i] || `#${i + 1}`}</span>
              <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0" style={{ background: `${v.accent}18` }}>
                {item.cover_url
                  ? <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-sm">🎵</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: v.text }}>{item.title}</p>
                <p className="text-xs truncate" style={{ color: v.muted }}>{item.artist}</p>
              </div>
              <div className="shrink-0 text-right">
                {tab === 'rating' ? (
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5" fill="currentColor" style={{ color: v.accent }} />
                    <span className="text-sm font-bold" style={{ color: v.accent }}>{item.avg_rating?.toFixed(1)}</span>
                    <span className="text-[10px]" style={{ color: `${v.muted}80` }}>({item.review_count || 0})</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" style={{ color: v.accent }} />
                    <span className="text-sm font-bold" style={{ color: v.accent }}>{item.click_count || 0}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}