'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { LogOut, ShoppingBag, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { api } from '@/lib/api-client';
import { routes } from '@/config/routes.config';
import Cookies from 'js-cookie';
import { LoginModal } from './header-login-modal';

interface SiteUser {
  firstName: string;
  lastName: string;
  email: string;
}

export function HeaderUserMenu({ textColor }: { textColor?: string }) {
  const locale = useLocale();
  const [user, setUser] = useState<SiteUser | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setChecked(true);
      return;
    }
    api.get<SiteUser>('/users/me')
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        Cookies.remove('access_token');
      })
      .finally(() => setChecked(true));
  }, []);

  if (!checked) return null;

  if (!user) return <LoginModal textColor={textColor} />;

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || user.email[0].toUpperCase();

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    try {
      if (refreshToken) {
        await api.post('/auth/revoke-token', { token: refreshToken });
      }
    } catch {
      // ignore
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    Cookies.remove('access_token');
    window.location.reload();
  };

  return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            <span>
              {initials}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={routes.public.account.getHref(locale)}>
              <User className="mr-2 h-4 w-4" />
              Mon profil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`${routes.public.account.getHref(locale)}?tab=orders`}>
              <ShoppingBag className="mr-2 h-4 w-4" />
              Mes commandes
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function MobileUserMenu() {
  const locale = useLocale();
  const [user, setUser] = useState<SiteUser | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setChecked(true);
      return;
    }
    api.get<SiteUser>('/users/me')
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        Cookies.remove('access_token');
      })
      .finally(() => setChecked(true));
  }, []);

  if (!checked) return null;

  if (!user) return <LoginModal />;

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    try {
      if (refreshToken) {
        await api.post('/auth/revoke-token', { token: refreshToken });
      }
    } catch {
      // ignore
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    Cookies.remove('access_token');
    window.location.reload();
  };

  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
      <p className="text-xs text-muted-foreground">{user.email}</p>
      <Link
        href={routes.public.account.getHref(locale)}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
      >
        <User className="h-4 w-4" />
        Mon profil
      </Link>
      <Link
        href={`${routes.public.account.getHref(locale)}?tab=orders`}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
      >
        <ShoppingBag className="h-4 w-4" />
        Mes commandes
      </Link>
      <button
        onClick={handleLogout}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-accent"
      >
        <LogOut className="h-4 w-4" />
        Déconnexion
      </button>
    </div>
  );
}
