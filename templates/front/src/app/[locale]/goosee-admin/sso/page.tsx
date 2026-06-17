'use client';

import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import Cookies from 'js-cookie';

import { api } from '@/lib/api-client';
import { routes } from '@/config/routes.config';

interface SsoResponse {
  accessToken: string;
  refreshToken: string;
}

// Page d'auto-connexion : échange le jeton SSO (émis par la vitrine) contre une session, stocke
// les jetons, puis redirige (rechargement complet pour réinitialiser le provider d'auth).
export default function SsoPage() {
  const router = useRouter();
  const locale = useLocale();
  const params = useSearchParams();
  const [error, setError] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const token = params.get('token');
    if (!token) {
      setError(true);
      return;
    }
    api
      .post<SsoResponse>('/auth/sso', { token })
      .then((res) => {
        localStorage.setItem('access_token', res.accessToken);
        localStorage.setItem('refresh_token', res.refreshToken);
        Cookies.set('access_token', res.accessToken, { path: '/' });
        // Rechargement complet : l'auth-provider relit le token au montage.
        window.location.replace(routes.gooseeAdmin.dashboard.getHref(locale));
      })
      .catch(() => setError(true));
  }, [params, locale, router]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background text-center">
      {error ? (
        <>
          <p className="text-sm text-muted-foreground">
            Lien d’accès invalide ou expiré. Veuillez vous connecter.
          </p>
          <a
            href={routes.gooseeAdmin.login.getHref(locale)}
            className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background"
          >
            Aller à la connexion
          </a>
        </>
      ) : (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Connexion en cours…</p>
        </>
      )}
    </div>
  );
}
