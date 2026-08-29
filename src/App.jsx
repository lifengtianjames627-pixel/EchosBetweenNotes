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
import PodcastSpace from '@/pages/PodcastSpace';
import AlbumDetail from '@/pages/AlbumDetail';
import GenreSpace from '@/pages/GenreSpace';
import Profile from '@/pages/Profile';
import About from '@/pages/About';
import ModerationQueue from '@/pages/ModerationQueue';
import BandDashboard from '@/pages/BandDashboard';
import DirectChat from '@/pages/DirectChat';
import SoulmateBoard from '@/pages/SoulmateBoard';
import UserProfile from '@/pages/UserProfile';
import ProfileSetup from '@/pages/ProfileSetup';
import RequireAuth from '@/components/RequireAuth';
import ProfileSetupGate from '@/components/ProfileSetupGate';

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
        <Route path="/podcasts/:categoryId" element={<RequireAuth><ProfileSetupGate><PodcastSpace /></ProfileSetupGate></RequireAuth>} />
        <Route path="/genre/:genreId" element={<RequireAuth><ProfileSetupGate><GenreSpace /></ProfileSetupGate></RequireAuth>} />
        <Route path="/album/:id" element={<RequireAuth><ProfileSetupGate><AlbumDetail /></ProfileSetupGate></RequireAuth>} />
        <Route path="/about" element={<About />} />
        <Route path="/profile/setup" element={<RequireAuth><ProfileSetupGate allowSetup><ProfileSetup /></ProfileSetupGate></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><ProfileSetupGate><Profile /></ProfileSetupGate></RequireAuth>} />
        <Route path="/u/:email" element={<RequireAuth><ProfileSetupGate><UserProfile /></ProfileSetupGate></RequireAuth>} />
        <Route path="/moderation" element={<RequireAuth><ProfileSetupGate><ModerationQueue /></ProfileSetupGate></RequireAuth>} />
        <Route path="/band-dashboard" element={<RequireAuth><ProfileSetupGate><BandDashboard /></ProfileSetupGate></RequireAuth>} />
        <Route path="/chat" element={<RequireAuth><ProfileSetupGate><DirectChat /></ProfileSetupGate></RequireAuth>} />
        <Route path="/soulmate" element={<RequireAuth><ProfileSetupGate><SoulmateBoard /></ProfileSetupGate></RequireAuth>} />
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