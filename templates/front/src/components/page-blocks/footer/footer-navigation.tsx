'use client';

import Link from 'next/link';
import { Menu as MenuType } from '@/features/personnalisation/menu/types/menu.types';
import { resolveHref } from '../header/header-utils';

interface FooterNavigationProps {
  menus: MenuType[];
  slugMap: Record<string, string>;
}

export function FooterNavigation({ menus, slugMap }: FooterNavigationProps) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-white">Navigation</h3>
      <ul className="space-y-2">
        {menus.map((item) => (
          <li key={item.id}>
            <Link
              href={resolveHref(item.pageId, item.externalUrl, slugMap)}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
