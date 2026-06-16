'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useLocale } from 'next-intl';

import { routes } from '@/config/routes.config';
import { useAuth } from '@/providers/auth-provider';

export default function GooseeAdminIndex() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    if (isLoading) return;
    const target = isAuthenticated
      ? routes.gooseeAdmin.dashboard.getHref(locale)
      : routes.gooseeAdmin.login.getHref(locale);
    router.replace(target);
  }, [isLoading, isAuthenticated, router, locale]);

  return (
    <div className="flex min-h-svh items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}
