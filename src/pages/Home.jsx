import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import AlbumCard from '@/components/AlbumCard';
import ReviewCard from '@/components/ReviewCard';
import { ArrowRight, Disc3, Users, Star, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-accent p-8 md:p-12 text-primary-foreground"
      >
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Your School's<br />Music Community
          </h1>
          <p className="mt-3 text-sm md:text-base opacity-90 max-w-md leading-relaxed">
            Discover albums, share your reviews, find bandmates, and connect with fellow music lovers at your school.
          </p>
          <div className="flex gap-3 mt-6">
            <Link to="/discover" className="px-5 py-2.5 bg-white text-primary font-semibold rounded-xl text-sm hover:bg-white/90 transition-colors">
              Explore Albums
            </Link>
            <Link to="/bands" className="px-5 py-2.5 bg-white/15 font-semibold rounded-xl text-sm hover:bg-white/25 transition-colors backdrop-blur-sm">
              Find Bands
            </Link>
          </div>
        </div>
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute right-12 top-8 w-24 h-24 bg-white/5 rounded-full blur-xl" />
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