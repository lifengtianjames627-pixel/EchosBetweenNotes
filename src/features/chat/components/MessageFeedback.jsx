import React from 'react';
import { useLang } from '@/i18n/LanguageContext';
import messageCopy from '@/features/chat/i18n/messageCopy';

export default function MessageFeedback({ error }) {
  const { lang } = useLang();
  if (!error) return null;
  const copy = messageCopy(lang);
  const code = error.response?.data?.error || error.message;
  const text = code === 'contact_blocked' ? copy.blocked : code === 'message_limit' ? copy.limit : code === 'member_unavailable' ? copy.unavailable : copy.failed;
  return <p role="alert" className="px-5 py-2 text-sm text-destructive">{text}</p>;
}