'use client';

import { ChevronDown, FileText, Package, Plus, Tags, UserPlus } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { routes } from '@/config/routes.config';
import { useAuth } from '@/providers/auth-provider';

export function AdminCreateButton() {
  const t = useTranslations('admin.create');
  const locale = useLocale();
  const { canAccess } = useAuth();

  const actions = [
    {
      key: 'product',
      label: t('product'),
      icon: Package,
      href: routes.gooseeAdmin.products.getHref(locale),
      pageKey: 'products',
    },
    {
      key: 'category',
      label: t('category'),
      icon: Tags,
      href: routes.gooseeAdmin.categories.getHref(locale),
      pageKey: 'categories',
    },
    {
      key: 'user',
      label: t('user'),
      icon: UserPlus,
      href: routes.gooseeAdmin.users.getHref(locale),
      pageKey: 'users',
    },
    {
      key: 'page',
      label: t('page'),
      icon: FileText,
      href: routes.gooseeAdmin.pagesCreate.getHref(locale),
      pageKey: 'pages',
    },
  ].filter((a) => !a.pageKey || canAccess(a.pageKey));

  if (actions.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-10 items-center gap-2 rounded-lg bg-[hsl(var(--admin-accent))] px-4 text-sm font-semibold text-[hsl(var(--admin-accent-foreground))] shadow-sm transition-colors hover:brightness-95">
        <Plus className="h-4 w-4" strokeWidth={2.5} />
        <span>{t('label')}</span>
        <ChevronDown className="h-4 w-4 opacity-70" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {actions.map((action) => (
          <DropdownMenuItem key={action.key} asChild>
            <Link href={action.href} className="flex items-center gap-2">
              <action.icon className="h-4 w-4 text-muted-foreground" />
              <span>{action.label}</span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
