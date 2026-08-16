import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ChevronDown } from 'lucide-react';

// Always-visible safety framing for the band-forming board.
// Chordmates only displays information and carries messages — it never arranges,
// verifies, endorses, or takes part in anything that happens offline.
export default function SafetyNotice({ compact = false }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(124,111,255,0.07)', border: '1px solid rgba(124,111,255,0.22)' }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left"
      >
        <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: '#a5b4fc' }} />
        <p className="text-xs font-semibold flex-1" style={{ color: 'rgba(200,210,245,0.85)' }}>
          Stay safe · read before you reach out
        </p>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4" style={{ color: 'rgba(140,155,210,0.6)' }} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2.5 text-xs leading-relaxed" style={{ color: 'rgba(150,165,215,0.72)' }}>
              <p>
                <span style={{ color: '#c4baff' }}>Keep it in Chordmates.</span> Phone numbers, WeChat/QQ IDs
                and other handles are not allowed in posts or messages — in-app chat keeps a record so we can
                act on reports.
              </p>
              <p>
                <span style={{ color: '#c4baff' }}>Before meeting anyone offline:</span> tell a parent or
                guardian, meet in a public place, bring a friend, and never go alone.
              </p>
              <p>
                <span style={{ color: '#c4baff' }}>No money, ever.</span> Nobody here should ask you for fees,
                deposits or payments. Report it if they do.
              </p>
              <p>
                <span style={{ color: '#c4baff' }}>Report anything that feels off.</span> Every post and
                conversation has a report button, and it reaches a human.
              </p>
              {!compact && (
                <p className="pt-2 mt-1" style={{ borderTop: '1px solid rgba(124,111,255,0.15)', color: 'rgba(140,155,210,0.55)' }}>
                  Chordmates only displays what users write and passes messages between them. We do not verify
                  identities, abilities or claims, we do not organise or take part in offline activity, and we
                  are not responsible for what comes of it. Under-18 users must get a parent or guardian's
                  agreement before meeting anyone in person.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}