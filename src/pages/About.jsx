import React from 'react';
import { motion } from 'framer-motion';
import { Music2, Heart, Users } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(124,111,255,0.15)', border: '1.5px solid rgba(124,111,255,0.35)' }}>
              <Music2 className="w-7 h-7" style={{ color: '#a5b4fc' }} />
            </div>
          </div>
          <h1
            className="text-4xl font-black mb-3 leading-tight"
            style={{
              background: 'linear-gradient(135deg, #a5b4fc 0%, #818cf8 40%, #c084fc 80%, #f472b6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            About Us
          </h1>
          <div className="h-px mx-auto w-24 mt-3" style={{ background: 'linear-gradient(90deg, transparent, #7c6fff, transparent)' }} />
        </motion.div>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="rounded-2xl p-8 mb-8"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(124,111,255,0.18)', boxShadow: '0 0 40px rgba(124,111,255,0.08)' }}
        >
          <p className="text-base leading-relaxed" style={{ color: 'rgba(200,215,255,0.85)' }}>
            We are a group of high school students united by one thing: a genuine, deep love for music. Across every hallway conversation and late-night playlist session, we kept running into the same problem — there was no real home on the internet for people who <em>truly</em> appreciate music across all its forms, not just the mainstream charts. So we built one. <strong style={{ color: '#a5b4fc' }}>Music Critics</strong> is our attempt to create a platform where every genre gets the attention and respect it deserves — a space for honest reviews, real conversation, and the kind of passion that only comes from people who actually care. Whether you're deep into jazz, obsessed with metal, or rediscovering classic country, you belong here.
          </p>
        </motion.div>

        {/* Values */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Music2, title: 'Every Genre', desc: 'From classical to hardcore — no genre left behind.' },
            { icon: Heart,   title: 'Real Passion', desc: 'Built by music lovers, for music lovers.' },
            { icon: Users,   title: 'Community First', desc: 'A place to share, discover, and connect.' },
          ].map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="rounded-xl p-5 text-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(124,111,255,0.14)' }}
            >
              <Icon className="w-5 h-5 mx-auto mb-3" style={{ color: '#a5b4fc' }} />
              <p className="text-sm font-semibold mb-1" style={{ color: '#c4baff' }}>{title}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(160,175,215,0.6)' }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}