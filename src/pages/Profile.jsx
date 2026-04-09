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
import { motion } from 'framer-motion';

export default function Profile() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [friendEmail, setFriendEmail] = useState('');
  const [friendMsg, setFriendMsg] = useState('');
  const [showAddFriend, setShowAddFriend] = useState(false);

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

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
      from_email: user.email, from_name: user.full_name,
      to_email: friendEmail, message: friendMsg, status: 'pending',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sent-requests'] });
      setShowAddFriend(false); setFriendEmail(''); setFriendMsg('');
    },
  });

  const respondToRequest = useMutation({
    mutationFn: ({ id, status }) => base44.entities.FriendRequest.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['incoming-requests'] }),
  });

  const pendingIncoming = incomingRequests.filter(r => r.status === 'pending');
  const friends = incomingRequests.filter(r => r.status === 'accepted');
  const acceptedSent = sentRequests.filter(r => r.status === 'accepted');
  const friendsList = [
    ...friends.map(r => ({ name: r.from_name, email: r.from_email })),
    ...acceptedSent.map(r => ({ name: r.to_name, email: r.to_email })),
  ];

  if (!user) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-indigo-400/20 border-t-indigo-400 rounded-full animate-spin" />
    </div>
  );

  const initial = (user.full_name || user.email || 'U')[0].toUpperCase();

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at 50% 0%, #0d1535 0%, #070910 55%, #020304 100%)' }}>

      {/* ── Hero / identity section ── */}
      <div className="relative overflow-hidden px-6 pt-10 pb-16">
        {/* Large decorative initial behind everything */}
        <div
          className="absolute -top-6 -left-4 select-none pointer-events-none font-black leading-none"
          style={{
            fontSize: 'clamp(12rem, 30vw, 22rem)',
            color: 'rgba(124,111,255,0.04)',
            fontFamily: 'Georgia, serif',
            letterSpacing: '-0.06em',
          }}
        >
          {initial}
        </div>

        {/* Glow blob */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(192,132,252,0.08) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />

        <div className="relative max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {/* Avatar + name — loose, offset layout */}
            <div className="flex items-end gap-5">
              <div
                className="w-24 h-24 rounded-3xl flex items-center justify-center text-4xl font-black shrink-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(124,111,255,0.35), rgba(192,132,252,0.35))',
                  border: '1px solid rgba(124,111,255,0.3)',
                  boxShadow: '0 0 40px rgba(124,111,255,0.2)',
                  color: '#c4baff',
                }}
              >
                {initial}
              </div>
              <div className="pb-1">
                <h1 className="font-black leading-none" style={{
                  fontSize: 'clamp(2rem, 6vw, 3.5rem)',
                  background: 'linear-gradient(135deg, #e0e8ff, #a5b4fc, #c084fc)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  letterSpacing: '-0.03em',
                }}>
                  {user.full_name || 'Listener'}
                </h1>
                <p className="text-sm mt-1" style={{ color: 'rgba(140,155,210,0.5)' }}>{user.email}</p>
              </div>
            </div>

            {/* Equipped badges — floats below, slightly indented */}
            {user?.equipped_badges?.length > 0 && (
              <div className="flex gap-2 mt-4 ml-2">
                {user.equipped_badges.map(id => <BadgeIcon key={id} badgeId={id} size="sm" />)}
              </div>
            )}

            {/* Stats — scattered horizontally with varying sizes */}
            <div className="flex items-end gap-8 mt-8 ml-1 flex-wrap">
              {[
                { label: 'Reviews', val: myReviews.length, big: true },
                { label: 'Friends', val: friendsList.length, big: false },
                { label: 'Badges', val: earnedBadgeIds.length, big: false },
                { label: 'Bands', val: myBands.length, big: false },
              ].map(({ label, val, big }) => (
                <div key={label}>
                  <p className="font-black leading-none" style={{
                    fontSize: big ? '3rem' : '1.75rem',
                    color: big ? '#a5b4fc' : 'rgba(200,210,255,0.7)',
                    letterSpacing: '-0.04em',
                  }}>{val}</p>
                  <p className="text-xs uppercase tracking-widest mt-1" style={{ color: 'rgba(140,155,210,0.4)' }}>{label}</p>
                </div>
              ))}

              {/* Add friend — tucked into the stats row */}
              <button
                onClick={() => setShowAddFriend(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold ml-auto"
                style={{ background: 'rgba(124,111,255,0.12)', color: '#a5b4fc', border: '1px solid rgba(124,111,255,0.3)' }}
              >
                <UserPlus className="w-3.5 h-3.5" /> Add Friend
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="max-w-2xl mx-auto px-6 pb-16 -mt-6 relative z-10">
        <Tabs defaultValue="reviews">
          <TabsList className="w-full rounded-2xl mb-6"
            style={{ background: 'rgba(12,15,35,0.8)', border: '1px solid rgba(124,111,255,0.15)', backdropFilter: 'blur(12px)' }}>
            <TabsTrigger value="reviews" className="flex-1 rounded-xl text-xs"><Star className="w-3.5 h-3.5 mr-1" />Reviews</TabsTrigger>
            <TabsTrigger value="badges" className="flex-1 rounded-xl text-xs">
              <Shield className="w-3.5 h-3.5 mr-1" />Badges
              {earnedBadgeIds.length > 0 && <span className="ml-1 font-bold" style={{ color: '#a5b4fc' }}>{earnedBadgeIds.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="bands" className="flex-1 rounded-xl text-xs"><Music className="w-3.5 h-3.5 mr-1" />Bands</TabsTrigger>
            <TabsTrigger value="friends" className="flex-1 rounded-xl text-xs">
              <Users className="w-3.5 h-3.5 mr-1" />Friends
              {pendingIncoming.length > 0 && (
                <span className="ml-1 text-[10px] font-bold rounded-full w-4 h-4 inline-flex items-center justify-center"
                  style={{ background: '#a5b4fc', color: '#000' }}>{pendingIncoming.length}</span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Reviews */}
          <TabsContent value="reviews" className="space-y-3">
            {myReviews.length > 0 ? myReviews.map(review => <ReviewCard key={review.id} review={review} />) : (
              <div className="text-center py-16" style={{ color: 'rgba(140,155,210,0.4)' }}>
                <Star className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No reviews yet.</p>
              </div>
            )}
          </TabsContent>

          {/* Badges */}
          <TabsContent value="badges">
            <UserBadges user={user} earnedBadgeIds={earnedBadgeIds} />
          </TabsContent>

          {/* Bands */}
          <TabsContent value="bands" className="space-y-3">
            <Link to="/band-dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-2"
              style={{ background: 'rgba(124,111,255,0.12)', color: '#a5b4fc', border: '1px solid rgba(124,111,255,0.3)' }}>
              <Music className="w-3.5 h-3.5" /> Manage My Bands
            </Link>
            {myBands.length > 0 ? myBands.map(m => (
              <div key={m.id} className="flex items-center gap-3 p-4 rounded-2xl"
                style={{ background: 'rgba(12,15,35,0.8)', border: '1px solid rgba(124,111,255,0.15)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,111,255,0.2)' }}>
                  <Music className="w-5 h-5" style={{ color: '#a5b4fc' }} />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'rgba(220,225,255,0.9)' }}>{m.band_name || 'Band'}</p>
                  <p className="text-xs" style={{ color: 'rgba(140,155,210,0.5)' }}>{m.role || 'Member'}{m.is_founder && ' · Founder'}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-16" style={{ color: 'rgba(140,155,210,0.4)' }}>
                <Music className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No bands yet.</p>
              </div>
            )}
          </TabsContent>

          {/* Friends */}
          <TabsContent value="friends" className="space-y-4">
            {pendingIncoming.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest font-bold px-1" style={{ color: 'rgba(124,111,255,0.5)' }}>
                  Pending · {pendingIncoming.length}
                </p>
                {pendingIncoming.map(req => (
                  <div key={req.id} className="flex items-center gap-3 p-4 rounded-2xl"
                    style={{ background: 'rgba(124,111,255,0.07)', border: '1px solid rgba(124,111,255,0.2)' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                      style={{ background: 'rgba(124,111,255,0.2)', color: '#a5b4fc' }}>
                      {req.from_name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm" style={{ color: 'rgba(220,225,255,0.9)' }}>{req.from_name || req.from_email}</p>
                      {req.message && <p className="text-xs truncate" style={{ color: 'rgba(140,155,210,0.5)' }}>"{req.message}"</p>}
                    </div>
                    <div className="flex gap-2">
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(124,111,255,0.2)', color: '#a5b4fc' }}
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

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-widest font-bold px-1" style={{ color: 'rgba(140,155,210,0.4)' }}>
                Friends · {friendsList.length}
              </p>
              {friendsList.map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-2xl"
                  style={{ background: 'rgba(12,15,35,0.8)', border: '1px solid rgba(124,111,255,0.15)' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                    style={{ background: 'rgba(124,111,255,0.2)', color: '#a5b4fc' }}>
                    {f.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm" style={{ color: 'rgba(220,225,255,0.9)' }}>{f.name || f.email}</p>
                    <p className="text-xs" style={{ color: 'rgba(140,155,210,0.4)' }}>{f.email}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/chat?with=${encodeURIComponent(f.email)}&name=${encodeURIComponent(f.name || f.email)}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
                    style={{ background: 'rgba(124,111,255,0.12)', color: '#a5b4fc', border: '1px solid rgba(124,111,255,0.25)' }}>
                    <MessageSquare className="w-3.5 h-3.5" /> Chat
                  </button>
                </div>
              ))}
              {friendsList.length === 0 && (
                <div className="text-center py-16" style={{ color: 'rgba(140,155,210,0.4)' }}>
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No friends yet.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Friend Modal */}
      {showAddFriend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setShowAddFriend(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl p-7 w-full max-w-sm space-y-4"
            style={{ background: 'rgba(10,12,30,0.98)', border: '1px solid rgba(124,111,255,0.25)', boxShadow: '0 0 60px rgba(124,111,255,0.15)' }}
            onClick={e => e.stopPropagation()}
          >
            <p className="font-black text-xl" style={{ color: '#a5b4fc', letterSpacing: '-0.02em' }}>Send a Request</p>
            <div className="space-y-3">
              <input type="email" className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(124,111,255,0.2)', color: 'rgba(220,225,255,0.9)' }}
                value={friendEmail} onChange={e => setFriendEmail(e.target.value)} placeholder="friend@email.com" />
              <input className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(124,111,255,0.2)', color: 'rgba(220,225,255,0.9)' }}
                value={friendMsg} onChange={e => setFriendMsg(e.target.value)} placeholder="Add a message (optional)" />
            </div>
            <div className="flex gap-3 pt-1">
              <button disabled={!friendEmail || sendFriendRequest.isPending}
                onClick={() => sendFriendRequest.mutate()}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold"
                style={{ background: 'rgba(124,111,255,0.2)', color: '#a5b4fc', border: '1px solid rgba(124,111,255,0.35)', opacity: !friendEmail ? 0.4 : 1 }}>
                {sendFriendRequest.isPending ? 'Sending…' : 'Send'}
              </button>
              <button onClick={() => setShowAddFriend(false)} className="px-5 py-3 rounded-2xl text-sm" style={{ color: 'rgba(140,155,210,0.5)' }}>Cancel</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}