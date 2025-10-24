import { routes } from "./routes.config";
import {
  Archive,
  Layers,
  LayoutDashboard,
  LucideIcon,
  MessageSquare,
  Package,
  Palette,
  Settings, Shield,
  ShoppingCart,
  Users
} from 'lucide-react';

interface TMenuAdminItem {
  name: string;
  path?: string;
  icon?: LucideIcon;
}

interface TMenuAdmin {
  title?: string;
  name?: string;
  path?: string;
  items?: TMenuAdminItem[];
  icon?: LucideIcon;
}

export const MENU_ADMIN_CONFIG: TMenuAdmin[] = [
  {
    name: "Tableau de bord",
    path: routes.gooseeAdmin.dashboard.getHref(),
    icon: LayoutDashboard,
  },

  {
    title: "PRODUITS",
    icon: Package,
    items: [
      { name: "Liste des produits", path: routes.gooseeAdmin.products.getHref(), icon: Layers },
      { name: "Catégories", path: routes.gooseeAdmin.categories.getHref(), icon: Archive },
      { name: "Gestion des stocks", path: routes.gooseeAdmin.stock.getHref(), icon: Settings },
    ],
  },

  {
    title: "COMMANDES",
    icon: ShoppingCart,
    items: [
      { name: "Toutes les commandes", path: routes.gooseeAdmin.orders.getHref(), icon: ShoppingCart },
      { name: "Messages clients", path: routes.gooseeAdmin.messages.getHref(), icon: MessageSquare },
      { name: "Historique des ventes", path: routes.gooseeAdmin.salesHistory.getHref(), icon: Archive },
    ],
  },

  {
    title: "CLIENTS",
    icon: Users,
    items: [
      { name: "Liste des clients", path: routes.gooseeAdmin.clients.getHref(), icon: Users },
    ],
  },

  {
    title: "PERSONNALISATION",
    icon: Palette,
    items: [
      { name: "Thème & personnalisation", path: routes.gooseeAdmin.theme.getHref(), icon: Settings },
      { name: "Choix du template", path: routes.gooseeAdmin.template.getHref(), icon: Layers },
    ],
  },

  {
    title: "ACCÈS",
    icon: Shield,
    items: [
      { name: "Liste des utilisateurs", path: routes.gooseeAdmin.users.getHref(), icon: Users },
      { name: "Gestion des rôles", path: routes.gooseeAdmin.roles.getHref(), icon: Shield },
    ],
  },
];

