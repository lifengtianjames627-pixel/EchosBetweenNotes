import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import AlbumCard from '@/components/AlbumCard';
import ReviewCard from '@/components/ReviewCard';
import { ArrowRight, Disc3, Users, Star, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import HeroStars from '@/components/HeroStars';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-3 p-4 rounded-2xl bg-card shadow-sm">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  </div>
);

export default function Home() {
  const { data: albums = [] } = useQuery({
    queryKey: ['albums-trending'],
    queryFn: () => base44.entities.Album.list('-avg_rating', 8),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews-recent'],
    queryFn: () => base44.entities.Review.list('-created_date', 6),
  });

  const { data: bands = [] } = useQuery({
    queryKey: ['bands-recruiting'],
    queryFn: () => base44.entities.Band.filter({ status: 'recruiting' }, '-created_date', 4),
  });

  return (
    <div className="space-y-10">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden text-primary-foreground -mx-4 md:-mx-8 px-8 md:px-16 pt-10 pb-14"
        style={{
          background: 'linear-gradient(160deg, hsl(330,80%,52%) 0%, hsl(300,65%,52%) 60%, hsl(280,65%,50%) 100%)',
          minHeight: '240px',
        }}
      >
        <HeroStars />

        {/* decorative blobs */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute right-16 top-4 w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
        <div className="absolute left-1/2 -bottom-6 w-40 h-40 bg-primary/20 rounded-full blur-2xl" />

        {/* vinyl disc decoration */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute right-8 top-1/2 -translate-y-1/2 w-32 h-32 md:w-44 md:h-44 opacity-20"
        >
          <div className="w-full h-full rounded-full border-8 border-white/40 flex items-center justify-center">
            <div className="w-1/2 h-1/2 rounded-full border-4 border-white/40 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-white/60" />
            </div>
          </div>
        </motion.div>

        <div className="relative z-10">
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xs font-semibold uppercase tracking-widest opacity-75 mb-2"
          >
            🎵 Your School's Music Hub
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight"
          >
            Discover. Review.<br />
            <span className="opacity-80">Connect.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-3 text-sm md:text-base opacity-85 max-w-sm leading-relaxed"
          >
            Share reviews, find bandmates, and connect with fellow music lovers at your school.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex gap-3 mt-6"
          >
            <Link to="/discover" className="px-5 py-2.5 bg-white text-primary font-semibold rounded-xl text-sm hover:bg-white/90 transition-colors shadow-lg">
              Explore Albums
            </Link>
            <Link to="/bands" className="px-5 py-2.5 bg-white/15 font-semibold rounded-xl text-sm hover:bg-white/25 transition-colors backdrop-blur-sm border border-white/20">
              Find Bands
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Disc3} label="Albums" value={albums.length || '—'} color="bg-primary/10 text-primary" />
        <StatCard icon={Star} label="Reviews" value={reviews.length || '—'} color="bg-yellow-100 text-yellow-600" />
        <StatCard icon={Users} label="Bands" value={bands.length || '—'} color="bg-accent/10 text-accent" />
        <StatCard icon={TrendingUp} label="Active" value="🔥" color="bg-emerald-100 text-emerald-600" />
      </div>

      {/* Trending Albums */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">Trending Albums</h2>
          <Link to="/discover" className="text-sm text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all">
            See all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {albums.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-2xl shadow-sm">
            <Disc3 className="w-12 h-12 mx-auto text-muted-foreground/30" />
            <p className="mt-3 text-muted-foreground text-sm">No albums yet. Be the first to add one!</p>
            <Link to="/discover" className="mt-3 inline-block text-sm text-primary font-medium">
              Add an Album →
            </Link>
          </div>
        )}
      </section>

      {/* Latest Reviews */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">Latest Reviews</h2>
        </div>
        {reviews.length > 0 ? (
          <div className="grid gap-3">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-2xl shadow-sm">
            <Star className="w-12 h-12 mx-auto text-muted-foreground/30" />
            <p className="mt-3 text-muted-foreground text-sm">No reviews yet. Start sharing your thoughts!</p>
          </div>
        )}
      </section>

      {/* Bands Recruiting */}
      {bands.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold">Bands Looking for Members</h2>
            <Link to="/bands" className="text-sm text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all">
              All bands <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {bands.map((band) => (
              <Link key={band.id} to={`/band/${band.id}`} className="p-5 bg-card rounded-2xl shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{band.name}</h3>
                    <p className="text-xs text-muted-foreground">{band.genre?.replace(/_/g, ' ')} · {band.member_count || 1} members</p>
                  </div>
                </div>
                {band.looking_for?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {band.looking_for.map((role) => (
                      <span key={role} className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        Looking for {role}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}