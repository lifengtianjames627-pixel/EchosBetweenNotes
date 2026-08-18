import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, GraduationCap, Guitar, MessageSquare, Users } from 'lucide-react';
import ReportButton from '@/components/soulmate/ReportButton';
import { useLang } from '@/i18n/LanguageContext';

// A single recruitment poster. Tapping the author's avatar opens in-app chat —
// the only contact path there is.
export default function PosterCard({ post, currentUser, index = 0 }) {
  const { t } = useLang();
  const isMine = post.author_email === currentUser?.email;
  const initial = (post.author_name || post.author_email || '?')[0].toUpperCase();

  const openChat = () => {
    if (isMine || !post.author_email) return;
    window.dispatchEvent(new CustomEvent('openMiniChat', {
      detail: { email: post.author_email, name: post.author_name || post.author_email },
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.4), duration: 0.4 }}
      className="rounded-3xl overflow-hidden flex flex-col"
      style={{
        background: 'rgba(12,15,35,0.82)',
        border: '1px solid rgba(124,111,255,0.18)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* Poster image */}
      {post.poster_url ? (
        <div className="relative aspect-[4/3] overflow-hidden shrink-0">
          <img src={post.poster_url} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,10,28,0.92) 0%, transparent 55%)' }} />
          <span
            className="absolute top-3 left-3 text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(8,10,28,0.75)', color: '#c4baff', border: '1px solid rgba(124,111,255,0.35)' }}
          >
            {post.kind === 'band' ? t('sm.bandRecruiting') : t('sm.playerAvailable')}
          </span>
        </div>
      ) : (
        <div className="px-5 pt-5">
          <span
            className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(124,111,255,0.15)', color: '#c4baff', border: '1px solid rgba(124,111,255,0.3)' }}
          >
            {post.kind === 'band' ? t('sm.bandRecruiting') : t('sm.playerAvailable')}
          </span>
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col">
        {post.band_name && (
          <p className="text-xs mb-1" style={{ color: 'rgba(165,180,252,0.8)' }}>{post.band_name}</p>
        )}
        <p className="font-playfair italic text-lg leading-tight" style={{ color: '#e8e9ff' }}>{post.title}</p>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px]" style={{ color: 'rgba(140,155,210,0.6)' }}>
          {post.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{post.city}</span>}
          {post.school && <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" />{post.school}</span>}
          {post.commitment && <span>{t(`sm.commit.${post.commitment}`)}</span>}
        </div>

        {/* Looking for */}
        {post.looking_for?.length > 0 && (
          <div className="mt-3">
            <p className="text-[10px] uppercase tracking-widest font-bold mb-1.5" style={{ color: 'rgba(124,111,255,0.7)' }}>
              {t('sm.lookingFor')}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {post.looking_for.map(role => (
                <span key={role} className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                  style={{ background: 'rgba(124,111,255,0.18)', color: '#c4baff', border: '1px solid rgba(124,111,255,0.3)' }}>
                  {role}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Plays */}
        {post.i_play?.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2.5 text-[11px]" style={{ color: 'rgba(150,165,215,0.7)' }}>
            <Guitar className="w-3 h-3 shrink-0" style={{ color: 'rgba(244,114,182,0.7)' }} />
            <span>{t('sm.plays')} {post.i_play.join(' · ')}</span>
          </div>
        )}

        {post.influences && (
          <p className="text-[11px] mt-2 italic" style={{ color: 'rgba(140,155,210,0.6)' }}>
            {t('sm.soundsLike')} {post.influences}
          </p>
        )}

        {post.description && (
          <p className="text-xs leading-relaxed mt-3 whitespace-pre-wrap" style={{ color: 'rgba(150,165,215,0.72)' }}>
            {post.description}
          </p>
        )}

        {post.genre_tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {post.genre_tags.map(tag => (
              <span key={tag} className="text-[10px]" style={{ color: 'rgba(244,114,182,0.65)' }}>#{tag}</span>
            ))}
          </div>
        )}

        {/* Author + contact */}
        <div className="flex items-center gap-2.5 mt-auto pt-4" style={{ borderTop: '1px solid rgba(124,111,255,0.12)' }}>
          <button
            onClick={openChat}
            disabled={isMine}
            title={isMine ? 'This is your post' : `Message ${post.author_name || 'them'}`}
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(124,111,255,0.4), rgba(192,132,252,0.4))',
              color: '#c4baff',
              border: '1px solid rgba(124,111,255,0.4)',
              cursor: isMine ? 'default' : 'pointer',
            }}
          >
            {initial}
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold truncate" style={{ color: 'rgba(210,220,250,0.85)' }}>
              {post.author_name || t('sm.anonymous')}
            </p>
            <p className="text-[10px]" style={{ color: 'rgba(140,155,210,0.45)' }}>
              {isMine ? t('sm.yourPost') : t('sm.tapAvatar')}
            </p>
          </div>

          {!isMine && (
            <button
              onClick={openChat}
              className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full font-semibold shrink-0 transition-all hover:scale-105"
              style={{ background: 'rgba(124,111,255,0.2)', color: '#a5b4fc', border: '1px solid rgba(124,111,255,0.4)' }}
            >
              <MessageSquare className="w-3 h-3" /> {t('sm.message')}
            </button>
          )}
        </div>

        <div className="flex items-center justify-between mt-1">
          <span className="flex items-center gap-1 text-[10px]" style={{ color: 'rgba(140,155,210,0.4)' }}>
            <Users className="w-3 h-3" /> {t('sm.inAppOnly')}
          </span>
          <ReportButton
            targetType="recruit_post"
            targetId={post.id}
            targetSummary={`${post.title} — ${post.description || ''}`}
            targetAuthorEmail={post.author_email}
            currentUser={currentUser}
          />
        </div>
      </div>
    </motion.div>
  );
}