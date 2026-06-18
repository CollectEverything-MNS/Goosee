'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ChevronDown, LogOut, ShoppingBag, User } from 'lucide-react';
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
          <button className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 transition-colors hover:bg-black/5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {initials}
            </span>
            <span className="hidden text-sm font-medium lg:block" style={{ color: textColor }}>
              {user.firstName} {user.lastName}
            </span>
            <ChevronDown className="hidden h-4 w-4 opacity-60 lg:block" style={{ color: textColor }} />
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

  const initials =
    `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() ||
    user.email[0].toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-3 rounded-xl border bg-card px-4 py-3 text-left transition-colors hover:bg-accent">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {initials}
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium">
              {user.firstName} {user.lastName}
            </span>
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[var(--radix-dropdown-menu-trigger-width)]">
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
        <DropdownMenuItem onSelect={handleLogout} className="text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
