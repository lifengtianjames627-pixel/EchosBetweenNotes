import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, UserPlus, MessageSquare, ShieldAlert, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useChat, makeChatId } from '@/lib/useChat';
import { findContactInfo } from '@/lib/contactFilter';
import ReportButton from '@/components/soulmate/ReportButton';

const MAX_MESSAGES = 5;

export default function MiniChat({ peer, currentUser, onClose }) {
  const [text, setText] = useState('');
  const [friendSent, setFriendSent] = useState(false);
  const [warning, setWarning] = useState(null);
  const bottomRef = useRef(null);

  const chatId = currentUser?.email && peer?.email
    ? makeChatId(currentUser.email, peer.email)
    : null;

  const { messages, send } = useChat({ chatId, currentUser, limit: 30 });

  const myMessages = messages.filter(m => m.sender_email === currentUser?.email);
  const limitReached = myMessages.length >= MAX_MESSAGES;

  const { data: existingReqs = [] } = useQuery({
    queryKey: ['friend-check', currentUser?.email, peer?.email],
    queryFn: () => base44.entities.FriendRequest.filter({ from_email: currentUser.email, to_email: peer.email }),
    enabled: !!currentUser?.email && !!peer?.email,
  });
  const alreadySentRequest = existingReqs.length > 0 || friendSent;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const sendFriendRequest = useMutation({
    mutationFn: () => base44.entities.FriendRequest.create({
      from_email: currentUser.email,
      from_name: currentUser.full_name || '',
      to_email: peer.email,
      to_name: peer.name || '',
      status: 'pending',
    }),
    onSuccess: () => setFriendSent(true),
  });

  // Contact details stay out of chat: in-app messages are logged and reportable,
  // an exchanged handle is not.
  const handleSend = () => {
    const content = text.trim();
    if (!content) return;
    const contact = findContactInfo(content);
    if (contact.length > 0) {
      setWarning(`Keep it in Chordmates — remove your ${contact.join(', ')}.`);
      return;
    }
    setWarning(null);
    setText('');
    send.mutate(content);
  };

  if (!currentUser || !peer) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className="fixed bottom-6 right-6 z-[200] w-80 rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: 'rgba(8,10,28,0.97)',
        border: '1px solid rgba(124,111,255,0.3)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,111,255,0.1)',
        height: 440,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 shrink-0"
        style={{ borderBottom: '1px solid rgba(124,111,255,0.15)', background: 'rgba(124,111,255,0.08)' }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
          style={{ background: 'rgba(124,111,255,0.25)', color: '#a5b4fc' }}>
          {(peer.name || peer.email || '?')[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'rgba(220,225,255,0.9)' }}>{peer.name || peer.email}</p>
          <p className="text-[10px]" style={{ color: 'rgba(140,155,210,0.5)' }}>
            Temporary chat · {Math.max(0, MAX_MESSAGES - myMessages.length)} messages left
          </p>
        </div>
        <ReportButton
          targetType="chat_message"
          targetId={chatId}
          targetSummary={messages.slice(-6).map(m => `${m.sender_name}: ${m.content}`).join('\n')}
          targetAuthorEmail={peer.email}
          currentUser={currentUser}
        />
        <button onClick={onClose} style={{ color: 'rgba(140,155,210,0.5)' }}>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 px-4">
            <MessageSquare className="w-8 h-8" style={{ color: 'rgba(124,111,255,0.3)' }} />
            <p className="text-xs text-center" style={{ color: 'rgba(140,155,210,0.45)' }}>
              Start a conversation!<br />You have {MAX_MESSAGES} messages to make a connection.
            </p>
            <p className="text-[10px] text-center mt-1" style={{ color: 'rgba(140,155,210,0.35)' }}>
              Never share your phone, WeChat or QQ here.
            </p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_email === currentUser.email;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-wrap flex items-end gap-1.5"
                style={{
                  background: isMe ? 'rgba(124,111,255,0.25)' : 'rgba(255,255,255,0.06)',
                  color: isMe ? '#c4baff' : 'rgba(200,210,240,0.85)',
                  border: `1px solid ${isMe ? 'rgba(124,111,255,0.35)' : 'rgba(255,255,255,0.08)'}`,
                  opacity: msg._pending ? 0.6 : 1,
                }}>
                <span>{msg.content}</span>
                {msg._pending && <Clock className="w-2.5 h-2.5 shrink-0 mb-0.5 opacity-70" />}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Contact-info warning */}
      <AnimatePresence>
        {warning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden shrink-0 px-3"
          >
            <div className="flex gap-2 rounded-xl p-2.5 mb-1"
              style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)' }}>
              <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: '#fbbf24' }} />
              <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(251,191,36,0.9)' }}>{warning}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Limit reached → Friend CTA */}
      {limitReached && (
        <div className="px-3 pb-3 shrink-0">
          <div className="rounded-xl p-3 text-center space-y-2"
            style={{ background: 'rgba(124,111,255,0.1)', border: '1px solid rgba(124,111,255,0.25)' }}>
            <p className="text-xs" style={{ color: 'rgba(165,180,252,0.8)' }}>
              Message limit reached! Add {peer.name || 'them'} as a friend to keep chatting.
            </p>
            {alreadySentRequest ? (
              <p className="text-xs font-semibold" style={{ color: '#86efac' }}>✓ Friend request sent!</p>
            ) : (
              <button
                onClick={() => sendFriendRequest.mutate()}
                disabled={sendFriendRequest.isPending}
                className="flex items-center gap-1.5 mx-auto px-4 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(124,111,255,0.25)', color: '#a5b4fc', border: '1px solid rgba(124,111,255,0.4)' }}>
                <UserPlus className="w-3.5 h-3.5" />
                {sendFriendRequest.isPending ? 'Sending…' : 'Add Friend'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Input */}
      {!limitReached && (
        <div className="px-3 pb-3 pt-1 shrink-0" style={{ borderTop: '1px solid rgba(124,111,255,0.1)' }}>
          <div className="flex gap-2 mt-2">
            <input
              className="flex-1 px-3 py-2 rounded-xl text-xs outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(124,111,255,0.2)', color: 'rgba(220,225,255,0.9)' }}
              placeholder="Type a message…"
              value={text}
              onChange={e => { setText(e.target.value); if (warning) setWarning(null); }}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
            />
            <button
              disabled={!text.trim()}
              onClick={handleSend}
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(124,111,255,0.25)', color: '#a5b4fc', opacity: text.trim() ? 1 : 0.5 }}>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}