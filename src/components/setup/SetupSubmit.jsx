import React from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function SetupSubmit({ pending }) {
  return <button type="submit" disabled={pending} className="mt-8 w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #7c6fff, #a855f7)', color: '#fff', boxShadow: '0 10px 28px rgba(124,111,255,0.28)' }}>{pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Enter Chordmates <ArrowRight className="w-4 h-4" /></>}</button>;
}