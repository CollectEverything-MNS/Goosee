'use client';

import { cn } from '@/lib/utils';
import { BlockPropsWithContext, HeaderBlockProps } from './types';
import { useSettings } from '@/features/personnalisation/settings/usecases/use-get-settings';
import { useMenus } from '@/features/personnalisation/menu/usecases/use-list-menus';
import { usePages } from '@/features/personnalisation/pages/usecases/list-pages/use-list-pages';
import { useMemo } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HEIGHT_CLASSES, MENU_ALIGNMENT_CLASSES } from './header/header-utils';
import { MenuItem } from './header/header-menu-item';
import { MobileMenu } from './header/header-mobile-menu';
import { HeaderUserMenu } from './header/header-user-menu';
import { HeaderLogo } from './header/header-logo';
import { useCartContext } from '@/features/cart/context/cart-provider';

export function HeaderBlock({
  logoPosition = 'left',
  showMenu = true,
  menuAlignment = 'right',
  backgroundColor = '#ffffff',
  textColor = '#000000',
  sticky = false,
  height = 'md',
  context,
}: BlockPropsWithContext<HeaderBlockProps>) {
  const { data: settings, dataUpdatedAt } = useSettings();
  const { data: menus = [] } = useMenus();
  const { data: pagesData } = usePages();
  const cart = useCartContext();
  const isPreview = context?.mode === 'preview';
  const logoSrc = settings?.logoUrl
    ? `${settings.logoUrl}${settings.logoUrl.includes('?') ? '&' : '?'}v=${dataUpdatedAt}`
    : undefined;
  const siteName = settings?.title || 'Mon site';

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

  return (
    <header
      className={cn(
        'w-full px-6 md:px-12 lg:px-20',
        HEIGHT_CLASSES[height],
        !isPreview && 'sticky top-0 z-50 border-b border-black/5 backdrop-blur supports-[backdrop-filter]:bg-opacity-80',
        context?.isSelected && 'ring-2 ring-primary ring-offset-2',
      )}
      style={{ backgroundColor }}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between">
        {logoPosition === 'left' && (
          <HeaderLogo logoSrc={logoSrc} siteName={siteName} textColor={textColor} />
        )}

        {showMenu && (
          <>
            <nav className={cn('hidden md:flex items-center gap-1 flex-1', MENU_ALIGNMENT_CLASSES[menuAlignment])}>
              {rootMenus.map((item) => (
                <MenuItem key={item.id} item={item} textColor={textColor} isPreview={isPreview} slugMap={slugMap} />
              ))}
            </nav>
            <MobileMenu
              menus={menus}
              textColor={textColor}
              isPreview={isPreview}
              slugMap={slugMap}
              siteName={siteName}
              cart={isPreview ? undefined : cart}
            />
          </>
        )}

        {/* Actions desktop uniquement — sur mobile, panier et compte vivent dans la sidebar. */}
        {!isPreview && (
          <div className="hidden shrink-0 items-center gap-2 ml-6 pl-6 border-l border-black/10 md:flex">
            <HeaderUserMenu textColor={textColor} />
            <button
              type="button"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-black/5"
              onClick={() => cart?.setOpen(true)}
              aria-label="Ouvrir le panier"
            >
              <ShoppingCart className="h-[1.15rem] w-[1.15rem]" style={{ color: textColor }} />
              {cart && cart.itemCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground ring-2 ring-white">
                  {cart.itemCount}
                </span>
              )}
            </button>
          </div>
        )}

        {logoPosition === 'center' && (
          <HeaderLogo
            logoSrc={logoSrc}
            siteName={siteName}
            textColor={textColor}
            className="absolute left-1/2 -translate-x-1/2 flex items-center"
          />
        )}

        {logoPosition === 'right' && (
          <HeaderLogo logoSrc={logoSrc} siteName={siteName} textColor={textColor} />
        )}
      </div>
    </header>
  );
}
