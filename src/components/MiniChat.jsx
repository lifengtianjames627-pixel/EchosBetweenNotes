import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, UserPlus, MessageSquare } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const MAX_MESSAGES = 5;

function makeChatId(a, b) {
  return [a, b].sort().join('|');
}

export default function MiniChat({ peer, currentUser, onClose }) {
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const [friendSent, setFriendSent] = useState(false);
  const bottomRef = useRef(null);

  const chatId = currentUser?.email && peer?.email
    ? makeChatId(currentUser.email, peer.email)
    : null;

  const { data: messages = [] } = useQuery({
    queryKey: ['mini-chat', chatId],
    queryFn: () => base44.entities.ChatMessage.filter({ chat_id: chatId }, 'created_date', 20),
    enabled: !!chatId,
    refetchInterval: 3000,
  });

  const myMessages = messages.filter(m => m.sender_email === currentUser?.email);
  const limitReached = myMessages.length >= MAX_MESSAGES;

  // Check existing friend request
  const { data: existingReqs = [] } = useQuery({
    queryKey: ['friend-check', currentUser?.email, peer?.email],
    queryFn: () => base44.entities.FriendRequest.filter({ from_email: currentUser.email, to_email: peer.email }),
    enabled: !!currentUser?.email && !!peer?.email,
  });
  const alreadySentRequest = existingReqs.length > 0 || friendSent;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const sendMessage = useMutation({
    mutationFn: (content) => base44.entities.ChatMessage.create({
      chat_id: chatId,
      sender_email: currentUser.email,
      sender_name: currentUser.full_name || currentUser.email,
      content,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mini-chat', chatId] });
      setText('');
    },
  });

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
        height: 420,
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
            Temporary chat · {MAX_MESSAGES - myMessages.length} messages left
          </p>
        </div>
        <button onClick={onClose} style={{ color: 'rgba(140,155,210,0.5)' }}>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <MessageSquare className="w-8 h-8" style={{ color: 'rgba(124,111,255,0.3)' }} />
            <p className="text-xs text-center" style={{ color: 'rgba(140,155,210,0.45)' }}>
              Start a conversation!<br />You have {MAX_MESSAGES} messages to make a connection.
            </p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_email === currentUser.email;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed"
                style={{
                  background: isMe ? 'rgba(124,111,255,0.25)' : 'rgba(255,255,255,0.06)',
                  color: isMe ? '#c4baff' : 'rgba(200,210,240,0.85)',
                  border: `1px solid ${isMe ? 'rgba(124,111,255,0.35)' : 'rgba(255,255,255,0.08)'}`,
                }}>
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

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
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && text.trim() && !sendMessage.isPending) sendMessage.mutate(text.trim()); }}
            />
            <button
              disabled={!text.trim() || sendMessage.isPending}
              onClick={() => text.trim() && sendMessage.mutate(text.trim())}
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(124,111,255,0.25)', color: '#a5b4fc' }}>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}