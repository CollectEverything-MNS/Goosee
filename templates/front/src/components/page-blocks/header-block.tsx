'use client';

import { cn } from '@/lib/utils';
import { BlockPropsWithContext, HeaderBlockProps } from './types';
import { useSettings } from '@/features/personnalisation/settings/usecases/use-get-settings';
import { useMenus } from '@/features/personnalisation/menu/usecases/use-list-menus';
import { Menu as MenuType } from '@/features/personnalisation/menu/types/menu.types';
import { ChevronDown, Menu } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const HEIGHT_CLASSES = {
  sm: 'h-14',
  md: 'h-16',
  lg: 'h-20',
};

const MENU_ALIGNMENT_CLASSES = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};

interface MenuItemProps {
  item: MenuType;
  textColor?: string;
  isPreview?: boolean;
}

function MenuItem({ item, textColor, isPreview }: MenuItemProps) {
  const hasChildren = item.children && item.children.length > 0;

  const href = item.pageId
    ? `/p/${item.pageId}`
    : item.externalUrl || '#';

  if (!item.isActive) return null;

  if (hasChildren) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors hover:opacity-70"
            style={{ color: textColor }}
          >
            {item.label}
            <ChevronDown className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {item.children?.filter(child => child.isActive).map((child) => (
            <DropdownMenuItem key={child.id} asChild>
              {isPreview ? (
                <span className="cursor-default">{child.label}</span>
              ) : (
                <Link
                  href={child.pageId ? `/p/${child.pageId}` : child.externalUrl || '#'}
                  target={child.openInNewTab ? '_blank' : undefined}
                >
                  {child.label}
                </Link>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (isPreview) {
    return (
      <span
        className="px-3 py-2 text-sm font-medium"
        style={{ color: textColor }}
      >
        {item.label}
      </span>
    );
  }

  return (
    <Link
      href={href}
      target={item.openInNewTab ? '_blank' : undefined}
      className="px-3 py-2 text-sm font-medium transition-colors hover:opacity-70"
      style={{ color: textColor }}
    >
      {item.label}
    </Link>
  );
}

interface MobileMenuProps {
  menus: MenuType[];
  textColor?: string;
  isPreview?: boolean;
}

function MobileMenu({ menus, textColor, isPreview }: MobileMenuProps) {
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
                  href={item.pageId ? `/p/${item.pageId}` : item.externalUrl || '#'}
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
                    href={child.pageId ? `/p/${child.pageId}` : child.externalUrl || '#'}
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
        </nav>
      </SheetContent>
    </Sheet>
  );
}

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
  const { data: settings } = useSettings();
  const { data: menus = [] } = useMenus();
  const isPreview = context?.mode === 'preview';

  // Filter root menus (no parentId) and flatten for mobile
  const rootMenus = menus.filter((m) => !m.parentId && m.isActive);

  return (
    <header
      className={cn(
        'w-full px-4 md:px-6',
        HEIGHT_CLASSES[height],
        sticky && 'sticky top-0 z-50',
        context?.isSelected && 'ring-2 ring-primary ring-offset-2'
      )}
      style={{ backgroundColor }}
      onClick={context?.onSelect}
    >
      <div className="container mx-auto h-full flex items-center justify-between">
        {/* Logo */}
        <div
          className={cn(
            'flex items-center',
            logoPosition === 'center' && 'absolute left-1/2 -translate-x-1/2'
          )}
        >
          {settings?.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.title || 'Logo'}
              className="h-8 md:h-10 w-auto object-contain"
            />
          ) : (
            <span
              className="text-lg md:text-xl font-bold"
              style={{ color: textColor }}
            >
              {settings?.title || 'Mon Site'}
            </span>
          )}
        </div>

        {/* Desktop Navigation */}
        {showMenu && (
          <nav
            className={cn(
              'hidden md:flex items-center flex-1',
              logoPosition === 'left' ? 'ml-8' : 'ml-0',
              MENU_ALIGNMENT_CLASSES[menuAlignment]
            )}
          >
            {rootMenus.map((item) => (
              <MenuItem
                key={item.id}
                item={item}
                textColor={textColor}
                isPreview={isPreview}
              />
            ))}
          </nav>
        )}

        {/* Mobile Menu */}
        {showMenu && (
          <MobileMenu
            menus={menus}
            textColor={textColor}
            isPreview={isPreview}
          />
        )}
      </div>
    </header>
  );
}
