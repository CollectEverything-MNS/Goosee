'use client';

import { ArrowUpRight, FileText, Package, Tags, Users } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

import { routes } from '@/config/routes.config';

export function DashboardQuickLinks() {
  const t = useTranslations('admin.dashboard.quickLinks');
  const locale = useLocale();

  const links = [
    { key: 'products', href: routes.gooseeAdmin.products.getHref(locale), icon: Package },
    { key: 'categories', href: routes.gooseeAdmin.categories.getHref(locale), icon: Tags },
    { key: 'users', href: routes.gooseeAdmin.users.getHref(locale), icon: Users },
    { key: 'pages', href: routes.gooseeAdmin.pages.getHref(locale), icon: FileText },
  ] as const;

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold text-foreground">{t('title')}</h3>
      </div>
      <div className="divide-y divide-border/60">
        {links.map(({ key, href, icon: Icon }) => (
          <Link
            key={key}
            href={href}
            className="group flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-muted/40"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-foreground">{t(key)}</span>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
