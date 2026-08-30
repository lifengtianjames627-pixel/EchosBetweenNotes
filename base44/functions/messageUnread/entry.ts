import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Unread direct-message count for the Messages nav badge. "Unread" = messages
// sent to me (chat_id contains my email, sender is not me) that arrived after
// my messages_last_seen timestamp. Opening /chat updates that timestamp.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const lastSeen = user.messages_last_seen ? new Date(user.messages_last_seen) : new Date(0);
    const messages = await base44.asServiceRole.entities.ChatMessage.list('-created_date', 200);
    const myEmail = user.email;
    const unread = (messages || []).filter(m =>
      m.sender_email !== myEmail &&
      m.chat_id &&
      m.chat_id.split('|').includes(myEmail) &&
      new Date(m.created_date) > lastSeen
    ).length;

    return Response.json({ unread });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}