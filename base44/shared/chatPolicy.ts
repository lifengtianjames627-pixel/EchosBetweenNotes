import { safeMemberName } from './memberAccess.ts';

const contactPatterns = [
  /(?:\+?86[-\s.]?)?1[3-9]\d[-\s.]?\d{4}[-\s.]?\d{4}/,
  /(?:微信|weixin|wechat|wx|vx|v信|威信)\s*(?:号|id)?\s*[:：=\-—]?\s*[a-zA-Z0-9_-]{5,}/i,
  /(?:qq|扣扣|企鹅)\s*(?:号)?\s*[:：=\-—]?\s*[1-9]\d{4,11}/i,
  /[\w.+-]+\s*(?:@|＠|\(at\)|\[at\])\s*[\w-]+\s*\.\s*[\w.]{2,}/i,
  /(?:小红书|抖音|快手|ins|instagram|telegram|电报|discord|line|whatsapp|snapchat)\s*(?:号|id)?\s*[:：=\-—]?\s*[a-zA-Z0-9_.-]{4,}/i,
  /(?:加|留|发|私|给|要)\s*(?:个|下|一下)?\s*(?:我的|你的)?\s*(?:微信|wx|vx|qq|电话|手机|联系方式|号码)/i,
  /\d[\s.-]?\d[\s.-]?\d[\s.-]?\d[\s.-]?\d[\s.-]?\d[\s.-]?\d[\s.-]?\d[\s.-]?\d/,
];
export function chatDraft(body, user) {
  if (typeof body.chat_id !== 'string' || body.chat_id.length > 512) return { error: 'invalid_chat', status: 400 };
  const participants = body.chat_id.split('|');
  if (participants.length !== 2 || participants.some(x => !x || !x.includes('@')) || [...participants].sort().join('|') !== body.chat_id) return { error: 'invalid_chat', status: 400 };
  if (!participants.includes(user.email)) return { error: 'forbidden', status: 403 };
  if (typeof body.content !== 'string' || !body.content.trim() || body.content.length > 2000) return { error: 'invalid_message', status: 400 };
  if (contactPatterns.some(re => re.test(body.content))) return { error: 'contact_blocked', status: 400 };
  const attachment = {};
  if (body.attachment_url) {
    if (typeof body.attachment_url !== 'string' || body.attachment_url.length > 2000 || !['image', 'pdf', 'file'].includes(body.attachment_kind) || typeof body.attachment_name !== 'string' || body.attachment_name.length > 255) return { error: 'invalid_attachment', status: 400 };
    let url;
    try { url = new URL(body.attachment_url); } catch { return { error: 'invalid_attachment', status: 400 }; }
    if (url.protocol !== 'https:') return { error: 'invalid_attachment', status: 400 };
    attachment.attachment_url = body.attachment_url;
    attachment.attachment_kind = body.attachment_kind;
    attachment.attachment_name = body.attachment_name;
  }
  return { peer: participants.find(x => x !== user.email) || user.email, record: {
    chat_id: body.chat_id, participants, sender_email: user.email,
    sender_name: safeMemberName(user), content: body.content.trim(), ...attachment,
  } };
}