import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReviewCard from '@/components/ReviewCard';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Star, UserPlus, Check, X, Music, Shield, MessageSquare } from 'lucide-react';
import UserBadges from '@/components/UserBadges';
import BadgeIcon from '@/components/BadgeIcon';
import { awardBadge } from '@/lib/badgeUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const V = {
  card: 'rgba(12,15,35,0.82)',
  border: 'rgba(124,111,255,0.18)',
  accent: '#a5b4fc',
  accentBg: 'rgba(124,111,255,0.12)',
  text: 'rgba(220,225,255,0.9)',
  muted: 'rgba(140,155,210,0.55)',
};

export default function Profile() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [friendEmail, setFriendEmail] = useState('');
  const [friendMsg, setFriendMsg] = useState('');
  const [showAddFriend, setShowAddFriend] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: myReviews = [] } = useQuery({
    queryKey: ['my-reviews', user?.email],
    queryFn: () => base44.entities.Review.filter({ created_by: user.email }, '-created_date', 50),
    enabled: !!user,
  });

  const { data: earnedBadges = [] } = useQuery({
    queryKey: ['earned-badges', user?.email],
    queryFn: () => base44.entities.UserBadge.filter({ user_email: user.email }),
    enabled: !!user,
  });
  const earnedBadgeIds = earnedBadges.map(b => b.badge_id);

  useEffect(() => {
    if (user?.email && earnedBadges !== undefined) {
      awardBadge(user.email, 'critic_welcome', queryClient);
    }
  }, [user?.email, earnedBadges.length === 0]);

  const { data: myBands = [] } = useQuery({
    queryKey: ['my-bands', user?.email],
    queryFn: () => base44.entities.BandMember.filter({ user_email: user.email }),
    enabled: !!user,
  });

  const { data: sentRequests = [] } = useQuery({
    queryKey: ['sent-requests', user?.email],
    queryFn: () => base44.entities.FriendRequest.filter({ from_email: user.email }),
    enabled: !!user,
  });

  const { data: incomingRequests = [] } = useQuery({
    queryKey: ['incoming-requests', user?.email],
    queryFn: () => base44.entities.FriendRequest.filter({ to_email: user.email }),
    enabled: !!user,
  });

  const sendFriendRequest = useMutation({
    mutationFn: () => base44.entities.FriendRequest.create({
      from_email: user.email,
      from_name: user.full_name,
      to_email: friendEmail,
      message: friendMsg,
      status: 'pending',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sent-requests'] });
      setShowAddFriend(false);
      setFriendEmail('');
      setFriendMsg('');
    },
  });

  const respondToRequest = useMutation({
    mutationFn: ({ id, status }) => base44.entities.FriendRequest.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['incoming-requests'] }),
  });

  const pendingIncoming = incomingRequests.filter((r) => r.status === 'pending');
  const friends = incomingRequests.filter((r) => r.status === 'accepted');
  const acceptedSent = sentRequests.filter((r) => r.status === 'accepted');

  if (!user) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-indigo-400/20 border-t-indigo-400 rounded-full animate-spin" />
    </div>
  );

  const friendsList = [
    ...friends.map(r => ({ name: r.from_name, email: r.from_email })),
    ...acceptedSent.map(r => ({ name: r.to_name, email: r.to_email })),
  ];

  return (
    <div className="min-h-screen px-6 py-8" style={{ background: 'radial-gradient(ellipse at 50% 0%, #0d1535 0%, #070910 55%, #020304 100%)' }}>
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Profile Header */}
        <div className="rounded-3xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5"
          style={{ background: V.card, border: `1px solid ${V.border}`, backdropFilter: 'blur(12px)' }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(124,111,255,0.4), rgba(192,132,252,0.4))', color: '#c4baff', border: '1px solid rgba(124,111,255,0.35)' }}>
            {user.full_name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold" style={{ color: V.text }}>{user.full_name}</h1>
            <p className="text-sm mt-0.5" style={{ color: V.muted }}>{user.email}</p>
            {user?.equipped_badges?.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap justify-center sm:justify-start">
                {user.equipped_badges.map(id => (
                  <BadgeIcon key={id} badgeId={id} size="xs" />
                ))}
              </div>
            )}
            <div className="flex flex-wrap justify-center sm:justify-start gap-6 mt-4">
              {[['Reviews', myReviews.length], ['Bands', myBands.length], ['Friends', friendsList.length], ['Badges', earnedBadgeIds.length]].map(([label, val]) => (
                <div key={label} className="text-center">
                  <p className="text-xl font-bold" style={{ color: V.text }}>{val}</p>
                  <p className="text-xs" style={{ color: V.muted }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => setShowAddFriend(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shrink-0"
            style={{ background: V.accentBg, color: V.accent, border: '1px solid rgba(124,111,255,0.35)' }}>
            <UserPlus className="w-4 h-4" /> Add Friend
          </button>
        </div>

        {/* Add Friend Modal */}
        {showAddFriend && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowAddFriend(false)}>
            <div className="rounded-2xl p-6 w-full max-w-sm space-y-4"
              style={{ background: 'rgba(12,15,35,0.98)', border: `1px solid ${V.border}` }}
              onClick={e => e.stopPropagation()}>
              <p className="font-bold text-lg" style={{ color: V.accent }}>Send Friend Request</p>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest block" style={{ color: V.muted }}>Friend's Email</label>
                <input type="email" className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${V.border}`, color: V.text }}
                  value={friendEmail} onChange={e => setFriendEmail(e.target.value)} placeholder="friend@email.com" />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest block" style={{ color: V.muted }}>Message (optional)</label>
                <input className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${V.border}`, color: V.text }}
                  value={friendMsg} onChange={e => setFriendMsg(e.target.value)} placeholder="Hey, let's connect!" />
              </div>
              <div className="flex gap-3">
                <button disabled={!friendEmail || sendFriendRequest.isPending}
                  onClick={() => sendFriendRequest.mutate()}
                  className="flex-1 py-2.5 rounded-full text-sm font-semibold"
                  style={{ background: V.accentBg, color: V.accent, border: '1px solid rgba(124,111,255,0.4)', opacity: !friendEmail ? 0.5 : 1 }}>
                  {sendFriendRequest.isPending ? 'Sending…' : 'Send Request'}
                </button>
                <button onClick={() => setShowAddFriend(false)} className="px-4 py-2.5 rounded-full text-sm" style={{ color: V.muted }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="reviews" className="w-full">
          <TabsList className="w-full rounded-2xl"
            style={{ background: V.card, border: `1px solid ${V.border}` }}>
            <TabsTrigger value="reviews" className="flex-1 rounded-xl text-xs">
              <Star className="w-3.5 h-3.5 mr-1" /> Reviews
            </TabsTrigger>
            <TabsTrigger value="badges" className="flex-1 rounded-xl text-xs">
              <Shield className="w-3.5 h-3.5 mr-1" /> Badges {earnedBadgeIds.length > 0 && <span className="ml-1 font-bold" style={{ color: V.accent }}>{earnedBadgeIds.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="bands" className="flex-1 rounded-xl text-xs">
              <Music className="w-3.5 h-3.5 mr-1" /> Bands
            </TabsTrigger>
            <TabsTrigger value="friends" className="flex-1 rounded-xl text-xs">
              <Users className="w-3.5 h-3.5 mr-1" />
              Friends
              {pendingIncoming.length > 0 && (
                <span className="ml-1 text-[10px] font-bold rounded-full w-4 h-4 inline-flex items-center justify-center"
                  style={{ background: V.accent, color: '#000' }}>
                  {pendingIncoming.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="mt-4 space-y-3">
            {myReviews.length > 0 ? (
              myReviews.map((review) => <ReviewCard key={review.id} review={review} />)
            ) : (
              <div className="text-center py-12 rounded-2xl" style={{ background: V.card, border: `1px solid ${V.border}` }}>
                <Star className="w-10 h-10 mx-auto" style={{ color: V.muted }} />
                <p className="mt-3 text-sm" style={{ color: V.muted }}>No reviews yet.</p>
              </div>
            )}
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="mt-4">
            <UserBadges user={user} earnedBadgeIds={earnedBadgeIds} />
          </TabsContent>

          {/* Bands Tab */}
          <TabsContent value="bands" className="mt-4 space-y-3">
            <Link to="/band-dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold w-fit"
              style={{ background: V.accentBg, color: V.accent, border: '1px solid rgba(124,111,255,0.3)' }}>
              <Music className="w-3.5 h-3.5" /> Manage My Bands
            </Link>
            {myBands.length > 0 ? (
              myBands.map((membership) => (
                <Link key={membership.id} to={`/band/${membership.band_id}`} className="block">
                  <div className="flex items-center gap-3 p-4 rounded-2xl transition-all"
                    style={{ background: V.card, border: `1px solid ${V.border}` }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(124,111,255,0.2)' }}>
                      <Music className="w-5 h-5" style={{ color: V.accent }} />
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: V.text }}>{membership.band_name || 'Band'}</p>
                      <p className="text-xs" style={{ color: V.muted }}>{membership.role || 'Member'} {membership.is_founder && '· Founder'}</p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-12 rounded-2xl" style={{ background: V.card, border: `1px solid ${V.border}` }}>
                <Music className="w-10 h-10 mx-auto" style={{ color: V.muted }} />
                <p className="mt-3 text-sm" style={{ color: V.muted }}>No bands yet.</p>
              </div>
            )}
          </TabsContent>

          {/* Friends Tab */}
          <TabsContent value="friends" className="mt-4 space-y-4">
            {/* Pending Requests */}
            {pendingIncoming.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold" style={{ color: V.muted }}>Pending Requests ({pendingIncoming.length})</p>
                {pendingIncoming.map((req) => (
                  <div key={req.id} className="flex items-center gap-3 p-4 rounded-2xl"
                    style={{ background: 'rgba(124,111,255,0.08)', border: '1px solid rgba(124,111,255,0.25)' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                      style={{ background: 'rgba(124,111,255,0.2)', color: V.accent }}>
                      {req.from_name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm" style={{ color: V.text }}>{req.from_name || req.from_email}</p>
                      {req.message && <p className="text-xs truncate" style={{ color: V.muted }}>"{req.message}"</p>}
                    </div>
                    <div className="flex gap-2">
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(124,111,255,0.2)', color: V.accent }}
                        onClick={() => respondToRequest.mutate({ id: req.id, status: 'accepted' })}>
                        <Check className="w-4 h-4" />
                      </button>
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171' }}
                        onClick={() => respondToRequest.mutate({ id: req.id, status: 'declined' })}>
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Friends List */}
            <div className="space-y-2">
              <p className="text-sm font-semibold" style={{ color: V.muted }}>Friends ({friendsList.length})</p>
              {friendsList.map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-2xl"
                  style={{ background: V.card, border: `1px solid ${V.border}` }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                    style={{ background: 'rgba(124,111,255,0.2)', color: V.accent }}>
                    {f.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm" style={{ color: V.text }}>{f.name || f.email}</p>
                    <p className="text-xs" style={{ color: V.muted }}>{f.email}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/chat?with=${encodeURIComponent(f.email)}&name=${encodeURIComponent(f.name || f.email)}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
                    style={{ background: V.accentBg, color: V.accent, border: '1px solid rgba(124,111,255,0.3)' }}>
                    <MessageSquare className="w-3.5 h-3.5" /> Chat
                  </button>
                </div>
              ))}
              {friendsList.length === 0 && (
                <div className="text-center py-10 rounded-2xl" style={{ background: V.card, border: `1px solid ${V.border}` }}>
                  <Users className="w-10 h-10 mx-auto" style={{ color: V.muted }} />
                  <p className="mt-3 text-sm" style={{ color: V.muted }}>No friends yet.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}