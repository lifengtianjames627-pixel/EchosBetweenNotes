import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { notificationEvent } from '../../shared/notificationEvent.ts';

// System notifications (likes, follows, badges, friend requests…). All access
// is mediated through this function: it identifies the caller via auth.me() and
// uses the service role to read/write Notification records scoped to that user's
// email, so the entity itself is locked to admins and never queried directly.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'list';

    if (action === 'list') {
      const mine = await base44.asServiceRole.entities.Notification.filter({ owner_email: user.email }, '-created_date', 30);
      let unread = 0, offset = 0;
      while (true) {
        const page = await base44.asServiceRole.entities.Notification.filter({ owner_email: user.email, read: false }, 'id', 100, offset);
        unread += page.length;
        if (page.length < 100) break;
        offset += page.length;
      }
      return Response.json({ items: mine.map(({ id, title, body, link, actor_name, read, created_date, type }) => ({ id, title, body, link, actor_name, read, created_date, type })), unread });
    }

    if (action === 'create') {
      const event = await notificationEvent(base44, user, body);
      if (event.error) return Response.json({ error: event.error }, { status: event.status });
      if (event.skipped) return Response.json({ skipped: true });
      const created = await base44.asServiceRole.entities.Notification.create(event.record);
      return Response.json({ ok: true, id: created.id });
    }

    if (action === 'markAll') {
      let result;
      do {
        result = await base44.asServiceRole.entities.Notification.updateMany({ owner_email: user.email, read: false }, { $set: { read: true } });
      } while (result.has_more === true);
      return Response.json({ ok: true });
    }

    if (action === 'markRead') {
      const { id } = body;
      if (typeof id !== 'string' || !/^[a-f0-9]{24}$/i.test(id)) return Response.json({ error: 'Invalid id' }, { status: 400 });
      const mine = await base44.asServiceRole.entities.Notification.filter({ id, owner_email: user.email }, '-created_date', 1);
      if (!mine.length) return Response.json({ error: 'Forbidden' }, { status: 403 });
      await base44.asServiceRole.entities.Notification.updateMany({ id, owner_email: user.email }, { $set: { read: true } });
      return Response.json({ ok: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}