import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft } from 'lucide-react';

const V = {
  bg: 'radial-gradient(ellipse at 50% 0%, #0d1535 0%, #070910 55%, #020304 100%)',
  card: 'rgba(12,15,35,0.85)',
  border: 'rgba(124,111,255,0.18)',
  accent: '#a5b4fc',
  text: 'rgba(220,225,255,0.9)',
  muted: 'rgba(140,155,210,0.55)',
};

function makeChatId(a, b) {
  return [a, b].sort().join('|');
}

export default function DirectChat() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const peerEmail = params.get('with');
  const peerName = params.get('name') || peerEmail;
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  const chatId = user?.email ? makeChatId(user.email, peerEmail) : null;

  const { data: messages = [] } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => base44.entities.ChatMessage.filter({ chat_id: chatId }, 'created_date', 200),
    enabled: !!chatId,
    refetchInterval: 3000,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const sendMessage = async () => {
    if (!text.trim() || !chatId) return;
    const content = text.trim();
    setText('');
    await base44.entities.ChatMessage.create({
      chat_id: chatId,
      sender_email: user.email,
      sender_name: user.full_name || user.email,
      content,
    });
    queryClient.invalidateQueries({ queryKey: ['chat', chatId] });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: V.bg }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 sticky top-0 z-10"
        style={{ background: 'rgba(5,7,20,0.9)', borderBottom: `1px solid ${V.border}`, backdropFilter: 'blur(12px)' }}>
        <button onClick={() => navigate('/profile')} style={{ color: V.muted }}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ background: 'rgba(124,111,255,0.2)', color: V.accent }}>
          {(peerName || '?')[0].toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: V.text }}>{peerName}</p>
          <p className="text-xs" style={{ color: V.muted }}>{peerEmail}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-sm py-10" style={{ color: V.muted }}>
            No messages yet. Say hi! 👋
          </p>
        )}
        {messages.map(msg => {
          const isMe = msg.sender_email === user.email;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[70%] px-4 py-2.5 rounded-2xl text-sm"
                style={isMe
                  ? { background: 'rgba(124,111,255,0.25)', color: V.text, border: '1px solid rgba(124,111,255,0.3)' }
                  : { background: 'rgba(255,255,255,0.06)', color: V.text, border: `1px solid ${V.border}` }
                }>
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-5 py-4 flex gap-3"
        style={{ borderTop: `1px solid ${V.border}`, background: 'rgba(5,7,20,0.9)', backdropFilter: 'blur(12px)' }}>
        <input
          className="flex-1 px-4 py-2.5 rounded-full text-sm outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${V.border}`, color: V.text }}
          placeholder="Type a message…"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
        />
        <button
          onClick={sendMessage}
          disabled={!text.trim()}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(124,111,255,0.25)', color: V.accent, border: '1px solid rgba(124,111,255,0.4)' }}>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}