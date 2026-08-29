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
          ? { background: 'rgba(176,101,71,0.14)', color: '#b06547' }
          : { color: '#6b6358' }
        }
      >
        <Icon className="w-4 h-4 shrink-0" />
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
            style={{ background: '#fbf8f2', color: '#2b2620', border: '1px solid rgba(176,101,71,0.2)', boxShadow: '0 4px 18px rgba(120,100,80,0.14)' }}
          >
            {label}
          </div>
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(180deg, #f7f3ec 0%, #efe9dd 100%)' }}>

      {/* Drawer backdrop (phones only) */}
      <AnimatePresence>
        {isMobile && drawerOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(80,68,56,0.28)' }}
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
          background: 'rgba(247,243,236,0.94)',
          borderRight: '1px solid rgba(176,101,71,0.16)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-3 h-16 shrink-0" style={{ borderBottom: '1px solid rgba(176,101,71,0.12)' }}>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'rgba(176,101,71,0.14)', border: '1px solid rgba(176,101,71,0.3)' }}
          >
            <Music2 className="w-4 h-4" style={{ color: '#b06547' }} />
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="font-playfair italic text-base whitespace-nowrap"
                style={{ color: '#2b2620', letterSpacing: '-0.01em' }}
              >
                Echo Between Notes
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 pt-4 space-y-1 overflow-y-auto overflow-x-hidden">
          {NAV_ITEMS.filter(item => item.path !== '/chat' || currentUser).map(item => <NavLink key={item.path} {...item} />)}

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
                      style={{ color: '#9a8e7e' }}
                    >
                      {t('nav.admin')}
                    </motion.p>
                  ) : (
                    <div className="h-px w-full" style={{ background: 'rgba(176,101,71,0.18)' }} />
                  )}
                </AnimatePresence>
              </div>
              {ADMIN_ITEMS.map(item => <NavLink key={item.path} {...item} />)}
            </>
          )}
        </nav>

        {/* User + logout */}
        <div className="px-2 pb-4 space-y-1 shrink-0" style={{ borderTop: '1px solid rgba(176,101,71,0.12)', paddingTop: 12 }}>
          {currentUser ? (
            <>
              <div
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl overflow-hidden"
                style={{ background: 'rgba(176,101,71,0.08)' }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                  style={{ background: 'rgba(176,101,71,0.22)', color: '#b06547' }}
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
                      <p className="text-xs font-semibold truncate whitespace-nowrap" style={{ color: '#2b2620' }}>
                        {currentUser.full_name || 'User'}
                      </p>
                      <p className="text-[10px] truncate whitespace-nowrap" style={{ color: '#8a7e6f' }}>
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
                style={{ color: '#a85a4a' }}
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
                    style={{ background: '#fbf8f2', color: '#a85a4a', border: '1px solid rgba(168,90,74,0.22)' }}
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
              style={{ background: 'rgba(176,101,71,0.14)', color: '#b06547', border: '1px solid rgba(176,101,71,0.25)' }}
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
          style={{ background: '#fbf8f2', border: '1px solid rgba(176,101,71,0.3)', color: '#b06547' }}
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
          style={{ background: 'rgba(247,243,236,0.82)', borderBottom: '1px solid rgba(176,101,71,0.12)', backdropFilter: 'blur(16px)' }}>
          {isMobile && (
            <button
              onClick={() => setDrawerOpen(o => !o)}
              aria-label="Menu"
              className="mr-auto w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(176,101,71,0.12)', border: '1px solid rgba(176,101,71,0.25)', color: '#b06547' }}
            >
              {drawerOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          )}
          <LanguageButton />
          <Link
            to="/about"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105"
            style={{ color: '#6b6358', border: '1px solid rgba(176,101,71,0.18)' }}
          >
            <Info className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{t('nav.about')}</span>
          </Link>
          {currentUser ? (
            <Link
              to="/profile"
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-full transition-all hover:scale-105"
              style={{ background: 'rgba(176,101,71,0.1)', border: '1px solid rgba(176,101,71,0.22)' }}
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'rgba(176,101,71,0.22)', color: '#b06547' }}>
                {(currentUser.full_name || currentUser.email || 'U')[0].toUpperCase()}
              </div>
              <span className="text-xs font-semibold hidden sm:inline max-w-[140px] truncate" style={{ color: '#2b2620' }}>
                {currentUser.full_name || t('nav.myAccount')}
              </span>
              <User className="w-3.5 h-3.5" style={{ color: '#b06547' }} />
            </Link>
          ) : (
            <button
              onClick={() => base44.auth.redirectToLogin()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(176,101,71,0.14)', color: '#b06547', border: '1px solid rgba(176,101,71,0.25)' }}
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