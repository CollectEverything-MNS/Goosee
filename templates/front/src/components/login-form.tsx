'use client';

import { ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { routes } from '@/config/routes.config';
import { useAuth } from '@/providers/auth-provider';

export function LoginForm() {
  const t = useTranslations();
  const locale = useLocale();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      if (msg) {
        setError(Array.isArray(msg) ? msg.join(', ') : msg);
      } else {
        setError(err?.message || 'Erreur de connexion');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {t('admin.login.title')}
        </h1>
        <p className="text-sm text-muted-foreground">{t('admin.login.subtitle')}</p>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t('admin.login.email')}
          </Label>
          <Input
            id="email"
            type="email"
            placeholder={t('admin.login.emailPlaceholder')}
            required
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="h-11"
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t('admin.login.password')}
            </Label>
            <Link
              href={routes.gooseeAdmin.forgotPassword.getHref(locale)}
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t('admin.login.forgotPassword')}
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder={t('admin.login.passwordPlaceholder')}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="h-11"
          />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="h-11 gap-2 text-sm font-semibold">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {t('admin.login.loginButton')}
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}
