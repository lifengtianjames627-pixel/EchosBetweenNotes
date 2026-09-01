import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// Shared friendship check for the chat gate. A pair are "friends" once a
// FriendRequest between them (either direction) is accepted. `sentRequest`
// is true when the current user has a *pending* request out to the peer —
// used to show "✓ request sent" instead of the Add-friend button.
export function useFriendStatus(myEmail, peerEmail) {
  const { data: reqs = [] } = useQuery({
    queryKey: ['friend-status', myEmail, peerEmail],
    queryFn: () => base44.entities.FriendRequest.filter({
      $or: [
        { from_email: myEmail, to_email: peerEmail },
        { from_email: peerEmail, to_email: myEmail },
      ],
    }),
    enabled: !!myEmail && !!peerEmail,
  });

  const isFriend = reqs.some(r => r.status === 'accepted');
  const sentRequest = reqs.some(r => r.from_email === myEmail && r.status === 'pending');
  return { isFriend, sentRequest };
}