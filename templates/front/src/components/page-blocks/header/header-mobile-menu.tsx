'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu as MenuType } from '@/features/personnalisation/menu/types/menu.types';
import { resolveHref } from './header-utils';
import { MobileUserMenu } from './header-user-menu';

interface MobileMenuProps {
  menus: MenuType[];
  textColor?: string;
  isPreview?: boolean;
  slugMap: Record<string, string>;
}

export function MobileMenu({ menus, textColor, isPreview, slugMap }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" style={{ color: textColor }} />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <nav className="flex flex-col gap-2 mt-8">
          {menus.filter(m => m.isActive && !m.parentId).map((item) => (
            <div key={item.id}>
              {isPreview ? (
                <span className="block px-3 py-2 text-sm font-medium">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={resolveHref(item.pageId, item.externalUrl, slugMap)}
                  target={item.openInNewTab ? '_blank' : undefined}
                  className="block px-3 py-2 text-sm font-medium hover:bg-accent rounded-md"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              )}
              {item.children?.filter(child => child.isActive).map((child) => (
                isPreview ? (
                  <span key={child.id} className="block px-6 py-2 text-sm text-muted-foreground">
                    {child.label}
                  </span>
                ) : (
                  <Link
                    key={child.id}
                    href={resolveHref(child.pageId, child.externalUrl, slugMap)}
                    target={child.openInNewTab ? '_blank' : undefined}
                    className="block px-6 py-2 text-sm text-muted-foreground hover:bg-accent rounded-md"
                    onClick={() => setOpen(false)}
                  >
                    {child.label}
                  </Link>
                )
              ))}
            </div>
          ))}

          {!isPreview && (
            <div className="border-t pt-4 mt-4 px-3">
              <MobileUserMenu />
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
