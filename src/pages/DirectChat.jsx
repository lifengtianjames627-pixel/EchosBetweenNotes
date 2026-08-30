import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, MessageSquare, ShieldAlert, Clock, PanelLeftOpen } from 'lucide-react';
import ConversationSidebar from '@/components/chat/ConversationSidebar';
import MessageComposer from '@/components/chat/MessageComposer';
import MessageAttachment from '@/components/chat/MessageAttachment';
import { useChat, makeChatId } from '@/lib/useChat';
import { findContactInfo } from '@/lib/contactFilter';
import ReportButton from '@/components/soulmate/ReportButton';
import PinnedPeople from '@/components/chat/PinnedPeople';
import RecentConversations from '@/components/chat/RecentConversations';
import PeopleAround from '@/components/chat/PeopleAround';
import { usePins } from '@/components/chat/usePins';
import { useLang } from '@/i18n/LanguageContext';

// Paper palette — same language as Written Reviews. Shared with the chat
// subcomponents through the `V` prop.
const V = {
  bg: '#f3efe6',
  card: '#faf8f2',
  border: '#e0d8c8',
  accent: '#bf7a35',
  text: '#1a1815',
  muted: '#6b6358',
};

export default function DirectChat() {
  const navigate = useNavigate();
  const { t } = useLang();
  const params = new URLSearchParams(window.location.search);
  const peerEmail = params.get('with');
  const peerName = params.get('name') || peerEmail;
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [warning, setWarning] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef = useRef(null);

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  const chatId = user?.email && peerEmail ? makeChatId(user.email, peerEmail) : null;
  const { messages, send } = useChat({ chatId, currentUser: user, limit: 200 });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Opening Messages marks all current messages as seen — drives the unread
  // badge in the top nav back to zero.
  useEffect(() => {
    if (user?.email) {
      base44.auth.updateMe({ messages_last_seen: new Date().toISOString() }).catch(() => {});
    }
  }, [user?.email]);

  // Contact details stay out of chat — in-app messages are logged and reportable.
  // Returns false when the message was blocked so the composer keeps its draft.
  const handleSend = (payload) => {
    if (!chatId) return false;
    const contact = findContactInfo(payload.content || '');
    if (contact.length > 0) {
      setWarning(t('chat.keepWarning', { items: contact.join(', ') }));
      return false;
    }
    setWarning(null);
    setText('');
    send.mutate(payload);
    return true;
  };

  const { data: searchResults = [] } = useQuery({
    queryKey: ['user-search', search],
    queryFn: () => base44.entities.User.list(),
    enabled: search.length >= 1,
    select: (users) => {
      const q = search.toLowerCase();
      return users
        .filter(u => u.email !== user?.email)
        .filter(u => u.email?.toLowerCase().includes(q) || u.full_name?.toLowerCase().includes(q))
        .slice(0, 8);
    },
  });

  const { pins, isPinned, toggle } = usePins(user);

  const { data: directory, isLoading: directoryLoading } = useQuery({
    queryKey: ['chat-directory'],
    queryFn: async () => (await base44.functions.invoke('chatDirectory', {})).data,
    enabled: !!user,
    refetchInterval: 60000, // keeps online/offline dots fresh
  });

  const openChat = (email, name) =>
    navigate(`/chat?with=${encodeURIComponent(email)}&name=${encodeURIComponent(name || email)}`);

  if (!user) return null;

  // No peer selected — show search landing
  if (!peerEmail) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: V.bg }}>
        <div className="px-5 py-4 sticky top-0 z-10"
          style={{ background: '#e6ddc9', borderBottom: `1px solid ${V.border}` }}>
          <p className="font-playfair italic text-lg" style={{ color: V.text }}>{t('chat.title')}</p>
          <p className="text-xs mt-0.5" style={{ color: V.muted }}>{t('chat.subtitle')}</p>
        </div>
        {/* Two-column reading room — bordered side column for finding people,
            wider centre column for the board around you. */}
        <div className="flex-1 w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[320px_1fr]">
          <aside className="px-5 pt-6 pb-10 md:pb-16 md:border-r" style={{ borderColor: V.border }}>
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: V.muted }} />
              <input
                autoFocus
                className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm outline-none"
                style={{ background: '#ffffff', border: `1px solid ${V.border}`, color: V.text }}
                placeholder={t('chat.searchPlaceholder')}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {/* Results */}
            {search.length >= 1 && (
              <div className="mt-3 space-y-1">
                {searchResults.length === 0 ? (
                  <p className="text-sm text-center py-6" style={{ color: V.muted }}>{t('chat.noUsers')}</p>
                ) : (
                  searchResults.map(u => (
                    <button
                      key={u.id}
                      onClick={() => openChat(u.email, u.full_name || u.email)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-colors"
                      style={{ background: V.card, border: `1px solid ${V.border}` }}
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                        style={{ background: '#f1ebdd', color: '#8a5a20' }}>
                        {(u.full_name || u.email || '?')[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate" style={{ color: V.text }}>{u.full_name || u.email}</p>
                        <p className="text-xs truncate" style={{ color: V.muted }}>{u.email}</p>
                      </div>
                      <MessageSquare className="w-4 h-4 ml-auto shrink-0" style={{ color: V.muted }} />
                    </button>
                  ))
                )}
              </div>
            )}

            {search.length === 0 && (
              <>
                <PinnedPeople
                  V={V}
                  pins={pins}
                  isPinned={isPinned}
                  onTogglePin={(p) => toggle.mutate(p)}
                  onOpen={openChat}
                />
                <RecentConversations
                  V={V}
                  conversations={directory?.conversations || []}
                  loading={directoryLoading}
                  isPinned={isPinned}
                  onTogglePin={(p) => toggle.mutate(p)}
                  onOpen={openChat}
                />
              </>
            )}
          </aside>

          <section className="px-5 pt-6 pb-16">
            <PeopleAround
              V={V}
              nearby={directory?.nearby || []}
              loading={directoryLoading}
              city={directory?.my_city}
              matchedCity={directory?.matched_city}
              located={directory?.located}
              myLat={directory?.my_lat}
              myLng={directory?.my_lng}
              isPinned={isPinned}
              onTogglePin={(p) => toggle.mutate(p)}
              onOpen={openChat}
            />
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="flex" style={{ background: V.bg, height: 'calc(100vh - 3.5rem)' }}>
      {/* Collapsible conversations panel — the chat itself keeps ~3/4 of the width */}
      {sidebarOpen && (
        <ConversationSidebar
          V={V}
          conversations={directory?.conversations || []}
          activeEmail={peerEmail}
          onOpen={openChat}
          onCollapse={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 min-w-0 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 shrink-0"
        style={{ background: '#e6ddc9', borderBottom: `1px solid ${V.border}` }}>
        {!sidebarOpen && (
          <button onClick={() => setSidebarOpen(true)} title="Show conversations" className="hidden md:block" style={{ color: V.muted }}>
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        )}
        <button onClick={() => navigate('/chat')} style={{ color: V.muted }}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ background: '#f1ebdd', color: '#8a5a20' }}>
          {(peerName || '?')[0].toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm truncate" style={{ color: V.text }}>{peerName}</p>
          <p className="text-xs truncate" style={{ color: V.muted }}>{peerEmail}</p>
        </div>
        <ReportButton
          targetType="chat_message"
          targetId={chatId}
          targetSummary={messages.slice(-8).map(m => `${m.sender_name}: ${m.content}`).join('\n')}
          targetAuthorEmail={peerEmail}
          currentUser={user}
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-10">
            <p className="text-sm" style={{ color: V.muted }}>{t('chat.noMessages')}</p>
            <p className="text-xs mt-2" style={{ color: '#8a7e6f' }}>
              {t('chat.noContactHint')}
            </p>
          </div>
        )}
        {messages.map(msg => {
          const isMe = msg.sender_email === user.email;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[70%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap flex flex-col gap-1"
                style={{
                  ...(isMe
                    ? { background: '#f1ebdd', border: '1px solid #ddd0b6' }
                    : { background: V.card, border: `1px solid ${V.border}` }),
                  color: V.text,
                  opacity: msg._pending ? 0.6 : 1,
                }}>
                <span className="flex items-end gap-2">
                  <span>{msg.content}</span>
                  {msg._pending && <Clock className="w-3 h-3 shrink-0 mb-0.5 opacity-70" />}
                </span>
                <MessageAttachment V={V} url={msg.attachment_url} name={msg.attachment_name} kind={msg.attachment_kind} />
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
            className="overflow-hidden shrink-0 px-5"
          >
            <div className="flex gap-2.5 rounded-2xl p-3 mb-1"
              style={{ background: '#f6efe1', border: '1px solid #ddd0b6' }}>
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#a0522d' }} />
              <p className="text-xs leading-relaxed" style={{ color: '#8a5a20' }}>{warning}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Composer — multi-line, emoji + image/PDF attachments, character count */}
      <MessageComposer
        V={V}
        value={text}
        onChange={(v) => { setText(v); if (warning) setWarning(null); }}
        onSend={handleSend}
        placeholder={t('chat.typeMessage')}
      />
      </div>
    </div>
  );
}