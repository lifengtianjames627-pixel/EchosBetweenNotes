import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Bell, BellOff } from 'lucide-react';
import useReviewVoting from '@/features/reviews/queries/useReviewVoting';
import voteCopy from '@/features/reviews/model/voteCopy';
import { useLang } from '@/i18n/LanguageContext';
import { notify } from '@/lib/notify';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthed } from '@/hooks/useAuthed';
import { displayName } from '@/lib/displayName';
import ReviewEditControl from '@/components/reviews/ReviewEditControl';

export default function ReviewActions({ review, v, currentUser }) {
  const queryClient = useQueryClient();
  const { login } = useAuthed();
  const { lang } = useLang();
  const { voteMutation, voteLoading, myVote, likesCount, dislikesCount } = useReviewVoting({ review, currentUser });

  // Fetch subscription status
  const { data: mySubs = [] } = useQuery({
    queryKey: ['my-sub', review.reviewer_email, currentUser?.email],
    queryFn: () => base44.entities.Subscription.filter({ subscriber_email: currentUser.email, target_email: review.reviewer_email }),
    enabled: !!currentUser?.email && !!review.reviewer_email && review.reviewer_email !== currentUser?.email,
  });
  const isSubscribed = mySubs.length > 0;

  const [optimisticSub, setOptimisticSub] = useState(null); // null = use real data
  const effectiveSub = optimisticSub !== null ? optimisticSub : isSubscribed;

  const subMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser?.email) return;
      if (effectiveSub) {
        setOptimisticSub(false);
        await base44.entities.Subscription.delete(mySubs[0].id);
      } else {
        setOptimisticSub(true);
        await base44.entities.Subscription.create({
          subscriber_email: currentUser.email,
          subscriber_name: displayName(currentUser),
          target_email: review.reviewer_email,
          target_name: review.reviewer_name || '',
        });
        notify({
          owner_email: review.reviewer_email,
          type: 'follow',
          title: `${displayName(currentUser)} started following you`,
          link: `/u/${encodeURIComponent(currentUser.email)}`,
          actor_name: displayName(currentUser),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-sub', review.reviewer_email, currentUser?.email] });
      setOptimisticSub(null);
    },
  });

  const canVote = !!currentUser?.email;
  const canSubscribe = !!currentUser?.email && !!review.reviewer_email && review.reviewer_email !== currentUser?.email;

  const btnBase = "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all";

  return (
    <div className="flex items-center gap-2 mt-3 flex-wrap">
      <ReviewEditControl review={review} user={currentUser} />
      {voteMutation.isError && <p role="alert" className="basis-full text-xs text-destructive">{voteCopy(lang)}</p>}
      {/* Like */}
      <button
        className={btnBase}
        disabled={voteMutation.isPending || voteLoading}
        onClick={() => canVote ? voteMutation.mutate('like') : login()}
        title={canVote ? 'Like' : 'Login to vote'}
        style={{
          background: myVote === 'like' ? `${v.accent}30` : 'rgba(255,255,255,0.05)',
          color: myVote === 'like' ? v.accent : v.muted,
          border: `1px solid ${myVote === 'like' ? v.accent + '60' : 'rgba(255,255,255,0.08)'}`,
          boxShadow: myVote === 'like' ? `0 0 8px ${v.accentGlow}` : 'none',
        }}
      >
        <ThumbsUp className="w-3 h-3" />
        <span>{likesCount}</span>
      </button>

      {/* Dislike */}
      <button
        className={btnBase}
        disabled={voteMutation.isPending || voteLoading}
        onClick={() => canVote ? voteMutation.mutate('dislike') : login()}
        title={canVote ? 'Dislike' : 'Login to vote'}
        style={{
          background: myVote === 'dislike' ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.05)',
          color: myVote === 'dislike' ? '#f87171' : v.muted,
          border: `1px solid ${myVote === 'dislike' ? 'rgba(248,113,113,0.4)' : 'rgba(255,255,255,0.08)'}`,
        }}
      >
        <ThumbsDown className="w-3 h-3" />
        <span>{dislikesCount}</span>
      </button>

      {/* Subscribe */}
      {canSubscribe && (
        <button
          className={btnBase}
          disabled={subMutation.isPending}
          onClick={() => subMutation.mutate()}
          title={effectiveSub ? 'Unsubscribe from this reviewer' : 'Subscribe to this reviewer'}
          style={{
            background: effectiveSub ? 'rgba(124,111,255,0.15)' : 'rgba(255,255,255,0.05)',
            color: effectiveSub ? '#a5b4fc' : v.muted,
            border: `1px solid ${effectiveSub ? 'rgba(124,111,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
          }}
        >
          {effectiveSub ? <BellOff className="w-3 h-3" /> : <Bell className="w-3 h-3" />}
          <span>{effectiveSub ? 'Subscribed' : 'Subscribe'}</span>
        </button>
      )}
    </div>
  );
}