'use client';

import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu as MenuType } from '@/features/personnalisation/menu/types/menu.types';
import { resolveHref } from './header-utils';

interface MenuItemProps {
  item: MenuType;
  textColor?: string;
  isPreview?: boolean;
  slugMap: Record<string, string>;
}

export function MenuItem({ item, textColor, isPreview, slugMap }: MenuItemProps) {
  const hasChildren = item.children && item.children.length > 0;
  const href = resolveHref(item.pageId, item.externalUrl, slugMap);

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
                  href={resolveHref(child.pageId, child.externalUrl, slugMap)}
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
