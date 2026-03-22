import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReviewCard from '@/components/ReviewCard';
import GenreBadge, { genreLabels } from '@/components/GenreBadge';
import { User, Music, Users, Star, Save, Guitar, UserCheck, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const INSTRUMENTS = ['Guitar', 'Bass', 'Drums', 'Keyboard/Piano', 'Vocals', 'Violin', 'Trumpet', 'Saxophone', 'Flute', 'Ukulele', 'DJ/Production', 'Other'];

export default function Profile() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: myReviews = [] } = useQuery({
    queryKey: ['my-reviews', currentUser?.email],
    queryFn: () => base44.entities.Review.filter({ created_by: currentUser.email }, '-created_date', 50),
    enabled: !!currentUser?.email,
  });

  const { data: myBands = [] } = useQuery({
    queryKey: ['my-bands', currentUser?.email],
    queryFn: () => base44.entities.BandMember.filter({ user_email: currentUser.email }),
    enabled: !!currentUser?.email,
  });

  const { data: friendRequests = [] } = useQuery({
    queryKey: ['friend-requests', currentUser?.email],
    queryFn: () => base44.entities.FriendRequest.filter({ to_email: currentUser.email, status: 'pending' }),
    enabled: !!currentUser?.email,
  });

  const updateProfile = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setEditing(false);
    },
  });

  const respondToFriend = useMutation({
    mutationFn: ({ id, status }) => base44.entities.FriendRequest.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['friend-requests'] }),
  });

  useEffect(() => {
    if (currentUser) {
      setForm({
        bio: currentUser.bio || '',
        school: currentUser.school || '',
        grade: currentUser.grade || '',
        instruments: currentUser.instruments || [],
        favorite_genres: currentUser.favorite_genres || [],
        looking_for_band: currentUser.looking_for_band || false,
        contact_info: currentUser.contact_info || '',
      });
    }
  }, [currentUser]);

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;
  }

  const toggleInstrument = (inst) => {
    setForm(prev => ({
      ...prev,
      instruments: prev.instruments?.includes(inst)
        ? prev.instruments.filter(i => i !== inst)
        : [...(prev.instruments || []), inst]
    }));
  };

  const toggleGenre = (genre) => {
    setForm(prev => ({
      ...prev,
      favorite_genres: prev.favorite_genres?.includes(genre)
        ? prev.favorite_genres.filter(g => g !== genre)
        : [...(prev.favorite_genres || []), genre]
    }));
  };

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-gradient-to-br from-primary/10 to-accent/5 rounded-3xl p-8">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center">
              <User className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">{currentUser?.full_name || 'Music Lover'}</h1>
              <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
              <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" /> {myReviews.length} reviews</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {myBands.length} bands</span>
              </div>
            </div>
          </div>
          {currentUser?.bio && !editing && (
            <p className="mt-4 text-sm text-muted-foreground">{currentUser.bio}</p>
          )}
          {!editing && currentUser?.instruments?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {currentUser.instruments.map(i => (
                <Badge key={i} variant="outline" className="bg-primary/5 border-primary/20 text-primary text-xs">
                  <Guitar className="w-3 h-3 mr-1" /> {i}
                </Badge>
              ))}
            </div>
          )}
          {!editing && currentUser?.favorite_genres?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {currentUser.favorite_genres.map(g => <GenreBadge key={g} genre={g} />)}
            </div>
          )}
          {currentUser?.looking_for_band && !editing && (
            <Badge className="mt-3 bg-accent text-accent-foreground">🎸 Looking for a band</Badge>
          )}
        </div>
      </motion.div>

      <Tabs defaultValue="profile">
        <TabsList className="bg-muted rounded-xl">
          <TabsTrigger value="profile" className="rounded-lg">Profile</TabsTrigger>
          <TabsTrigger value="reviews" className="rounded-lg">Reviews</TabsTrigger>
          <TabsTrigger value="bands" className="rounded-lg">Bands</TabsTrigger>
          <TabsTrigger value="friends" className="rounded-lg">
            Friends
            {friendRequests.length > 0 && (
              <span className="ml-1.5 w-5 h-5 rounded-full bg-accent text-[10px] text-accent-foreground font-bold flex items-center justify-center">
                {friendRequests.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          {editing ? (
            <Card className="p-6 border-0 shadow-sm space-y-5">
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea value={form.bio} onChange={(e) => setForm({...form, bio: e.target.value})} rows={3} placeholder="Tell people about yourself..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>School</Label>
                  <Input value={form.school} onChange={(e) => setForm({...form, school: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Grade</Label>
                  <Input value={form.grade} onChange={(e) => setForm({...form, grade: e.target.value})} placeholder="e.g. 10th" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Contact (Instagram, phone, etc.)</Label>
                <Input value={form.contact_info} onChange={(e) => setForm({...form, contact_info: e.target.value})} placeholder="@myinstagram" />
              </div>
              <div className="space-y-2">
                <Label>Instruments you play</Label>
                <div className="flex flex-wrap gap-2">
                  {INSTRUMENTS.map((inst) => (
                    <Badge
                      key={inst}
                      variant={form.instruments?.includes(inst) ? 'default' : 'outline'}
                      className="cursor-pointer transition-all"
                      onClick={() => toggleInstrument(inst)}
                    >
                      {inst}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Favorite genres</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(genreLabels).map(([k, v]) => (
                    <Badge
                      key={k}
                      variant={form.favorite_genres?.includes(k) ? 'default' : 'outline'}
                      className="cursor-pointer transition-all"
                      onClick={() => toggleGenre(k)}
                    >
                      {v}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.looking_for_band} onCheckedChange={(v) => setForm({...form, looking_for_band: v})} />
                <Label>I'm looking for a band</Label>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => updateProfile.mutate(form)} className="rounded-xl gap-2" disabled={updateProfile.isPending}>
                  <Save className="w-4 h-4" /> {updateProfile.isPending ? 'Saving...' : 'Save'}
                </Button>
                <Button variant="outline" className="rounded-xl" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card className="p-6 border-0 shadow-sm">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">School:</span> <span className="font-medium">{currentUser?.school || '—'}</span></div>
                  <div><span className="text-muted-foreground">Grade:</span> <span className="font-medium">{currentUser?.grade || '—'}</span></div>
                  <div><span className="text-muted-foreground">Contact:</span> <span className="font-medium">{currentUser?.contact_info || '—'}</span></div>
                </div>
              </Card>
              <Button onClick={() => setEditing(true)} variant="outline" className="rounded-xl">Edit Profile</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="mt-6 space-y-3">
          {myReviews.length > 0 ? (
            myReviews.map((r) => <ReviewCard key={r.id} review={r} />)
          ) : (
            <div className="text-center py-12 bg-card rounded-2xl shadow-sm">
              <Music className="w-10 h-10 mx-auto text-muted-foreground/30" />
              <p className="mt-3 text-muted-foreground text-sm">No reviews yet.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="bands" className="mt-6 space-y-3">
          {myBands.length > 0 ? (
            myBands.map((m) => (
              <Card key={m.id} className="p-4 border-0 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{m.band_name}</p>
                    <p className="text-xs text-muted-foreground">{m.role}{m.is_founder ? ' · Founder' : ''}</p>
                  </div>
                  <Button variant="ghost" size="sm" asChild className="rounded-lg">
                    <a href={`/band/${m.band_id}`}>View →</a>
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 bg-card rounded-2xl shadow-sm">
              <Users className="w-10 h-10 mx-auto text-muted-foreground/30" />
              <p className="mt-3 text-muted-foreground text-sm">Not in any bands yet.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="friends" className="mt-6 space-y-3">
          {friendRequests.length > 0 ? (
            friendRequests.map((fr) => (
              <Card key={fr.id} className="p-4 border-0 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{fr.from_name || fr.from_email}</p>
                      {fr.message && <p className="text-xs text-muted-foreground">"{fr.message}"</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="rounded-lg" onClick={() => respondToFriend.mutate({ id: fr.id, status: 'accepted' })}>Accept</Button>
                    <Button size="sm" variant="outline" className="rounded-lg" onClick={() => respondToFriend.mutate({ id: fr.id, status: 'declined' })}>Decline</Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 bg-card rounded-2xl shadow-sm">
              <Mail className="w-10 h-10 mx-auto text-muted-foreground/30" />
              <p className="mt-3 text-muted-foreground text-sm">No pending friend requests.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}