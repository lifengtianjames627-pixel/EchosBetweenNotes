import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Adults and minors must never be matched with each other by this board, so every
// user declares a bracket once and only ever sees posts from their own bracket.
export default function AgeGateModal() {
  const queryClient = useQueryClient();
  const [choice, setChoice] = useState(null);

  const save = useMutation({
    mutationFn: (age_group) => base44.auth.updateMe({ age_group }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[250] flex items-center justify-center p-4"
      style={{ background: 'rgba(2,3,10,0.9)', backdropFilter: 'blur(6px)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 22, stiffness: 250 }}
        className="w-full max-w-md rounded-3xl p-7 text-center"
        style={{ background: 'rgba(10,13,32,0.98)', border: '1px solid rgba(124,111,255,0.3)', boxShadow: '0 0 60px rgba(124,111,255,0.18)' }}
      >
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: 'rgba(124,111,255,0.18)', border: '1px solid rgba(124,111,255,0.4)' }}>
          <Users className="w-6 h-6" style={{ color: '#a5b4fc', filter: 'drop-shadow(0 0 8px rgba(124,111,255,0.5))' }} />
        </div>

        <p className="font-playfair italic text-2xl mb-3" style={{ color: '#e8e9ff' }}>One thing first</p>
        <p className="text-xs leading-relaxed mb-6" style={{ color: 'rgba(150,165,215,0.72)' }}>
          Band-forming posts are only shown to people in the same age bracket, so students and adults never
          get matched with each other. Choose yours — you'll only ever see, and be seen by, that group.
        </p>

        <div className="space-y-2.5">
          {[
            { id: 'minor', label: "I'm under 18", desc: 'You will only see posts from other under-18 users.' },
            { id: 'adult', label: "I'm 18 or older", desc: 'You will only see posts from other adults.' },
          ].map(o => (
            <button
              key={o.id}
              onClick={() => setChoice(o.id)}
              className="w-full text-left px-4 py-3 rounded-2xl transition-all"
              style={choice === o.id
                ? { background: 'rgba(124,111,255,0.2)', border: '1px solid rgba(124,111,255,0.5)' }
                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(124,111,255,0.14)' }
              }
            >
              <p className="text-sm font-semibold" style={{ color: choice === o.id ? '#c4baff' : 'rgba(210,220,250,0.85)' }}>{o.label}</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'rgba(140,155,210,0.6)' }}>{o.desc}</p>
            </button>
          ))}
        </div>

        <button
          disabled={!choice || save.isPending}
          onClick={() => save.mutate(choice)}
          className="w-full mt-5 py-2.5 rounded-full text-sm font-semibold"
          style={{
            background: 'rgba(124,111,255,0.25)',
            border: '1px solid rgba(124,111,255,0.45)',
            color: '#c4baff',
            opacity: !choice || save.isPending ? 0.5 : 1,
          }}
        >
          {save.isPending ? 'Saving…' : 'Continue'}
        </button>

        <p className="flex items-center justify-center gap-1.5 text-[10px] mt-4" style={{ color: 'rgba(140,155,210,0.45)' }}>
          <ShieldCheck className="w-3 h-3" /> This choice is kept on your account and can't be changed here.
        </p>
      </motion.div>
    </motion.div>
  );
}