import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home as HomeIcon, Info, Shield, LogOut, LogIn, MessageSquare, User } from 'lucide-react';
import MiniChat from '@/components/MiniChat';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AnimatePresence } from 'framer-motion';
import { useLang } from '@/i18n/LanguageContext';
import LanguageButton from '@/components/LanguageButton';

const NAV_ITEMS = [
  { path: '/', icon: HomeIcon, labelKey: 'nav.home' },
  { path: '/chat', icon: MessageSquare, labelKey: 'nav.messages' },
];
const ADMIN_ITEMS = [{ path: '/moderation', icon: Shield, labelKey: 'nav.moderation' }];

export default function Layout() {
  const { t } = useLang();
  const location = useLocation();
  const [miniChat, setMiniChat] = useState(null);

  useEffect(() => {
    const handler = (e) => setMiniChat(e.detail);
    window.addEventListener('openMiniChat', handler);
    return () => window.removeEventListener('openMiniChat', handler);
  }, []);

  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  // ── Time tracking ──────────────────────────────────────────────────────────
  const sessionStartRef = useRef(Date.now());

  useEffect(() => {
    if (!currentUser?.email) return;

    const flush = async () => {
      const elapsed = Math.round((Date.now() - sessionStartRef.current) / 60000);
      if (elapsed < 1) return;
      sessionStartRef.current = Date.now();

      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      const weekKey = (() => {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const week = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
        return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`;
      })();
      const monthKey = now.toISOString().slice(0, 7);

      const prev = await base44.auth.me();
      const newTotal = (prev.total_browsing_minutes || 0) + elapsed;

      const newDaily = prev.daily_minutes_date === todayStr
        ? (prev.daily_minutes || 0) + elapsed : elapsed;
      const newWeekly = prev.weekly_minutes_week === weekKey
        ? (prev.weekly_minutes || 0) + elapsed : elapsed;
      const newMonthly = prev.monthly_minutes_month === monthKey
        ? (prev.monthly_minutes || 0) + elapsed : elapsed;

      await base44.auth.updateMe({
        total_browsing_minutes: newTotal,
        daily_minutes: newDaily,
        daily_minutes_date: todayStr,
        weekly_minutes: newWeekly,
        weekly_minutes_week: weekKey,
        monthly_minutes: newMonthly,
        monthly_minutes_month: monthKey,
      });

      const { awardBadge } = await import('@/lib/badgeUtils');
      if (newDaily >= 45) awardBadge(prev.email, 'daily_listener', null);
      if (newWeekly >= 180) awardBadge(prev.email, 'weekly_devotee', null);
      if (newMonthly >= 1800) awardBadge(prev.email, 'monthly_obsessive', null);
      if (newTotal >= 600) awardBadge(prev.email, 'time_10h', null);
      if (newTotal >= 6000) awardBadge(prev.email, 'time_100h', null);
      if (newTotal >= 60000) awardBadge(prev.email, 'time_1000h', null);
    };

    const interval = setInterval(flush, 5 * 60 * 1000);
    const handleUnload = () => flush();
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [currentUser?.email]);

  const isAdmin = currentUser?.role === 'admin';
  const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const navLink = (path, labelKey) => {
    const active = isActive(path);
    return (
      <Link key={path} to={path} className="px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap" style={active ? { color: '#1a1815', borderBottom: '2px solid #bf7a35' } : { color: '#6b6358' }}>
        {t(labelKey)}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f3efe6' }}>
      {/* Top navigation — Bandcamp-style thin bar, no sidebar */}
      <header className="sticky top-0 z-30 flex items-center gap-3 px-5 h-14" style={{ background: 'rgba(243,239,230,0.92)', borderBottom: '1px solid rgba(26,24,21,0.1)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}>
        <Link to="/" className="font-playfair italic text-lg whitespace-nowrap shrink-0" style={{ color: '#1a1815', letterSpacing: '-0.01em' }}>
          Echo Between Notes
        </Link>
        <nav className="flex items-center gap-0.5 ml-1">
          {NAV_ITEMS.filter(item => item.path !== '/chat' || currentUser).map(item => navLink(item.path, item.labelKey))}
          {isAdmin && ADMIN_ITEMS.map(item => navLink(item.path, item.labelKey))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <LanguageButton />
          <Link to="/about" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors" style={{ color: '#6b6358', border: '1px solid rgba(26,24,21,0.14)' }}>
            <Info className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{t('nav.about')}</span>
          </Link>
          {currentUser ? (
            <>
              <button onClick={() => base44.auth.logout()} title={t('nav.logout')} className="w-9 h-9 rounded-full flex items-center justify-center transition-colors" style={{ color: '#6b6358', border: '1px solid rgba(26,24,21,0.14)' }}>
                <LogOut className="w-4 h-4" />
              </button>
              <Link to="/profile" className="flex items-center gap-2 px-2.5 py-1.5 rounded-full transition-colors" style={{ border: '1px solid rgba(26,24,21,0.14)' }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#1a1815', color: '#faf8f2' }}>
                  {(currentUser.full_name || currentUser.email || 'U')[0].toUpperCase()}
                </div>
                <span className="text-xs font-semibold hidden sm:inline max-w-[140px] truncate" style={{ color: '#1a1815' }}>
                  {currentUser.full_name || t('nav.myAccount')}
                </span>
              </Link>
            </>
          ) : (
            <button onClick={() => base44.auth.redirectToLogin()} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors" style={{ background: '#1a1815', color: '#faf8f2' }}>
              <LogIn className="w-3.5 h-3.5" /> {t('nav.login')}
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>

      <AnimatePresence>
        {miniChat && currentUser && (
          <MiniChat peer={miniChat} currentUser={currentUser} onClose={() => setMiniChat(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}