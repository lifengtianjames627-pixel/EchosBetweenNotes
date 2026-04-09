import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ReviewCard from '@/components/ReviewCard';
import { Link } from 'react-router-dom';
import { Users, Star, UserPlus, Check, X, Music, Shield } from 'lucide-react';
import UserBadges from '@/components/UserBadges';
import BadgeIcon from '@/components/BadgeIcon';
import { awardBadge } from '@/lib/badgeUtils';

export default function Profile() {
  const queryClient = useQueryClient();
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

  // Award welcome badge if first login
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

  if (!user) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-card rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold text-white shrink-0">
          {user.full_name?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold">{user.full_name}</h1>
          <p className="text-muted-foreground text-sm">{user.email}</p>
          {/* Equipped badges */}
          {user?.equipped_badges?.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap justify-center sm:justify-start">
              {user.equipped_badges.map(id => (
                <BadgeIcon key={id} badgeId={id} size="xs" />
              ))}
            </div>
          )}
          <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-4">
            <div className="text-center">
              <p className="text-xl font-bold">{myReviews.length}</p>
              <p className="text-xs text-muted-foreground">Reviews</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">{myBands.length}</p>
              <p className="text-xs text-muted-foreground">Bands</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">{friends.length + acceptedSent.length}</p>
              <p className="text-xs text-muted-foreground">Friends</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">{earnedBadgeIds.length}</p>
              <p className="text-xs text-muted-foreground">Badges</p>
            </div>
          </div>
        </div>
        <Dialog open={showAddFriend} onOpenChange={setShowAddFriend}>
          <DialogTrigger asChild>
            <Button variant="outline" className="rounded-xl gap-2 shrink-0">
              <UserPlus className="w-4 h-4" /> Add Friend
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Send Friend Request</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Friend's Email *</Label>
                <Input value={friendEmail} onChange={(e) => setFriendEmail(e.target.value)} placeholder="friend@school.edu" type="email" />
              </div>
              <div className="space-y-2">
                <Label>Message (optional)</Label>
                <Input value={friendMsg} onChange={(e) => setFriendMsg(e.target.value)} placeholder="Hey, let's connect!" />
              </div>
              <Button className="w-full rounded-xl" onClick={() => sendFriendRequest.mutate()} disabled={!friendEmail || sendFriendRequest.isPending}>
                {sendFriendRequest.isPending ? 'Sending...' : 'Send Request'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="reviews" className="w-full">
        <TabsList className="w-full rounded-xl">
          <TabsTrigger value="reviews" className="flex-1 rounded-lg">
            <Star className="w-4 h-4 mr-1.5" /> Reviews
          </TabsTrigger>
          <TabsTrigger value="badges" className="flex-1 rounded-lg">
            <Shield className="w-4 h-4 mr-1.5" /> Badges {earnedBadgeIds.length > 0 && <span className="ml-1 text-xs font-bold text-primary">{earnedBadgeIds.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="bands" className="flex-1 rounded-lg">
            <Music className="w-4 h-4 mr-1.5" /> Bands
          </TabsTrigger>
          <TabsTrigger value="friends" className="flex-1 rounded-lg">
            <Users className="w-4 h-4 mr-1.5" />
            Friends
            {pendingIncoming.length > 0 && (
              <span className="ml-1.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 inline-flex items-center justify-center">
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
            <div className="text-center py-12 bg-card rounded-2xl">
              <Star className="w-10 h-10 mx-auto text-muted-foreground/30" />
              <p className="mt-3 text-muted-foreground text-sm">You haven't written any reviews yet.</p>
              <Link to="/discover" className="mt-2 inline-block text-sm text-primary font-medium">Discover Albums →</Link>
            </div>
          )}
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="mt-4">
          <UserBadges user={user} earnedBadgeIds={earnedBadgeIds} />
        </TabsContent>

        {/* Bands Tab */}
        <TabsContent value="bands" className="mt-4 space-y-3">
          {myBands.length > 0 ? (
            myBands.map((membership) => (
              <Link key={membership.id} to={`/band/${membership.band_id}`} className="block">
                <div className="flex items-center gap-3 p-4 bg-card rounded-2xl shadow-sm hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Music className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{membership.band_name || 'Band'}</p>
                    <p className="text-xs text-muted-foreground">{membership.role || 'Member'} {membership.is_founder && '· Founder'}</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-12 bg-card rounded-2xl">
              <Music className="w-10 h-10 mx-auto text-muted-foreground/30" />
              <p className="mt-3 text-muted-foreground text-sm">You haven't joined any bands yet.</p>
              <Link to="/bands" className="mt-2 inline-block text-sm text-primary font-medium">Browse Bands →</Link>
            </div>
          )}
        </TabsContent>

        {/* Friends Tab */}
        <TabsContent value="friends" className="mt-4 space-y-4">
          {/* Pending Requests */}
          {pendingIncoming.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-muted-foreground">Pending Requests ({pendingIncoming.length})</p>
              {pendingIncoming.map((req) => (
                <div key={req.id} className="flex items-center gap-3 p-4 bg-card rounded-2xl shadow-sm border border-primary/20">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {req.from_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{req.from_name || req.from_email}</p>
                    {req.message && <p className="text-xs text-muted-foreground truncate">"{req.message}"</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" className="w-8 h-8 rounded-lg" onClick={() => respondToRequest.mutate({ id: req.id, status: 'accepted' })}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="outline" className="w-8 h-8 rounded-lg" onClick={() => respondToRequest.mutate({ id: req.id, status: 'declined' })}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Friends List */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-muted-foreground">Friends ({friends.length + acceptedSent.length})</p>
            {[...friends.map(r => ({ name: r.from_name, email: r.from_email })),
              ...acceptedSent.map(r => ({ name: r.to_name, email: r.to_email }))].map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-card rounded-2xl shadow-sm">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-primary">
                  {f.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="font-medium text-sm">{f.name || f.email}</p>
                  <p className="text-xs text-muted-foreground">{f.email}</p>
                </div>
              </div>
            ))}
            {friends.length + acceptedSent.length === 0 && (
              <div className="text-center py-10 bg-card rounded-2xl">
                <Users className="w-10 h-10 mx-auto text-muted-foreground/30" />
                <p className="mt-3 text-muted-foreground text-sm">No friends yet. Add some!</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}