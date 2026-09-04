/**
 * Re:Market — Auth Context (AGENTS.md mục 3)
 * Quản lý trạng thái đăng nhập + role hiện tại. Phân quyền thật sự nằm ở server
 * (server/auth.ts); context này là trạng thái client để render đúng UI.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { PublicUser, UserRole } from '../types';
import { api } from '../services/api';
import { supabase } from '../lib/supabase-client';
import { publicUserFromSession } from '../lib/supabase-auth';
import { isSimulationMode } from '../../lib/config/app-mode';

interface AuthContextType {
  user: PublicUser | null;
  role: UserRole;
  loading: boolean;
  login: (email: string, password: string) => Promise<PublicUser>;
  logout: () => Promise<void>;
  verifyLink: (token: string) => Promise<PublicUser | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .getMe()
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // Live mode: theo dõi thay đổi session Supabase (đăng nhập / xác nhận email /
    // đăng xuất) để cập nhật UI tức thì. Simulation dùng session local riêng.
    if (!isSimulationMode()) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (cancelled) return;
        if (session) {
          publicUserFromSession(session)
            .then(setUser)
            .catch(() => setUser(null));
        } else {
          setUser(null);
        }
      });
      const sub = data.subscription;
      return () => {
        cancelled = true;
        sub.unsubscribe();
      };
    }

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const u = await api.login(email, password);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  // Magic link 1-click: xác thực rồi tự đăng nhập (server tạo session + cookie;
  // simulation ghi simUser local qua api.verifyLink).
  const verifyLink = useCallback(async (token: string) => {
    const result = await api.verifyLink(token);
    if (!result.ok || !result.user) return null;
    setUser(result.user);
    return result.user;
  }, []);

  const role: UserRole = user?.role || 'customer';

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout, verifyLink }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
