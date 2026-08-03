import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, setToken, getToken } from '../api/client';

type User = {
  user_id: string;
  email: string;
  name?: string;
  picture?: string | null;
};

type Ctx = {
  user: User | null;
  loading: boolean;
  isPremium: boolean;
  setPremium: (v: boolean) => void;
  refresh: () => Promise<void>;
  loginEmail: (email: string, password: string) => Promise<void>;
  registerEmail: (email: string, password: string, name?: string) => Promise<void>;
  loginWithSession: (session_id: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const t = await getToken();
      if (!t) {
        setUser(null);
        return;
      }
      const r = await api<{ user: User }>('/auth/me');
      setUser(r.user);
    } catch {
      await setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const loginEmail = useCallback(async (email: string, password: string) => {
    const r = await api<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    await setToken(r.token);
    setUser(r.user);
  }, []);

  const registerEmail = useCallback(async (email: string, password: string, name?: string) => {
    const r = await api<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    await setToken(r.token);
    setUser(r.user);
  }, []);

  const loginWithSession = useCallback(async (session_id: string) => {
    const r = await api<{ session_token: string; user: User }>('/auth/session', {
      method: 'POST',
      body: JSON.stringify({ session_id }),
    });
    await setToken(r.session_token);
    setUser(r.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch {}
    await setToken(null);
    setUser(null);
    setIsPremium(false);
  }, []);

  return (
    <AuthCtx.Provider
      value={{
        user,
        loading,
        isPremium,
        setPremium: setIsPremium,
        refresh,
        loginEmail,
        registerEmail,
        loginWithSession,
        logout,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const c = useContext(AuthCtx);
  if (!c) throw new Error('useAuth must be used within AuthProvider');
  return c;
}
