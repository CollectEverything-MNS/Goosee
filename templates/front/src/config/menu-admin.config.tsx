'use client'
import { routes } from './routes.config'
import {
  Archive,
  Layers,
  LayoutDashboard,
  MessageSquare,
  Package,
  Palette,
  Settings,
  Shield,
  ShoppingCart,
  Users,
} from 'lucide-react'
import { useLocale } from 'next-intl'

export function getAdminMenu() {
  const locale = useLocale()
  return [
    {
      name: 'admin.sidebar.dashboard',
      path: routes.gooseeAdmin.dashboard.getHref(locale),
      icon: LayoutDashboard,
    },

    {
      title: 'admin.sidebar.products.label',
      icon: Package,
      items: [
        {
          name: 'admin.sidebar.products.categories',
          path: routes.gooseeAdmin.categories.getHref(locale),
          icon: Archive,
        },
        {
          name: 'admin.sidebar.products.productsStock',
          path: routes.gooseeAdmin.products.getHref(locale),
          icon: Layers,
        },
      ],
    },

    {
      title: 'admin.sidebar.orders.label',
      icon: ShoppingCart,
      items: [
        {
          name: 'admin.sidebar.orders.label',
          path: routes.gooseeAdmin.orders.getHref(locale),
          icon: ShoppingCart,
        },
        {
          name: 'admin.sidebar.orders.history',
          path: routes.gooseeAdmin.salesHistory.getHref(locale),
          icon: Archive,
        },
      ],
    },

    {
      title: 'admin.sidebar.clients.label',
      icon: Users,
      items: [
        {
          name: 'admin.sidebar.clients.label',
          path: routes.gooseeAdmin.clients.getHref(locale),
          icon: Users,
        },
        {
          name: 'admin.sidebar.clients.returnClients',
          path: routes.gooseeAdmin.returnClient.getHref(locale),
          icon: MessageSquare,
        },
      ],
    },

    {
      title: 'admin.sidebar.personnalisation.label',
      icon: Palette,
      items: [
        {
          name: 'admin.sidebar.personnalisation.pages',
          path: routes.gooseeAdmin.pages.getHref(locale),
          icon: Settings,
        },
        {
          name: 'admin.sidebar.personnalisation.templates',
          path: routes.gooseeAdmin.templates.getHref(locale),
          icon: Layers,
        },
      ],
    },

    {
      title: 'admin.sidebar.access.label',
      icon: Shield,
      items: [
        {
          name: 'admin.sidebar.access.users',
          path: routes.gooseeAdmin.users.getHref(locale),
          icon: Users,
        },
        {
          name: 'admin.sidebar.access.roles',
          path: routes.gooseeAdmin.roles.getHref(locale),
          icon: Shield,
        },
      ],
    },
  ]
}
