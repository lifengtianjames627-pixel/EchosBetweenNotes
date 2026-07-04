import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Copy, Check } from 'lucide-react';

const FONT = "'Inter','PingFang SC','Microsoft YaHei',sans-serif";
const ACCENT = '#a78bfa';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// Splits text into CJK-safe wrap tokens (whole latin words, single CJK chars)
function tokenize(text) {
  const tokens = [];
  let cur = '';
  for (const ch of text) {
    if (/[\u3000-\u9fff\uff00-\uffef]/.test(ch)) {
      if (cur) { tokens.push(cur); cur = ''; }
      tokens.push(ch);
    } else if (ch === ' ') {
      if (cur) { tokens.push(cur); cur = ''; }
      tokens.push(' ');
    } else {
      cur += ch;
    }
  }
  if (cur) tokens.push(cur);
  return tokens;
}

function wrapText(ctx, text, maxWidth) {
  const tokens = tokenize(text || '');
  const lines = [];
  let line = '';
  for (const t of tokens) {
    const test = line + t;
    if (ctx.measureText(test).width > maxWidth && line.trim()) {
      lines.push(line.trimEnd());
      line = t.trimStart();
    } else {
      line = test;
    }
  }
  if (line.trim()) lines.push(line.trimEnd());
  return lines.length ? lines : [''];
}

function ellipsize(ctx, text, maxWidth) {
  if (!text) return '';
  if (ctx.measureText(text).width <= maxWidth) return text;
  let lo = 0, hi = text.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    const t = text.slice(0, mid) + '…';
    if (ctx.measureText(t).width <= maxWidth) lo = mid; else hi = mid - 1;
  }
  return text.slice(0, lo) + '…';
}

function drawStar(ctx, x, y, size, filled, color) {
  const pts = [[12,2],[15.09,8.26],[22,9.27],[17,14.14],[18.18,21.02],[12,17.77],[5.82,21.02],[7,14.14],[2,9.27],[8.91,8.26]];
  const s = size / 24;
  ctx.beginPath();
  pts.forEach(([px, py], i) => {
    const X = x + px * s, Y = y + py * s;
    if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
  });
  ctx.closePath();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = color;
  ctx.stroke();
  if (filled) { ctx.fillStyle = color; ctx.fill(); }
}

function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) { resolve(null); return; }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// Draws the entire share card directly on a canvas (no DOM screenshotting),
// giving pixel-exact control over every line's position.
async function renderCard(canvas, review, album) {
  const W = 420, PAD = 28, SCALE = 2;
  const contentW = W - PAD * 2;
  const ctx = canvas.getContext('2d');

  const truncatedContent = review.content?.length > 160
    ? review.content.slice(0, 160).trimEnd() + '…'
    : (review.content || '');

  const infoX = PAD + 80 + 16;
  const infoW = contentW - 80 - 16;

  ctx.font = `800 18px ${FONT}`;
  const title = ellipsize(ctx, album?.title || review.album_title || '', infoW);

  ctx.font = `13px ${FONT}`;
  const artistText = `${album?.artist || review.album_artist || ''}${album?.release_year ? ' · ' + album.release_year : ''}`;
  const artistLine = ellipsize(ctx, artistText, infoW);

  ctx.font = `italic 13px ${FONT}`;
  const excerptLines = wrapText(ctx, truncatedContent, contentW - 28);

  ctx.font = `700 13px ${FONT}`;
  const name = ellipsize(ctx, '@' + (review.reviewer_name || 'Anonymous').replace(/\s+/g, '_').toLowerCase(), contentW - 32 - 10 - 10);

  ctx.font = `italic 11px ${FONT}`;
  const reviewTitle = review.title ? ellipsize(ctx, `"${review.title}"`, contentW - 32 - 10 - 10) : null;

  const tags = (album?.tags || []).slice(0, 4);
  ctx.font = `600 10px ${FONT}`;
  const tagRows = [];
  let curRow = [], curWidth = 0;
  tags.forEach(tag => {
    const label = `#${tag}`;
    const w = ctx.measureText(label).width + 16;
    if (curWidth + w > contentW && curRow.length) { tagRows.push(curRow); curRow = []; curWidth = 0; }
    curRow.push({ label, w });
    curWidth += w + 6;
  });
  if (curRow.length) tagRows.push(curRow);

  // --- Layout (all fixed offsets, computed once, drawn exactly where measured) ---
  const albumRowTop = PAD;
  const eyebrowBaseline = albumRowTop + 10;
  const titleBaseline = albumRowTop + 34;
  const artistBaseline = albumRowTop + 56;
  const starsTop = albumRowTop + 64;
  const ratingBaseline = albumRowTop + 90;
  const albumRowBottom = albumRowTop + 96;

  const dividerY = albumRowBottom + 8;

  const reviewerTop = dividerY + 16;
  const nameBaseline = reviewerTop + 16;
  const reviewerTitleBaseline = reviewerTop + 30;
  const reviewerBottom = reviewerTop + 32;

  const excerptTop = reviewerBottom + 12;
  const excerptBoxHeight = 24 + excerptLines.length * 19;
  const excerptBottom = excerptTop + excerptBoxHeight;

  const tagsTop = excerptBottom + 14;
  const tagsBottom = tagRows.length ? tagsTop + tagRows.length * 18 + (tagRows.length - 1) * 6 : excerptBottom;

  const footerBorderY = (tagRows.length ? tagsBottom : excerptBottom) + 14;
  const footerContentY = footerBorderY + 12;
  const footerBottom = footerContentY + 20;

  const H = footerBottom + 22;

  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  ctx.textBaseline = 'alphabetic';

  // Background
  ctx.save();
  roundRect(ctx, 0, 0, W, H, 20);
  ctx.clip();
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#0d0820'); grad.addColorStop(0.4, '#150d30'); grad.addColorStop(1, '#0a1020');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
  const rg1 = ctx.createRadialGradient(W * 0.85, H * 0.05, 0, W * 0.85, H * 0.05, W * 0.6);
  rg1.addColorStop(0, 'rgba(167,139,250,0.18)'); rg1.addColorStop(1, 'rgba(167,139,250,0)');
  ctx.fillStyle = rg1; ctx.fillRect(0, 0, W, H);
  const rg2 = ctx.createRadialGradient(W * 0.05, H * 0.95, 0, W * 0.05, H * 0.95, W * 0.5);
  rg2.addColorStop(0, 'rgba(96,165,250,0.12)'); rg2.addColorStop(1, 'rgba(96,165,250,0)');
  ctx.fillStyle = rg2; ctx.fillRect(0, 0, W, H);
  ctx.restore();

  // Cover
  const img = await loadImage(album?.cover_url);
  ctx.save();
  roundRect(ctx, PAD, albumRowTop, 80, 80, 12);
  ctx.fillStyle = 'rgba(167,139,250,0.1)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(167,139,250,0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  if (img) {
    ctx.save();
    roundRect(ctx, PAD, albumRowTop, 80, 80, 12);
    ctx.clip();
    const s = Math.max(80 / img.width, 80 / img.height);
    const iw = img.width * s, ih = img.height * s;
    ctx.drawImage(img, PAD + (80 - iw) / 2, albumRowTop + (80 - ih) / 2, iw, ih);
    ctx.restore();
  } else {
    ctx.font = '28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.fillText('🎵', PAD + 40, albumRowTop + 48);
    ctx.textAlign = 'left';
  }
  ctx.restore();

  // Eyebrow
  ctx.font = `600 10px ${FONT}`;
  ctx.fillStyle = ACCENT;
  ctx.globalAlpha = 0.8;
  ctx.fillText('ECHOES BETWEEN NOTES', infoX, eyebrowBaseline);
  ctx.globalAlpha = 1;

  // Title
  ctx.font = `800 18px ${FONT}`;
  ctx.fillStyle = '#f0eaff';
  ctx.fillText(title, infoX, titleBaseline);

  // Artist/year
  ctx.font = `13px ${FONT}`;
  ctx.fillStyle = 'rgba(180,165,220,0.7)';
  ctx.fillText(artistLine, infoX, artistBaseline);

  // Stars
  for (let i = 0; i < 5; i++) {
    drawStar(ctx, infoX + i * 20, starsTop, 16, i < review.rating, ACCENT);
  }

  // Rating text
  ctx.font = `700 11px ${FONT}`;
  ctx.fillStyle = ACCENT;
  ctx.fillText(`${review.rating}.0 / 5.0`, infoX, ratingBaseline);

  // Divider
  const divGrad = ctx.createLinearGradient(PAD, 0, W - PAD, 0);
  divGrad.addColorStop(0, 'rgba(167,139,250,0)');
  divGrad.addColorStop(0.5, 'rgba(167,139,250,0.4)');
  divGrad.addColorStop(1, 'rgba(167,139,250,0)');
  ctx.fillStyle = divGrad;
  ctx.fillRect(PAD, dividerY, contentW, 1);

  // Avatar
  const avatarCx = PAD + 16, avatarCy = reviewerTop + 16;
  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarCx, avatarCy, 16, 0, Math.PI * 2);
  const avGrad = ctx.createLinearGradient(PAD, reviewerTop, PAD + 32, reviewerTop + 32);
  avGrad.addColorStop(0, 'rgba(167,139,250,0.4)');
  avGrad.addColorStop(1, 'rgba(96,165,250,0.3)');
  ctx.fillStyle = avGrad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(167,139,250,0.4)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
  ctx.font = `800 13px ${FONT}`;
  ctx.fillStyle = '#c4baff';
  ctx.textAlign = 'center';
  ctx.fillText((review.reviewer_name || 'A')[0].toUpperCase(), avatarCx, avatarCy + 5);
  ctx.textAlign = 'left';

  // Reviewer name + title
  const textX = PAD + 32 + 10;
  ctx.font = `700 13px ${FONT}`;
  ctx.fillStyle = '#e0d8ff';
  ctx.fillText(name, textX, nameBaseline);
  if (reviewTitle) {
    ctx.font = `italic 11px ${FONT}`;
    ctx.fillStyle = 'rgba(167,139,250,0.75)';
    ctx.fillText(reviewTitle, textX, reviewerTitleBaseline);
  }

  // Excerpt box
  ctx.save();
  roundRect(ctx, PAD, excerptTop, contentW, excerptBoxHeight, 12);
  ctx.fillStyle = 'rgba(167,139,250,0.07)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(167,139,250,0.15)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
  ctx.font = `italic 13px ${FONT}`;
  ctx.fillStyle = 'rgba(210,200,240,0.85)';
  excerptLines.forEach((line, i) => {
    let text = line;
    if (i === 0) text = `"${text}`;
    if (i === excerptLines.length - 1) text = `${text}"`;
    ctx.fillText(text, PAD + 14, excerptTop + 12 + 13 + i * 19);
  });

  // Tags
  if (tagRows.length) {
    let ty = tagsTop;
    tagRows.forEach(row => {
      let tx = PAD;
      row.forEach(({ label, w }) => {
        ctx.save();
        roundRect(ctx, tx, ty, w, 18, 9);
        ctx.fillStyle = 'rgba(167,139,250,0.12)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(167,139,250,0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
        ctx.font = `600 10px ${FONT}`;
        ctx.fillStyle = ACCENT;
        ctx.fillText(label, tx + 8, ty + 12.5);
        tx += w + 6;
      });
      ty += 18 + 6;
    });
  }

  // Footer
  ctx.fillStyle = 'rgba(167,139,250,0.12)';
  ctx.fillRect(PAD, footerBorderY, contentW, 1);

  ctx.save();
  roundRect(ctx, PAD, footerContentY, 20, 20, 5);
  const fGrad = ctx.createLinearGradient(PAD, footerContentY, PAD + 20, footerContentY + 20);
  fGrad.addColorStop(0, 'rgba(124,111,255,0.5)');
  fGrad.addColorStop(1, 'rgba(192,132,252,0.5)');
  ctx.fillStyle = fGrad;
  ctx.fill();
  ctx.restore();
  ctx.font = `12px ${FONT}`;
  ctx.fillStyle = '#c4baff';
  ctx.textAlign = 'center';
  ctx.fillText('♫', PAD + 10, footerContentY + 15);
  ctx.textAlign = 'left';

  ctx.font = `600 10px ${FONT}`;
  ctx.fillStyle = 'rgba(165,138,252,0.7)';
  ctx.fillText('Echoes Between Notes', PAD + 26, footerContentY + 14);

  ctx.font = `10px ${FONT}`;
  ctx.fillStyle = 'rgba(140,130,180,0.5)';
  ctx.textAlign = 'right';
  ctx.fillText('echoesbetweennotes.app', W - PAD, footerContentY + 14);
  ctx.textAlign = 'left';
}

export default function ReviewShareCard({ review, album, onClose }) {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    (async () => {
      if (document.fonts?.ready) await document.fonts.ready;
      if (cancelled || !canvasRef.current) return;
      await renderCard(canvasRef.current, review, album);
      if (!cancelled) setReady(true);
    })();
    return () => { cancelled = true; };
  }, [review, album]);

  const handleDownload = () => {
    if (!canvasRef.current || !ready) return;
    const link = document.createElement('a');
    link.download = `review-${(album?.title || 'album').replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handleCopy = () => {
    if (!canvasRef.current || !ready) return;
    canvasRef.current.toBlob(async (blob) => {
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
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
        <div className="flex items-center justify-between w-full max-w-[420px]">
          <p className="text-sm font-semibold text-white opacity-80">Share your review</p>
          <button onClick={onClose} className="text-white opacity-40 hover:opacity-80 transition-opacity">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 0 60px rgba(167,139,250,0.3), 0 20px 60px rgba(0,0,0,0.6)', opacity: ready ? 1 : 0.3, transition: 'opacity 0.2s', minWidth: 420, minHeight: 200 }}>
          <canvas ref={canvasRef} />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            disabled={!ready}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105"
            style={{ background: 'rgba(167,139,250,0.2)', color: '#c4baff', border: '1px solid rgba(167,139,250,0.35)' }}
          >
            <Download className="w-4 h-4" />
            {ready ? '下载图片' : '生成中…'}
          </button>
          <button
            onClick={handleCopy}
            disabled={!ready}
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