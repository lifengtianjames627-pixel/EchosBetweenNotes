import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import GenreBadge from '@/components/GenreBadge';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Guitar, User, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BandDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [showJoin, setShowJoin] = useState(false);
  const [joinRole, setJoinRole] = useState('');

  const { data: band, isLoading } = useQuery({
    queryKey: ['band', id],
    queryFn: async () => {
      const bands = await base44.entities.Band.filter({ id });
      return bands[0];
    },
  });

  const { data: members = [] } = useQuery({
    queryKey: ['band-members', id],
    queryFn: () => base44.entities.BandMember.filter({ band_id: id }),
  });

  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const isMember = members.some(m => m.user_email === currentUser?.email);

  const joinBand = useMutation({
    mutationFn: async () => {
      await base44.entities.BandMember.create({
        band_id: id,
        band_name: band.name,
        user_email: currentUser.email,
        user_name: currentUser.full_name,
        role: joinRole,
        is_founder: false,
      });
      await base44.entities.Band.update(id, {
        member_count: (band.member_count || 1) + 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['band-members', id] });
      queryClient.invalidateQueries({ queryKey: ['band', id] });
      setShowJoin(false);
      setJoinRole('');
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;
  }

  if (!band) {
    return <div className="text-center py-20 text-muted-foreground">Band not found.</div>;
  }

  return (
    <div className="space-y-8">
      <Link to="/bands" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Bands
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-transparent rounded-3xl p-8">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center shrink-0">
              <Guitar className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold">{band.name}</h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {band.genre && <GenreBadge genre={band.genre} />}
                <Badge variant={band.status === 'recruiting' ? 'default' : 'secondary'}>
                  {band.status || 'recruiting'}
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {band.member_count || 1} members
                </span>
              </div>
              {band.description && (
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-lg">{band.description}</p>
              )}
              {!isMember && band.status === 'recruiting' && (
                <Dialog open={showJoin} onOpenChange={setShowJoin}>
                  <DialogTrigger asChild>
                    <Button className="mt-5 rounded-xl gap-2">
                      <UserPlus className="w-4 h-4" /> Join this Band
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-sm">
                    <DialogHeader><DialogTitle>Join {band.name}</DialogTitle></DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); joinBand.mutate(); }} className="space-y-4 mt-2">
                      <div className="space-y-2">
                        <Label>Your Role / Instrument</Label>
                        <Input value={joinRole} onChange={(e) => setJoinRole(e.target.value)} placeholder="e.g. Guitarist, Vocalist" required />
                      </div>
                      <Button type="submit" className="w-full rounded-xl" disabled={joinBand.isPending}>
                        {joinBand.isPending ? 'Joining...' : 'Join Band'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
              {isMember && (
                <Badge variant="outline" className="mt-5 border-primary text-primary">
                  ✓ You're a member
                </Badge>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Looking For */}
      {band.looking_for?.length > 0 && (
        <section>
          <h2 className="text-lg font-bold mb-3">Looking For</h2>
          <div className="flex flex-wrap gap-2">
            {band.looking_for.map((role) => (
              <Badge key={role} variant="outline" className="px-4 py-2 text-sm border-primary/30 text-primary bg-primary/5">
                🎵 {role}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* Members */}
      <section>
        <h2 className="text-lg font-bold mb-3">Members ({members.length})</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {members.map((member) => (
            <Card key={member.id} className="p-4 border-0 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{member.user_name || member.user_email}</p>
                <p className="text-xs text-muted-foreground">
                  {member.role || 'Member'}
                  {member.is_founder && ' · Founder'}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}