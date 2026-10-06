import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { findMember } from '../../shared/memberAccess.ts';
import { chatDraft } from '../../shared/chatPolicy.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.email) return Response.json({ error: 'unauthorized' }, { status: 401 });
    const body = await req.json();
    const draft = chatDraft(body, user);
    if (draft.error) return Response.json({ error: draft.error }, { status: draft.status });
    const target = await findMember(base44, { email: draft.peer });
    if (!target) return Response.json({ error: 'member_unavailable' }, { status: 404 });
    const svc = base44.asServiceRole;
    const friends = await svc.entities.FriendRequest.filter({ status: 'accepted', $or: [
      { from_email: user.email, to_email: target.email }, { from_email: target.email, to_email: user.email },
    ] }, '-created_date', 1);
    if (target.email !== user.email && !friends.length) {
      const limit = body.context === 'profile' ? 1 : 3;
      const previous = await svc.entities.ChatMessage.filter({ chat_id: draft.record.chat_id, sender_email: user.email }, '-created_date', limit);
      if (previous.length >= limit) return Response.json({ error: 'message_limit' }, { status: 403 });
    }
    const message = await svc.entities.ChatMessage.create(draft.record);
    return Response.json({ message });
  } catch (error) {
    return Response.json({ error: 'send_failed' }, { status: error.status === 401 ? 401 : 500 });
  }
}