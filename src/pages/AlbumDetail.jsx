import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import StarRating from '@/components/StarRating';
import GenreBadge from '@/components/GenreBadge';
import ReviewCard from '@/components/ReviewCard';
import { ArrowLeft, Star, MessageSquare, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthed } from '@/hooks/useAuthed';

export default function AlbumDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 0, title: '', content: '' });
  const { authed, login } = useAuthed();

  const { data: album, isLoading: loadingAlbum } = useQuery({
    queryKey: ['album', id],
    queryFn: async () => {
      const albums = await base44.entities.Album.filter({ id });
      return albums[0];
    },
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['album-reviews', id],
    queryFn: () => base44.entities.Review.filter({ album_id: id }, '-created_date', 50),
  });

  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const createReview = useMutation({
    mutationFn: async (data) => {
      await base44.entities.Review.create({
        ...data,
        album_id: id,
        album_title: album.title,
        album_artist: album.artist,
        album_cover_url: album.cover_url || '',
        reviewer_name: currentUser?.full_name || 'Anonymous',
        likes_count: 0,
      });
      // Update album stats
      const newCount = (album.review_count || 0) + 1;
      const totalRating = (album.avg_rating || 0) * (album.review_count || 0) + data.rating;
      await base44.entities.Album.update(id, {
        review_count: newCount,
        avg_rating: Math.round((totalRating / newCount) * 10) / 10,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['album-reviews', id] });
      queryClient.invalidateQueries({ queryKey: ['album', id] });
      setShowReviewForm(false);
      setReviewData({ rating: 0, title: '', content: '' });
    },
  });

  if (loadingAlbum) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;
  }

  if (!album) {
    return <div className="text-center py-20 text-muted-foreground">Album not found.</div>;
  }

  return (
    <div className="space-y-8">
      <Link to="/discover" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Discover
      </Link>

      {/* Album Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-8"
      >
        <div className="w-full md:w-72 shrink-0">
          <div className="aspect-square rounded-2xl overflow-hidden bg-muted shadow-lg">
            {album.cover_url ? (
              <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                <span className="text-6xl">🎵</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {album.genre && <GenreBadge genre={album.genre} />}
            {album.release_year && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" /> {album.release_year}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mt-3">{album.title}</h1>
          <p className="text-lg text-muted-foreground mt-1">{album.artist}</p>
          
          <div className="flex items-center gap-4 mt-5">
            <div className="flex items-center gap-2">
              <StarRating rating={album.avg_rating || 0} size="lg" />
              <span className="text-lg font-bold">{album.avg_rating?.toFixed(1) || '—'}</span>
            </div>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <MessageSquare className="w-4 h-4" /> {album.review_count || 0} reviews
            </span>
          </div>
          
          {album.description && (
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{album.description}</p>
          )}
          
          {authed ? (
            <Button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="mt-6 rounded-xl gap-2"
            >
              <Star className="w-4 h-4" /> Write a Review
            </Button>
          ) : (
            <Button onClick={login} variant="outline" className="mt-6 rounded-xl gap-2">
              <Star className="w-4 h-4" /> Log in to review
            </Button>
          )}
        </div>
      </motion.div>

      {/* Review Form */}
      {showReviewForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-card rounded-2xl p-6 shadow-sm border"
        >
          <h3 className="font-semibold mb-4">Your Review</h3>
          <form onSubmit={(e) => { e.preventDefault(); createReview.mutate(reviewData); }} className="space-y-4">
            <div>
              <Label className="mb-2 block">Rating *</Label>
              <StarRating rating={reviewData.rating} onRate={(r) => setReviewData({...reviewData, rating: r})} size="lg" />
            </div>
            <div className="space-y-2">
              <Label>Title (optional)</Label>
              <Input value={reviewData.title} onChange={(e) => setReviewData({...reviewData, title: e.target.value})} placeholder="Sum it up in a few words" />
            </div>
            <div className="space-y-2">
              <Label>Review *</Label>
              <Textarea value={reviewData.content} onChange={(e) => setReviewData({...reviewData, content: e.target.value})} rows={4} placeholder="Share your thoughts..." required />
            </div>
            <div className="flex gap-3">
              <Button type="submit" className="rounded-xl" disabled={!reviewData.rating || createReview.isPending}>
                {createReview.isPending ? 'Posting...' : 'Post Review'}
              </Button>
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setShowReviewForm(false)}>Cancel</Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Reviews */}
      <section>
        <h2 className="text-xl font-bold mb-4">Reviews ({reviews.length})</h2>
        {reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} showAlbum={false} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-2xl">
            <p className="text-muted-foreground text-sm">No reviews yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </section>
    </div>
  );
}