import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, User, Info, Shield, LogOut, LogIn, ChevronLeft, ChevronRight, Music2, MessageSquare, Menu, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';
import MiniChat from '@/components/MiniChat';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '@/i18n/LanguageContext';
import LanguageButton from '@/components/LanguageButton';

const NAV_ITEMS = [
  { path: '/', icon: Home, labelKey: 'nav.home' },
  { path: '/chat', icon: MessageSquare, labelKey: 'nav.messages' },
];

const ADMIN_ITEMS = [
  { path: '/moderation', icon: Shield, labelKey: 'nav.moderation' },
];

export default function Layout() {
  const { t } = useLang();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [miniChat, setMiniChat] = useState(null); // { email, name }
  // On phones the sidebar becomes a slide-over drawer, so pages get the whole width.
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

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
      const elapsed = Math.round((Date.now() - sessionStartRef.current) / 60000); // minutes
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

      // Import dynamically to avoid circular issues
      const { awardBadge } = await import('@/lib/badgeUtils');
      if (newDaily >= 45) awardBadge(prev.email, 'daily_listener', null);
      if (newWeekly >= 180) awardBadge(prev.email, 'weekly_devotee', null);
      if (newMonthly >= 1800) awardBadge(prev.email, 'monthly_obsessive', null);
      if (newTotal >= 600) awardBadge(prev.email, 'time_10h', null);
      if (newTotal >= 6000) awardBadge(prev.email, 'time_100h', null);
      if (newTotal >= 60000) awardBadge(prev.email, 'time_1000h', null);
    };

    const interval = setInterval(flush, 5 * 60 * 1000); // flush every 5 min
    const handleUnload = () => flush();
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [currentUser?.email]);

  const isAdmin = currentUser?.role === 'admin';

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const NavLink = ({ path, icon: Icon, labelKey }) => {
    const active = isActive(path);
    const label = t(labelKey);
    return (
      <Link
        to={path}
        title={collapsed ? label : undefined}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative"
        style={active
          ? { background: 'rgba(124,111,255,0.18)', color: '#a5b4fc', boxShadow: '0 0 12px rgba(124,111,255,0.2)' }
          : { color: 'rgba(160,175,220,0.55)' }
        }
      >
        <Icon className="w-4 h-4 shrink-0" style={active ? { filter: 'drop-shadow(0 0 6px rgba(165,138,252,0.7))' } : {}} />
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden whitespace-nowrap"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
        {collapsed && (
          <div
            className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap"
            style={{ background: 'rgba(15,18,40,0.95)', color: '#a5b4fc', border: '1px solid rgba(124,111,255,0.25)', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}
          >
            {label}
          </div>
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'radial-gradient(ellipse at 50% 0%, #0d1535 0%, #070910 55%, #020304 100%)' }}>

      {/* Drawer backdrop (phones only) */}
      <AnimatePresence>
        {isMobile && drawerOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.6)' }}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar (fixed rail on desktop, slide-over drawer on phones) ── */}
      <motion.aside
        animate={isMobile
          ? { width: 240, x: drawerOpen ? 0 : -260 }
          : { width: collapsed ? 64 : 220, x: 0 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        className="fixed top-0 left-0 h-full z-50 flex flex-col overflow-hidden"
        style={{
          background: 'rgba(5,7,20,0.92)',
          borderRight: '1px solid rgba(124,111,255,0.12)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-3 h-16 shrink-0" style={{ borderBottom: '1px solid rgba(124,111,255,0.1)' }}>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(124,111,255,0.3), rgba(192,132,252,0.3))', border: '1px solid rgba(124,111,255,0.35)' }}
          >
            <Music2 className="w-4 h-4" style={{ color: '#a5b4fc' }} />
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="font-playfair italic text-base whitespace-nowrap"
                style={{
                  background: 'linear-gradient(135deg, #a5b4fc, #c084fc)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-0.01em',
                }}
              >
                Echo Between Notes
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 pt-4 space-y-1 overflow-y-auto overflow-x-hidden">
          {NAV_ITEMS.map(item => <NavLink key={item.path} {...item} />)}

          {isAdmin && (
            <>
              <div className="pt-4 pb-1 px-3">
                <AnimatePresence initial={false}>
                  {!collapsed ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-[10px] uppercase tracking-widest font-bold"
                      style={{ color: 'rgba(124,111,255,0.45)' }}
                    >
                      {t('nav.admin')}
                    </motion.p>
                  ) : (
                    <div className="h-px w-full" style={{ background: 'rgba(124,111,255,0.15)' }} />
                  )}
                </AnimatePresence>
              </div>
              {ADMIN_ITEMS.map(item => <NavLink key={item.path} {...item} />)}
            </>
          )}
        </nav>

        {/* User + logout */}
        <div className="px-2 pb-4 space-y-1 shrink-0" style={{ borderTop: '1px solid rgba(124,111,255,0.1)', paddingTop: 12 }}>
          {currentUser ? (
            <>
              <div
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl overflow-hidden"
                style={{ background: 'rgba(124,111,255,0.08)' }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, rgba(124,111,255,0.4), rgba(192,132,252,0.4))', color: '#c4baff' }}
                >
                  {(currentUser.full_name || currentUser.email || 'U')[0].toUpperCase()}
                </div>
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="overflow-hidden min-w-0"
                    >
                      <p className="text-xs font-semibold truncate whitespace-nowrap" style={{ color: '#c4baff' }}>
                        {currentUser.full_name || 'User'}
                      </p>
                      <p className="text-[10px] truncate whitespace-nowrap" style={{ color: 'rgba(160,175,220,0.4)' }}>
                        {currentUser.email}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => base44.auth.logout()}
                title={collapsed ? t('nav.logout') : undefined}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative"
                style={{ color: 'rgba(248,113,113,0.6)' }}
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {t('nav.logout')}
                    </motion.span>
                  )}
                </AnimatePresence>
                {collapsed && (
                  <div
                    className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap"
                    style={{ background: 'rgba(15,18,40,0.95)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}
                  >
                    {t('nav.logout')}
                  </div>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => base44.auth.redirectToLogin()}
              title={collapsed ? t('nav.login') : undefined}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={{ background: 'rgba(124,111,255,0.15)', color: '#a5b4fc', border: '1px solid rgba(124,111,255,0.25)' }}
            >
              <LogIn className="w-4 h-4 shrink-0" />
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {t('nav.login')}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          )}
        </div>

        {/* Collapse toggle — desktop only; phones close the drawer from the top bar */}
        {!isMobile && (
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3 top-[72px] w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          style={{ background: 'rgba(15,18,40,0.98)', border: '1px solid rgba(124,111,255,0.3)', color: '#a5b4fc', boxShadow: '0 0 10px rgba(124,111,255,0.2)' }}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
        )}
      </motion.aside>

      {/* ── Main content ── */}
      <motion.div
        animate={{ marginLeft: isMobile ? 0 : collapsed ? 64 : 220 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        className="flex-1 min-w-0 min-h-screen"
      >
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex items-center justify-end gap-2 px-3 sm:px-5 h-12"
          style={{ background: 'rgba(5,7,20,0.85)', borderBottom: '1px solid rgba(124,111,255,0.1)', backdropFilter: 'blur(16px)' }}>
          {isMobile && (
            <button
              onClick={() => setDrawerOpen(o => !o)}
              aria-label="Menu"
              className="mr-auto w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(124,111,255,0.12)', border: '1px solid rgba(124,111,255,0.25)', color: '#a5b4fc' }}
            >
              {drawerOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          )}
          <LanguageButton />
          <Link
            to="/about"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105"
            style={{ color: 'rgba(160,175,220,0.6)', border: '1px solid rgba(124,111,255,0.15)' }}
          >
            <Info className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{t('nav.about')}</span>
          </Link>
          {currentUser ? (
            <Link
              to="/profile"
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-full transition-all hover:scale-105"
              style={{ background: 'rgba(124,111,255,0.1)', border: '1px solid rgba(124,111,255,0.25)' }}
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, rgba(124,111,255,0.4), rgba(192,132,252,0.4))', color: '#c4baff' }}>
                {(currentUser.full_name || currentUser.email || 'U')[0].toUpperCase()}
              </div>
              <span className="text-xs font-semibold hidden sm:inline max-w-[140px] truncate" style={{ color: '#a5b4fc' }}>
                {currentUser.full_name || t('nav.myAccount')}
              </span>
              <User className="w-3.5 h-3.5" style={{ color: '#a5b4fc' }} />
            </Link>
          ) : (
            <button
              onClick={() => base44.auth.redirectToLogin()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(124,111,255,0.15)', color: '#a5b4fc', border: '1px solid rgba(124,111,255,0.25)' }}
            >
              <LogIn className="w-3.5 h-3.5" /> {t('nav.login')}
            </button>
          )}
        </div>
        <main>
          <Outlet />
        </main>
      </motion.div>

      {/* Mini Chat popup */}
      <AnimatePresence>
        {miniChat && currentUser && (
          <MiniChat
            peer={miniChat}
            currentUser={currentUser}
            onClose={() => setMiniChat(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}