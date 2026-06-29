// filepath: frontend/src/hooks/use-auth.js
import { useAuthContext } from '../contexts/auth-context';

export function useAuth() {
  const context = useAuthContext();
  if (!context) {
    return {
      user: null,
      loading: false,
      isAuthenticated: false,
      login: async () => {
        throw new Error('AuthProvider is missing.');
      },
      signup: async () => {
        throw new Error('AuthProvider is missing.');
      },
      logout: async () => {}
    };
  }
  return context;
}
