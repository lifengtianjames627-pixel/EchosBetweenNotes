import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { LanguageProvider } from '@/i18n/LanguageContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from '@/components/Layout.jsx';
import Home from '@/pages/Home';
import WrittenReviews from '@/pages/WrittenReviews';
import Podcasts from '@/pages/Podcasts';
import AlbumDetail from '@/pages/AlbumDetail';
import GenreSpace from '@/pages/GenreSpace';
import Profile from '@/pages/Profile';
import About from '@/pages/About';
import ModerationQueue from '@/pages/ModerationQueue';
import BandDashboard from '@/pages/BandDashboard';
import DirectChat from '@/pages/DirectChat';
import SoulmateBoard from '@/pages/SoulmateBoard';
import UserProfile from '@/pages/UserProfile';
import RequireAuth from '@/components/RequireAuth';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/reviews" element={<WrittenReviews />} />
        <Route path="/podcasts" element={<Podcasts />} />
        <Route path="/genre/:genreId" element={<GenreSpace />} />
        <Route path="/album/:id" element={<AlbumDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/u/:email" element={<RequireAuth><UserProfile /></RequireAuth>} />
        <Route path="/moderation" element={<RequireAuth><ModerationQueue /></RequireAuth>} />
        <Route path="/band-dashboard" element={<RequireAuth><BandDashboard /></RequireAuth>} />
        <Route path="/chat" element={<RequireAuth><DirectChat /></RequireAuth>} />
        <Route path="/soulmate" element={<RequireAuth><SoulmateBoard /></RequireAuth>} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
      </LanguageProvider>
    </AuthProvider>
  )
}

export default App