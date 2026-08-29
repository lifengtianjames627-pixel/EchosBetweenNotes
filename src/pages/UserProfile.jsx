import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Star, ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ReviewCard from '@/components/ReviewCard';
import ProfileHero from '@/components/profile/ProfileHero';
import StatStrip from '@/components/profile/StatStrip';
import ProfileActions from '@/components/profile/ProfileActions';

// Another member's profile — reached by tapping their avatar on the map.
// Friend request and the one-message introduction live here, so a tap on the
// map never drops you straight into a chat window.
export default function UserProfile() {
  const { email: raw } = useParams();
  const email = decodeURIComponent(raw || '');

  const { data: me } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['public-profile', email],
    queryFn: () => base44.functions.invoke('publicProfile', { email }).then(r => r.data),
    enabled: !!email,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['user-reviews', email],
    queryFn: () => base44.entities.Review.filter({ reviewer_email: email }, '-created_date', 30),
    enabled: !!email,
  });

  const { data: bands = [] } = useQuery({
    queryKey: ['user-bands', email],
    queryFn: () => base44.entities.BandMember.filter({ user_email: email }),
    enabled: !!email,
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['user-badges', email],
    queryFn: () => base44.entities.UserBadge.filter({ user_email: email }),
    enabled: !!email,
  });

  const name = profile?.full_name || email;
  const status = profile?.online
    ? 'Online now'
    : profile?.last_active
      ? `Last online ${formatDistanceToNow(new Date(profile.last_active), { addSuffix: true })}`
      : email;

  return (
    <div className="min-h-screen" style={{ background: '#f3efe6' }}>
      <div className="max-w-2xl mx-auto px-5 pt-6 pb-16">
        <Link to="/chat" className="inline-flex items-center gap-1.5 text-xs mb-4" style={{ color: '#6b6358' }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Link>

        {isLoading ? (
          <div className="h-44 animate-pulse" style={{ background: '#ece5d6', borderRadius: 12 }} />
        ) : profile?.found === false ? (
          <p className="text-sm py-16 text-center" style={{ color: '#8a7e6f' }}>This member could not be found.</p>
        ) : (
          <>
            <ProfileHero
              name={name}
              email={email}
              initial={(name || '?')[0].toUpperCase()}
              badges={profile?.equipped_badges || []}
              online={profile?.online}
              statusText={status}
              pictureUrl={profile?.profile_picture_url}
            >
              {me && !profile?.is_me && (
                <ProfileActions me={me} targetEmail={email} targetName={profile?.full_name || email} />
              )}
              {profile?.is_me && (
                <Link to="/profile" className="px-4 py-2.5 rounded-full text-xs font-semibold"
                  style={{ background: '#f1ebdd', color: '#8a5a20', border: '1px solid #e0d8c8' }}>
                  This is you — open your profile
                </Link>
              )}
            </ProfileHero>

            <StatStrip stats={[
              { label: 'Reviews', val: reviews.length },
              { label: 'Badges', val: badges.length },
              { label: 'Bands', val: bands.length },
              { label: 'Equipped', val: (profile?.equipped_badges || []).length },
            ]} />

            <p className="text-xs uppercase tracking-widest font-bold px-1 mb-3" style={{ color: '#bf7a35' }}>
              Reviews
            </p>
            <div className="space-y-3">
              {reviews.length > 0 ? reviews.map(r => <ReviewCard key={r.id} review={r} />) : (
                <div className="text-center py-14" style={{ color: '#8a7e6f' }}>
                  <Star className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No reviews yet.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}