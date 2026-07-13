'use client';

import { useAuth } from '@/providers/auth-provider';
import { AdminThemeProvider } from '@/providers/admin-theme-provider';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { routes } from '@/config/routes.config';
import { getPageKeyFromPathname } from '@/config/page-keys.config';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, canAccess } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // Reload complet (et pas router.replace) : purge l'etat en memoire et evite
      // l'ecran blanc observe lors d'une expiration de session.
      const loginHref = routes.gooseeAdmin.login.getHref(locale);
      if (typeof window !== 'undefined') {
        window.location.replace(loginHref);
      } else {
        router.replace(loginHref);
      }
      return;
    }

    const pageKey = getPageKeyFromPathname(pathname);
    if (pageKey && !canAccess(pageKey)) {
      router.replace(routes.gooseeAdmin.dashboard.getHref(locale));
    }
  }, [isLoading, isAuthenticated, pathname, canAccess, router, locale]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const pageKey = getPageKeyFromPathname(pathname);
  if (pageKey && !canAccess(pageKey)) return null;

  return <AdminThemeProvider>{children}</AdminThemeProvider>;
}
