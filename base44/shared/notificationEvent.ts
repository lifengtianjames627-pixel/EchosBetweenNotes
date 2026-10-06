import { findMember, safeMemberName } from './memberAccess.ts';

export async function notificationEvent(base44, user, body) {
  const svc = base44.asServiceRole;
  const target = await findMember(base44, { email: body.owner_email });
  if (!target) return { error: 'member_unavailable', status: 404 };
  if (target.email === user.email) return { skipped: true };
  const name = safeMemberName(user);
  const record = { owner_email: target.email, type: body.type, actor_name: name, read: false, body: '' };
  if (body.type === 'follow') {
    const relations = await svc.entities.Subscription.filter({ subscriber_email: user.email, target_email: target.email }, '-created_date', 1);
    if (!relations.length) return { error: 'forbidden', status: 403 };
    return { record: { ...record, title: `${name} started following you`, link: `/u/${user.id}` } };
  }
  if (body.type === 'like') {
    if (typeof body.review_id !== 'string' || !/^[a-f0-9]{24}$/i.test(body.review_id)) return { error: 'invalid_review', status: 400 };
    const review = (await svc.entities.Review.filter({ id: body.review_id, reviewer_email: target.email }, '-created_date', 1))[0];
    if (!review || ['blocked', 'pending_review'].includes(review.moderation_status)) return { error: 'forbidden', status: 403 };
    const votes = await svc.entities.ReviewVote.filter({ review_id: review.id, voter_email: user.email }, '-updated_date', 1);
    if (votes[0]?.vote !== 'like') return { error: 'forbidden', status: 403 };
    return { record: { ...record, title: `${name} liked your review`, body: review.album_title ? `On "${review.album_title}"` : '', link: review.album_id ? `/album/${review.album_id}` : '/reviews' } };
  }
  // Friend-request notifications are emitted by friendRequests, not by callers.
  if (user.role !== 'admin' || !['badge', 'ranking', 'system'].includes(body.type)) return { error: 'forbidden', status: 403 };
  if (typeof body.title !== 'string' || !body.title.trim() || body.title.length > 200 || (body.body != null && (typeof body.body !== 'string' || body.body.length > 1000))) return { error: 'invalid_notification', status: 400 };
  const link = body.link || '';
  if (typeof link !== 'string' || (link && (!/^\/(?!\/)[\w/?=&%.\-]*$/.test(link) || link.length > 500))) return { error: 'invalid_link', status: 400 };
  return { record: { ...record, title: body.title.trim(), body: body.body || '', link } };
}