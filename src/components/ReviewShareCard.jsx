import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Copy, Check, Share2, Music2 } from 'lucide-react';
import html2canvas from 'html2canvas';

function StarRow({ rating, color }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <svg key={n} width="16" height="16" viewBox="0 0 24 24" fill={n <= rating ? color : 'none'} stroke={color} strokeWidth="1.8">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </div>
  );
}

// The actual card DOM that gets screenshotted
function CardCanvas({ review, album, cardRef }) {
  const accent = '#a78bfa';
  const truncatedContent = review.content?.length > 160
    ? review.content.slice(0, 160).trimEnd() + '…'
    : review.content;

  return (
    <div
      ref={cardRef}
      style={{
        width: 420,
        background: 'linear-gradient(145deg, #0d0820 0%, #150d30 40%, #0a1020 100%)',
        borderRadius: 20,
        padding: '28px 28px 22px 28px',
        fontFamily: "'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif",
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Background glow blobs */}
      <div style={{
        position: 'absolute', top: -60, right: -60, width: 200, height: 200,
        background: 'radial-gradient(circle, rgba(167,139,250,0.18) 0%, transparent 70%)',
        borderRadius: '50%',
      }} />
      <div style={{
        position: 'absolute', bottom: -40, left: -40, width: 160, height: 160,
        background: 'radial-gradient(circle, rgba(96,165,250,0.12) 0%, transparent 70%)',
        borderRadius: '50%',
      }} />

      {/* Top: Album cover + info */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 18 }}>
        <div style={{
          width: 80, height: 80, borderRadius: 12, overflow: 'hidden', flexShrink: 0,
          border: '1.5px solid rgba(167,139,250,0.35)',
          boxShadow: '0 0 20px rgba(167,139,250,0.25)',
          background: 'rgba(167,139,250,0.1)',
        }}>
          {album?.cover_url ? (
            <img src={album.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} crossOrigin="anonymous" />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🎵</div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, color: accent, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4, opacity: 0.8 }}>
            Music Critics Review
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#f0eaff', lineHeight: 1.2, marginBottom: 4, letterSpacing: '-0.02em' }}>
            {album?.title || review.album_title}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(180,165,220,0.7)', marginBottom: 8 }}>
            {album?.artist || review.album_artist}
            {album?.release_year ? ` · ${album.release_year}` : ''}
          </div>
          <StarRow rating={review.rating} color={accent} />
          <div style={{ fontSize: 11, color: accent, fontWeight: 700, marginTop: 4 }}>
            {review.rating}.0 / 5.0
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.4), transparent)', marginBottom: 16 }} />

      {/* Reviewer + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, rgba(167,139,250,0.4), rgba(96,165,250,0.3))',
          border: '1.5px solid rgba(167,139,250,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 800, color: '#c4baff',
        }}>
          {(review.reviewer_name || 'A')[0].toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#e0d8ff' }}>
            @{(review.reviewer_name || 'Anonymous').replace(/\s+/g, '_').toLowerCase()}
          </div>
          {review.title && (
            <div style={{ fontSize: 11, color: 'rgba(167,139,250,0.75)', fontStyle: 'italic' }}>
              "{review.title}"
            </div>
          )}
        </div>
      </div>

      {/* Review excerpt */}
      <div style={{
        background: 'rgba(167,139,250,0.07)',
        border: '1px solid rgba(167,139,250,0.15)',
        borderRadius: 12,
        padding: '12px 14px',
        marginBottom: 14,
      }}>
        <div style={{ fontSize: 13, color: 'rgba(210,200,240,0.85)', lineHeight: 1.7, fontStyle: 'italic' }}>
          "{truncatedContent}"
        </div>
      </div>

      {/* Tags */}
      {album?.tags?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {album.tags.slice(0, 4).map(tag => (
            <span key={tag} style={{
              fontSize: 10, color: accent, padding: '2px 8px', borderRadius: 999,
              background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.25)',
              letterSpacing: '0.05em',
            }}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderTop: '1px solid rgba(167,139,250,0.12)', paddingTop: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 20, height: 20, borderRadius: 5,
            background: 'linear-gradient(135deg, rgba(124,111,255,0.5), rgba(192,132,252,0.5))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#c4baff" strokeWidth="2.5">
              <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
          </div>
          <span style={{ fontSize: 10, color: 'rgba(165,138,252,0.7)', fontWeight: 600, letterSpacing: '0.08em' }}>
            Music Critics
          </span>
        </div>
        <div style={{ fontSize: 10, color: 'rgba(140,130,180,0.5)', letterSpacing: '0.05em' }}>
          musiccritics.app
        </div>
      </div>
    </div>
  );
}

export default function ReviewShareCard({ review, album, onClose }) {
  const cardRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const capture = async () => {
    if (!cardRef.current) return null;
    setLoading(true);
    const canvas = await html2canvas(cardRef.current, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
    });
    setLoading(false);
    return canvas;
  };

  const handleDownload = async () => {
    const canvas = await capture();
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `review-${(album?.title || 'album').replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleCopy = async () => {
    const canvas = await capture();
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // fallback: just download
        handleDownload();
      }
    });
  };

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        className="flex flex-col items-center gap-5"
      >
        {/* Title */}
        <div className="flex items-center justify-between w-full max-w-[420px]">
          <p className="text-sm font-semibold text-white opacity-80">Share your review</p>
          <button onClick={onClose} className="text-white opacity-40 hover:opacity-80 transition-opacity">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card preview */}
        <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 0 60px rgba(167,139,250,0.3), 0 20px 60px rgba(0,0,0,0.6)' }}>
          <CardCanvas review={review} album={album} cardRef={cardRef} />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105"
            style={{ background: 'rgba(167,139,250,0.2)', color: '#c4baff', border: '1px solid rgba(167,139,250,0.35)' }}
          >
            <Download className="w-4 h-4" />
            {loading ? '生成中…' : '下载图片'}
          </button>
          <button
            onClick={handleCopy}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105"
            style={{ background: copied ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.08)', color: copied ? '#34d399' : 'rgba(255,255,255,0.7)', border: `1px solid ${copied ? 'rgba(52,211,153,0.4)' : 'rgba(255,255,255,0.15)'}` }}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? '已复制！' : '复制图片'}
          </button>
        </div>

        <p className="text-xs" style={{ color: 'rgba(160,175,220,0.4)' }}>
          长按或右键图片也可保存 · 可直接分享至朋友圈、微博
        </p>
      </motion.div>
    </motion.div>
  );
}