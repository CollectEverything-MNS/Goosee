'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { LoginForm } from '@/components/login-form';
import { routes } from '@/config/routes.config';
import { useAuth } from '@/providers/auth-provider';

export default function Page() {
  const t = useTranslations('admin.login');
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const year = new Date().getFullYear();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(routes.gooseeAdmin.dashboard.getHref(locale));
    }
  }, [isLoading, isAuthenticated, router, locale]);

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isAuthenticated) return null;

  return (
    <div className="grid min-h-svh lg:grid-cols-[1.1fr_1fr]">
      {/* Panel branding (gauche, sombre) */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-foreground p-10 text-background lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(250,204,21,0.12),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(250,204,21,0.06),transparent_50%)]" />

        <div className="relative flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background/10 backdrop-blur">
            <span className="text-lg font-bold text-background">
              G<span className="text-[#facc15]">.</span>
            </span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold uppercase tracking-wide">Goosee</div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-background/60">
              {t('tagline')}
            </div>
          </div>
        </div>

        <div className="relative space-y-6">
          <blockquote className="text-2xl font-medium leading-relaxed text-background lg:text-3xl">
            « {t('quote')} »
          </blockquote>
          <div className="text-sm text-background/60">— {t('quoteAuthor')}</div>
        </div>

        <div className="relative text-xs text-background/40">
          {t('footer', { year })}
        </div>
      </div>

      {/* Panel formulaire (droite, clair) */}
      <div className="flex flex-col bg-background">
        {/* logo mobile */}
        <div className="flex items-center gap-2 border-b border-border px-6 py-5 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground">
            <span className="text-lg font-bold text-background">
              G<span className="text-[#facc15]">.</span>
            </span>
          </div>
          <span className="text-sm font-semibold uppercase tracking-wide">Goosee</span>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </div>

        <div className="px-6 pb-6 text-center text-xs text-muted-foreground lg:hidden">
          {t('footer', { year })}
        </div>
      </div>
    </div>
  );
}
