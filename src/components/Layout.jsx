import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Disc3, Users, User } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/discover', icon: Disc3, label: 'Discover' },
  { path: '/bands', icon: Users, label: 'Bands' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at 50% 0%, #0d1535 0%, #070910 55%, #020304 100%)' }}>
      {/* Top header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ background: 'rgba(5,7,18,0.88)', borderColor: 'rgba(124,111,255,0.15)' }}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span
              className="text-lg font-black tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #a5b4fc, #c084fc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.03em',
              }}
            >
              Music Critics
            </span>
          </Link>
          
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path || 
                (path !== '/' && location.pathname.startsWith(path));
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200`}
                  style={isActive
                    ? { background: 'rgba(124,111,255,0.18)', color: '#a5b4fc', boxShadow: '0 0 12px rgba(124,111,255,0.25)' }
                    : { color: 'rgba(160,175,220,0.6)' }
                  }
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 pt-0 pb-24 md:pb-6">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl border-t" style={{ background: 'rgba(5,7,18,0.95)', borderColor: 'rgba(124,111,255,0.15)' }}>
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path ||
              (path !== '/' && location.pathname.startsWith(path));
            return (
              <Link
                key={path}
                to={path}
                className="flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-all duration-200"
              style={isActive ? { color: '#a5b4fc' } : { color: 'rgba(140,155,210,0.5)' }}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}