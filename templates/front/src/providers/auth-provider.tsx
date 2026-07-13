'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { routes } from '@/config/routes.config';
import Cookies from 'js-cookie';

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  pageKeys: string[];
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiredAt: string;
  refreshTokenExpiredAt: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  canAccess: (pageKey: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const locale = useLocale();

  const fetchUserProfile = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const profile = await api.get<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string[];
      }>('/users/me');

      const rolesRes = await api.get<{ roles: { id: string; name: string; pageKeys: string[] }[] }>('/roles');
      const roles = rolesRes.roles ?? [];
      const userRoles = roles.filter((r) => profile.role.includes(r.name));
      const pageKeys = [...new Set(userRoles.flatMap((r) => r.pageKeys))];

      return {
        id: profile.id,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        roles: profile.role,
        pageKeys,
      };
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    fetchUserProfile().then((u) => {
      setUser(u);
      if (!u) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        Cookies.remove('access_token');
      }
      setIsLoading(false);
    });
  }, [fetchUserProfile]);

  // Un 401 (session expiree) emis par l'api-client invalide l'utilisateur courant ;
  // le layout admin protege se chargera alors de rediriger vers le login.
  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<LoginResponse>('/auth/login', { email, password });
    localStorage.setItem('access_token', res.accessToken);
    localStorage.setItem('refresh_token', res.refreshToken);
    Cookies.set('access_token', res.accessToken, { path: '/' });

    const profile = await fetchUserProfile();
    if (!profile) throw new Error('Failed to fetch user profile');
    setUser(profile);
    // Reload complet (et pas router.push) : evite l'ecran blanc sur le login
    // lors de la transition vers le dashboard apres connexion.
    const dashboardHref = routes.gooseeAdmin.dashboard.getHref(locale);
    if (typeof window !== 'undefined') {
      window.location.assign(dashboardHref);
    } else {
      router.push(dashboardHref);
    }
  }, [fetchUserProfile, router, locale]);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    try {
      if (refreshToken) {
        await api.post('/auth/revoke-token', { token: refreshToken });
      }
    } catch {
      // ignore revoke errors
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    Cookies.remove('access_token');
    setUser(null);
    // Full reload to purge all in-memory state (React Query cache, providers, etc.)
    if (typeof window !== 'undefined') {
      window.location.href = routes.gooseeAdmin.login.getHref(locale);
    } else {
      router.replace(routes.gooseeAdmin.login.getHref(locale));
    }
  }, [router, locale]);

  const canAccess = useCallback((pageKey: string) => {
    if (!user) return false;
    return user.pageKeys.includes(pageKey);
  }, [user]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    canAccess,
  }), [user, isLoading, login, logout, canAccess]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
