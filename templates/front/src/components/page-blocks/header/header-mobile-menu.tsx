'use client';

import Link from 'next/link';
import { Menu, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu as MenuType } from '@/features/personnalisation/menu/types/menu.types';
import { resolveHref } from './header-utils';
import { MobileUserMenu } from './header-user-menu';

interface MobileMenuProps {
  menus: MenuType[];
  textColor?: string;
  isPreview?: boolean;
  slugMap: Record<string, string>;
  siteName?: string;
  cart?: { itemCount: number; setOpen: (open: boolean) => void } | null;
}

export function MobileMenu({
  menus,
  textColor,
  isPreview,
  slugMap,
  siteName,
  cart,
}: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  const rootItems = menus.filter((m) => m.isActive && !m.parentId);

  const openCart = () => {
    setOpen(false);
    cart?.setOpen(true);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-6 w-6" style={{ color: textColor }} />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-[85vw] max-w-sm flex-col gap-0 p-0">
        <SheetHeader className="border-b px-5 py-4 text-left">
          <SheetTitle className="truncate text-base font-semibold">
            {siteName || 'Menu'}
          </SheetTitle>
        </SheetHeader>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {rootItems.map((item) => (
            <div key={item.id}>
              {isPreview ? (
                <span className="block rounded-lg px-3 py-3 text-base font-medium">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={resolveHref(item.pageId, item.externalUrl, slugMap)}
                  target={item.openInNewTab ? '_blank' : undefined}
                  className="block rounded-lg px-3 py-3 text-base font-medium transition-colors hover:bg-accent"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              )}
              {item.children
                ?.filter((child) => child.isActive)
                .map((child) =>
                  isPreview ? (
                    <span
                      key={child.id}
                      className="block rounded-lg px-6 py-2.5 text-sm text-muted-foreground"
                    >
                      {child.label}
                    </span>
                  ) : (
                    <Link
                      key={child.id}
                      href={resolveHref(child.pageId, child.externalUrl, slugMap)}
                      target={child.openInNewTab ? '_blank' : undefined}
                      className="block rounded-lg px-6 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent"
                      onClick={() => setOpen(false)}
                    >
                      {child.label}
                    </Link>
                  )
                )}
            </div>
          ))}
        </nav>

        {!isPreview && (
          <div className="mt-auto space-y-4 border-t px-5 py-4">
            {cart && (
              <button
                type="button"
                onClick={openCart}
                className="flex w-full items-center justify-between rounded-xl border bg-card px-4 py-3 text-sm font-semibold transition-colors hover:bg-accent"
              >
                <span className="flex items-center gap-3">
                  <ShoppingCart className="h-5 w-5" />
                  Mon panier
                </span>
                {cart.itemCount > 0 && (
                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">
                    {cart.itemCount}
                  </span>
                )}
              </button>
            )}
            <MobileUserMenu />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
