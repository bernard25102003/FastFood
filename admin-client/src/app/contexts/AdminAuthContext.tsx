import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, setTokens, clearTokens, getAccessToken, type AdminUser } from '../services/api';

interface AdminAuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      authApi.getProfile()
        .then(u => {
          if (u.role === 'ADMIN') {
            setUser(u);
          } else {
            clearTokens();
          }
        })
        .catch(() => clearTokens())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const { user: authUser, accessToken, refreshToken } = await authApi.login(email, password);
    if (authUser.role !== 'ADMIN') {
      throw new Error('Tài khoản không có quyền admin');
    }
    setTokens(accessToken, refreshToken);
    setUser(authUser);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  return (
    <AdminAuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'ADMIN',
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
