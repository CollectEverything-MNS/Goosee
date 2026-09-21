'use client';

import Link from 'next/link';
import { useSettings } from '@/features/personnalisation/settings/usecases/use-get-settings';
import { useMenus } from '@/features/personnalisation/menu/usecases/use-list-menus';
import { usePages } from '@/features/personnalisation/pages/usecases/list-pages/use-list-pages';
import { useMemo } from 'react';
import { FooterLogoSection } from './footer/footer-logo-section';
import { FooterNavigation } from './footer/footer-navigation';
import { FooterContact } from './footer/footer-contact';

// Pages légales affichées dans le pied de page (ordre voulu).
// Elles restent éditables dans le page builder : le lien suit le slug et le titre courants.
const LEGAL_SLUGS = ['mentions-legales', 'politique-de-confidentialite'];

export function FooterBlock() {
  const { data: settings, dataUpdatedAt } = useSettings();
  const { data: menus = [] } = useMenus();
  const { data: pagesData } = usePages();

  const pages = useMemo(
    () => (pagesData as any)?.pages ?? pagesData ?? [],
    [pagesData],
  );

  const slugMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (Array.isArray(pages)) {
      pages.forEach((p: any) => {
        if (p.id && p.slug) map[p.id] = p.slug;
      });
    }
    return map;
  }, [pages]);

  // Liens légaux : pages publiées correspondant aux slugs légaux, dans l'ordre défini.
  const legalPages = useMemo(() => {
    if (!Array.isArray(pages)) return [];
    return LEGAL_SLUGS.map((slug) =>
      pages.find(
        (p: any) => p.slug === slug && (p.status ?? 'published') === 'published',
      ),
    ).filter(Boolean) as { title: string; slug: string }[];
  }, [pages]);

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

        <div className="mt-8 flex flex-col items-center gap-3 border-t border-gray-800 pt-6 text-xs text-gray-400 sm:flex-row sm:justify-between">
          <span>
            &copy; {year} {siteName}. Tous droits réservés.
          </span>
          {legalPages.length > 0 && (
            <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
              {legalPages.map((p) => (
                <Link
                  key={p.slug}
                  href={`/${p.slug}`}
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  {p.title}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </footer>
  );
}
