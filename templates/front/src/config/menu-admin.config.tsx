'use client';

import {
  BarChart3,
  Layers,
  LayoutDashboard,
  LucideIcon,
  Menu,
  Package,
  ScrollText,
  Shield,
  ShoppingCart,
  Tags,
  Users,
} from 'lucide-react';
import { useLocale } from 'next-intl';

import { routes } from './routes.config';

export interface AdminMenuItem {
  name: string;
  path: string;
  icon: LucideIcon;
  pageKey?: string;
}

export interface AdminMenuSection {
  section: string;
  items: AdminMenuItem[];
}

export function getAdminMenu(): AdminMenuSection[] {
  const locale = useLocale();
  return [
    {
      section: 'admin.sidebar.sections.general',
      items: [
        {
          name: 'admin.sidebar.dashboard',
          path: routes.gooseeAdmin.dashboard.getHref(locale),
          icon: LayoutDashboard,
          pageKey: 'dashboard',
        },
        {
          name: 'admin.sidebar.analytics',
          path: routes.gooseeAdmin.analytics.getHref(locale),
          icon: BarChart3,
          pageKey: 'analytics',
        },
      ],
    },
    {
      section: 'admin.sidebar.sections.catalog',
      items: [
        {
          name: 'admin.sidebar.products.productsStock',
          path: routes.gooseeAdmin.products.getHref(locale),
          icon: Package,
          pageKey: 'products',
        },
        {
          name: 'admin.sidebar.products.categories',
          path: routes.gooseeAdmin.categories.getHref(locale),
          icon: Tags,
          pageKey: 'categories',
        },
      ],
    },
    {
      section: 'admin.sidebar.sections.orders',
      items: [
        {
          name: 'admin.sidebar.orders.label',
          path: routes.gooseeAdmin.orders.getHref(locale),
          icon: ShoppingCart,
          pageKey: 'orders',
        },
      ],
    },
    {
      section: 'admin.sidebar.sections.community',
      items: [
        {
          name: 'admin.sidebar.clients.label',
          path: routes.gooseeAdmin.clients.getHref(locale),
          icon: Users,
          pageKey: 'clients',
        },
      ],
    },
    {
      section: 'admin.sidebar.sections.customization',
      items: [
        {
          name: 'admin.sidebar.personnalisation.pages',
          path: routes.gooseeAdmin.pages.getHref(locale),
          icon: Layers,
          pageKey: 'pages',
        },
        {
          name: 'admin.sidebar.personnalisation.menu',
          path: routes.gooseeAdmin.menu.getHref(locale),
          icon: Menu,
          pageKey: 'menu',
        },
      ],
    },
    {
      section: 'admin.sidebar.sections.access',
      items: [
        {
          name: 'admin.sidebar.access.users',
          path: routes.gooseeAdmin.users.getHref(locale),
          icon: Users,
          pageKey: 'users',
        },
        {
          name: 'admin.sidebar.access.roles',
          path: routes.gooseeAdmin.roles.getHref(locale),
          icon: Shield,
          pageKey: 'roles',
        },
      ],
    },
    {
      section: 'admin.sidebar.sections.system',
      items: [
        {
          name: 'admin.sidebar.access.logs',
          path: routes.gooseeAdmin.logs.getHref(locale),
          icon: ScrollText,
          pageKey: 'logs',
        },
      ],
    },
  ];
}
