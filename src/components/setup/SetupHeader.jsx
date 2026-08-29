import React from 'react';
import { Music2 } from 'lucide-react';

export default function SetupHeader() {
  return <header className="text-center mb-8">
    <div className="mx-auto mb-4 w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(124,111,255,0.18)', border: '1px solid rgba(165,180,252,0.36)' }}><Music2 className="w-5 h-5" style={{ color: '#c4baff' }} /></div>
    <p className="text-[10px] uppercase tracking-[0.28em] font-bold" style={{ color: 'rgba(192,132,252,0.72)' }}>Your listening card</p>
    <h1 className="font-playfair italic text-4xl mt-2" style={{ color: '#edf0ff' }}>Set your rhythm</h1>
    <p className="text-sm mt-3 max-w-md mx-auto" style={{ color: 'rgba(170,185,225,0.62)' }}>A few details make your Chordmates profile feel like yours.</p>
  </header>;
}