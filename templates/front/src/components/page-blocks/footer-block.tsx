'use client';

import { useSettings } from '@/features/personnalisation/settings/usecases/use-get-settings';
import { useMenus } from '@/features/personnalisation/menu/usecases/use-list-menus';
import { usePages } from '@/features/personnalisation/pages/usecases/list-pages/use-list-pages';
import { useMemo } from 'react';
import { FooterLogoSection } from './footer/footer-logo-section';
import { FooterNavigation } from './footer/footer-navigation';
import { FooterContact } from './footer/footer-contact';

export function FooterBlock() {
  const { data: settings, dataUpdatedAt } = useSettings();
  const { data: menus = [] } = useMenus();
  const { data: pagesData } = usePages();

  const slugMap = useMemo(() => {
    const pages = (pagesData as any)?.pages ?? pagesData ?? [];
    const map: Record<string, string> = {};
    if (Array.isArray(pages)) {
      pages.forEach((p: any) => {
        if (p.id && p.slug) map[p.id] = p.slug;
      });
    }
    return map;
  }, [pagesData]);

  const rootMenus = menus.filter((m) => !m.parentId && m.isActive);
  const logoSrc = settings?.logoUrl
    ? `${settings.logoUrl}${settings.logoUrl.includes('?') ? '&' : '?'}v=${dataUpdatedAt}`
    : undefined;
  const siteName = settings?.title || 'Mon site';
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-800 bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-12 lg:px-20">
        <div className="grid gap-8 md:grid-cols-3">
          <FooterLogoSection logoSrc={logoSrc} siteName={siteName} />
          <FooterNavigation menus={rootMenus} slugMap={slugMap} />
          <FooterContact />
        </div>

        <div className="mt-8 border-t border-gray-800 pt-6 text-center text-xs text-gray-400">
          &copy; {year} {siteName}. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
