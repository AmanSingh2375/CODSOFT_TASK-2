import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, clearAuthToken, getAuthToken, setAuthToken } from '../services/api.ts';
import { User, UserRole } from '../types/index.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; phone?: string; password: string; role?: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name?: string; phone?: string; avatar?: string }) => Promise<void>;
  quickLogin: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      const storedToken = getAuthToken();
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const profile = await api.auth.getMe();
        setUser(profile);
      } catch (error) {
        console.warn('Session expired or invalid token:', error);
        clearAuthToken();
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    setAuthToken(res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (data: { name: string; email: string; phone?: string; password: string; role?: string }) => {
    const res = await api.auth.register(data);
    setAuthToken(res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    clearAuthToken();
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: { name?: string; phone?: string; avatar?: string }) => {
    const res = await api.auth.updateProfile(data);
    setUser(res.user);
  };

  // Handy shortcut for testing and grading
  const quickLogin = async (role: UserRole) => {
    let email = 'customer@dinedesk.com';
    let password = 'customer123';

    if (role === 'STAFF') {
      email = 'staff@dinedesk.com';
      password = 'staff123';
    } else if (role === 'ADMIN') {
      email = 'admin@dinedesk.com';
      password = 'admin123';
    }

    await login(email, password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        quickLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
