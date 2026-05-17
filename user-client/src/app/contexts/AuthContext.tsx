import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, usersApi, setTokens, clearTokens, getAccessToken, type AuthUser } from '../services/api';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string; address?: string }) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from stored token on mount
  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      usersApi.getProfile()
        .then(setUser)
        .catch(() => clearTokens())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const { user: authUser, accessToken, refreshToken } = await authApi.login(email, password);
    setTokens(accessToken, refreshToken);
    setUser(authUser);
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string; address?: string }) => {
    const { user: authUser, accessToken, refreshToken } = await authApi.register(data);
    setTokens(accessToken, refreshToken);
    setUser(authUser);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore errors on logout
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

