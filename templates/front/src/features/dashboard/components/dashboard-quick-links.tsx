'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Shield, FileText, Palette, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { routes } from '@/config/routes.config';

export function DashboardQuickLinks() {
  const t = useTranslations('admin.dashboard');
  const locale = useLocale();

  const links = [
    {
      label: t('quickLinks.users'),
      href: routes.gooseeAdmin.users.getHref(locale),
      icon: Users,
    },
    {
      label: t('quickLinks.roles'),
      href: routes.gooseeAdmin.roles.getHref(locale),
      icon: Shield,
    },
    {
      label: t('quickLinks.logs'),
      href: routes.gooseeAdmin.logs.getHref(locale),
      icon: FileText,
    },
    {
      label: t('quickLinks.pages'),
      href: routes.gooseeAdmin.pages.getHref(locale),
      icon: Palette,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('quickLinks.title')}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {links.map((link) => (
          <Button
            key={link.href}
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
            asChild
          >
            <Link href={link.href}>
              <link.icon className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs">{link.label}</span>
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
