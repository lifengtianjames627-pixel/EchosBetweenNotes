import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReviewCard from '@/components/ReviewCard';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Star, UserPlus, Check, X, Music, Shield, MessageSquare, Search } from 'lucide-react';
import UserBadges from '@/components/UserBadges';
import ProfileHero from '@/components/profile/ProfileHero';
import StatStrip from '@/components/profile/StatStrip';
import { awardBadge } from '@/lib/badgeUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Profile() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [friendEmail, setFriendEmail] = useState('');
  const [friendMsg, setFriendMsg] = useState('');
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);

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

  useEffect(() => {
    if (searchQuery.trim().length < 2) { setSearchResults([]); return; }
    setSearching(true);
    const timeout = setTimeout(() => {
      base44.functions.invoke('searchUsers', { query: searchQuery.trim() })
        .then(res => setSearchResults(res.data?.results || []))
        .finally(() => setSearching(false));
    }, 350);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const sendFriendRequest = useMutation({
    mutationFn: () => base44.entities.FriendRequest.create({
      from_email: user.email, from_name: user.full_name,
      to_email: friendEmail, message: friendMsg, status: 'pending',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sent-requests'] });
      setShowAddFriend(false); setFriendEmail(''); setFriendMsg('');
      setSearchQuery(''); setSearchResults([]); setSelectedFriend(null);
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
      <div className="max-w-2xl mx-auto px-5 pt-8 pb-16">

        {/* Profile header */}
        <ProfileHero
          name={user.full_name || 'Listener'}
          email={user.email}
          initial={initial}
          badges={user?.equipped_badges || []}
          statusText={user.email}
          pictureUrl={user?.profile_picture_url}
          editable
        >
          <button
            onClick={() => setShowAddFriend(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(124,111,255,0.14)', color: '#a5b4fc', border: '1px solid rgba(124,111,255,0.3)' }}
          >
            <UserPlus className="w-3.5 h-3.5" /> Add Friend
          </button>
        </ProfileHero>

        {/* Stats row */}
        <StatStrip stats={[
          { label: 'Reviews', val: myReviews.length },
          { label: 'Friends', val: friendsList.length },
          { label: 'Badges', val: earnedBadgeIds.length },
          { label: 'Bands', val: myBands.length },
        ]} />

        {/* Tabs */}
        <Tabs defaultValue="reviews">
          <TabsList className="w-full rounded-xl mb-5"
            style={{ background: 'rgba(12,15,35,0.8)', border: '1px solid rgba(124,111,255,0.15)' }}>
            <TabsTrigger value="reviews" className="flex-1 text-xs"><Star className="w-3.5 h-3.5 mr-1" />Reviews</TabsTrigger>
            <TabsTrigger value="badges" className="flex-1 text-xs">
              <Shield className="w-3.5 h-3.5 mr-1" />Badges
              {earnedBadgeIds.length > 0 && <span className="ml-1 font-bold" style={{ color: '#a5b4fc' }}>{earnedBadgeIds.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="bands" className="flex-1 text-xs"><Music className="w-3.5 h-3.5 mr-1" />Bands</TabsTrigger>
            <TabsTrigger value="friends" className="flex-1 text-xs">
              <Users className="w-3.5 h-3.5 mr-1" />Friends
              {pendingIncoming.length > 0 && (
                <span className="ml-1 text-[10px] font-bold rounded-full w-4 h-4 inline-flex items-center justify-center"
                  style={{ background: '#a5b4fc', color: '#000' }}>{pendingIncoming.length}</span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="space-y-3">
            {myReviews.length > 0 ? myReviews.map(review => <ReviewCard key={review.id} review={review} />) : (
              <div className="text-center py-16" style={{ color: 'rgba(140,155,210,0.4)' }}>
                <Star className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No reviews yet.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="badges">
            <UserBadges user={user} earnedBadgeIds={earnedBadgeIds} />
          </TabsContent>

          <TabsContent value="bands" className="space-y-3">
            <Link to="/band-dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-2"
              style={{ background: 'rgba(124,111,255,0.12)', color: '#a5b4fc', border: '1px solid rgba(124,111,255,0.25)' }}>
              <Music className="w-3.5 h-3.5" /> Manage My Bands
            </Link>
            {myBands.length > 0 ? myBands.map(m => (
              <div key={m.id} className="flex items-center gap-3 p-4 rounded-xl"
                style={{ background: 'rgba(12,15,35,0.8)', border: '1px solid rgba(124,111,255,0.12)' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(124,111,255,0.15)' }}>
                  <Music className="w-4 h-4" style={{ color: '#a5b4fc' }} />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'rgba(220,225,255,0.9)' }}>{m.band_name || 'Band'}</p>
                  <p className="text-xs" style={{ color: 'rgba(140,155,210,0.45)' }}>{m.role || 'Member'}{m.is_founder && ' · Founder'}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-16" style={{ color: 'rgba(140,155,210,0.4)' }}>
                <Music className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No bands yet.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="friends" className="space-y-4">
            {pendingIncoming.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest font-bold px-1" style={{ color: 'rgba(124,111,255,0.5)' }}>
                  Pending · {pendingIncoming.length}
                </p>
                {pendingIncoming.map(req => (
                  <div key={req.id} className="flex items-center gap-3 p-4 rounded-xl"
                    style={{ background: 'rgba(124,111,255,0.07)', border: '1px solid rgba(124,111,255,0.2)' }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                      style={{ background: 'rgba(124,111,255,0.2)', color: '#a5b4fc' }}>
                      {req.from_name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm" style={{ color: 'rgba(220,225,255,0.9)' }}>{req.from_name || req.from_email}</p>
                      {req.message && <p className="text-xs truncate" style={{ color: 'rgba(140,155,210,0.45)' }}>"{req.message}"</p>}
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
                <div key={i} className="flex items-center gap-3 p-4 rounded-xl"
                  style={{ background: 'rgba(12,15,35,0.8)', border: '1px solid rgba(124,111,255,0.12)' }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
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
                    style={{ background: 'rgba(124,111,255,0.12)', color: '#a5b4fc', border: '1px solid rgba(124,111,255,0.2)' }}>
                    <MessageSquare className="w-3.5 h-3.5" /> Chat
                  </button>
                </div>
              ))}
              {friendsList.length === 0 && (
                <div className="text-center py-16" style={{ color: 'rgba(140,155,210,0.4)' }}>
                  <Users className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No friends yet.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Friend Modal */}
      {showAddFriend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => { setShowAddFriend(false); setSearchQuery(''); setSearchResults([]); setSelectedFriend(null); }}>
          <div
            className="rounded-2xl p-6 w-full max-w-sm space-y-4"
            style={{ background: 'rgba(10,12,30,0.98)', border: '1px solid rgba(124,111,255,0.25)' }}
            onClick={e => e.stopPropagation()}
          >
            <p className="font-semibold text-base" style={{ color: 'rgba(220,225,255,0.9)' }}>Send Friend Request</p>
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(140,155,210,0.5)' }} />
                <input className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(124,111,255,0.2)', color: 'rgba(220,225,255,0.9)' }}
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setSelectedFriend(null); setFriendEmail(''); }}
                  placeholder="Search by name or email…" />
                {(searching || searchResults.length > 0) && searchQuery.trim().length >= 2 && !selectedFriend && (
                  <div className="absolute left-0 right-0 mt-1.5 rounded-xl overflow-hidden max-h-48 overflow-y-auto z-10"
                    style={{ background: 'rgba(15,17,38,0.98)', border: '1px solid rgba(124,111,255,0.25)' }}>
                    {searching ? (
                      <p className="text-xs px-4 py-3" style={{ color: 'rgba(140,155,210,0.5)' }}>Searching…</p>
                    ) : searchResults.length > 0 ? (
                      searchResults.map(u => (
                        <button key={u.email} type="button"
                          onClick={() => { setSelectedFriend(u); setFriendEmail(u.email); setSearchQuery(u.full_name || u.email); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-white/5">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                            style={{ background: 'rgba(124,111,255,0.2)', color: '#a5b4fc' }}>
                            {(u.full_name || u.email)[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm truncate" style={{ color: 'rgba(220,225,255,0.9)' }}>{u.full_name || 'Listener'}</p>
                            <p className="text-xs truncate" style={{ color: 'rgba(140,155,210,0.45)' }}>{u.email}</p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="text-xs px-4 py-3" style={{ color: 'rgba(140,155,210,0.5)' }}>No users found.</p>
                    )}
                  </div>
                )}
              </div>
              <input className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(124,111,255,0.2)', color: 'rgba(220,225,255,0.9)' }}
                value={friendMsg} onChange={e => setFriendMsg(e.target.value)} placeholder="Add a message (optional)" />
            </div>
            <div className="flex gap-3 pt-1">
              <button disabled={!friendEmail || sendFriendRequest.isPending}
                onClick={() => sendFriendRequest.mutate()}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: 'rgba(124,111,255,0.2)', color: '#a5b4fc', border: '1px solid rgba(124,111,255,0.3)', opacity: !friendEmail ? 0.4 : 1 }}>
                {sendFriendRequest.isPending ? 'Sending…' : 'Send'}
              </button>
              <button onClick={() => { setShowAddFriend(false); setSearchQuery(''); setSearchResults([]); setSelectedFriend(null); }} className="px-5 py-2.5 rounded-xl text-sm" style={{ color: 'rgba(140,155,210,0.5)' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}