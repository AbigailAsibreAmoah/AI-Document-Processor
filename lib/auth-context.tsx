'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name?: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Module-level cache — persists across navigation, resets after 5 minutes
let cachedUser: User | null = null;
let cacheTime: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(cachedUser);
  const [loading, setLoading] = useState(!cachedUser);

  useEffect(() => {
    const now = Date.now();

    // If cache is fresh, skip the API call entirely
    if (cachedUser && now - cacheTime < CACHE_TTL) {
      setUser(cachedUser);
      setLoading(false);
      return;
    }

    const verifyUser = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        cachedUser = null;
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          localStorage.removeItem('token');
          cachedUser = null;
          setLoading(false);
          return;
        }

        const data = await res.json();

        if (data.success) {
          cachedUser = data.user;
          cacheTime = Date.now();
          setUser(data.user);
        } else {
          localStorage.removeItem('token');
          cachedUser = null;
        }
      } catch {
        localStorage.removeItem('token');
        cachedUser = null;
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) return false;

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('token', data.data.token);
        cachedUser = data.data.user;
        cacheTime = Date.now();
        setUser(data.data.user);
        return true;
      }

      return false;
    } catch {
      return false;
    }
  };

  const register = async (email: string, password: string, name?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      return data.success;
    } catch {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    cachedUser = null;
    cacheTime = 0;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};