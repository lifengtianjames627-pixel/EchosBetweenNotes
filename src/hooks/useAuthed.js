import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';

// Shared gate for viewer/user/admin tiering. `authed` is true only for a
// logged-in user; `login` sends a viewer to the platform login and back here.
export function useAuthed() {
  const { isAuthenticated } = useAuth();
  return {
    authed: !!isAuthenticated,
    login: () => base44.auth.redirectToLogin(window.location.pathname + window.location.search),
  };
}