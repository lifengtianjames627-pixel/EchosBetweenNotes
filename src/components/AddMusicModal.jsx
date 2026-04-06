import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function AddMusicModal({ v, type, onClose, onSubmit, isPending }) {
  const [data, setData] = useState({ title: '', artist: '', cover_url: '', release_year: '', description: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...data, type, release_year: data.release_year ? Number(data.release_year) : undefined });
  };

  const inp = "w-full px-3 py-2 rounded-lg text-sm outline-none";
  const inpStyle = (v) => ({ background: 'rgba(255,255,255,0.06)', border: `1px solid ${v.accent}30`, color: v.text });

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ background: 'rgba(0,0,0,0.7)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92 }}
          className="w-full max-w-md rounded-2xl p-6"
          style={{ background: v.cardBg, border: `1px solid ${v.accent}40`, boxShadow: `0 0 40px ${v.accentGlow}` }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold" style={{ color: v.text }}>Add {type === 'single' ? 'Single' : 'Album'}</h3>
            <button onClick={onClose} style={{ color: v.muted }}><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs uppercase tracking-widest mb-1 block" style={{ color: v.muted }}>Title *</label>
              <input className={inp} style={inpStyle(v)} value={data.title} onChange={e => setData({ ...data, title: e.target.value })} required />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest mb-1 block" style={{ color: v.muted }}>Artist *</label>
              <input className={inp} style={inpStyle(v)} value={data.artist} onChange={e => setData({ ...data, artist: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs uppercase tracking-widest mb-1 block" style={{ color: v.muted }}>Year</label>
                <input type="number" className={inp} style={inpStyle(v)} value={data.release_year} onChange={e => setData({ ...data, release_year: e.target.value })} placeholder="2024" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest mb-1 block" style={{ color: v.muted }}>Cover URL</label>
                <input className={inp} style={inpStyle(v)} value={data.cover_url} onChange={e => setData({ ...data, cover_url: e.target.value })} placeholder="https://…" />
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest mb-1 block" style={{ color: v.muted }}>Description</label>
              <textarea className={`${inp} resize-none`} style={inpStyle(v)} rows={2} value={data.description} onChange={e => setData({ ...data, description: e.target.value })} />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2.5 rounded-full text-sm font-semibold mt-2"
              style={{ background: v.accent, color: '#000', opacity: isPending ? 0.6 : 1, boxShadow: `0 0 16px ${v.accentGlow}` }}
            >
              {isPending ? 'Adding…' : `Add ${type === 'single' ? 'Single' : 'Album'}`}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}