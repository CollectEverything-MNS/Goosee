'use client';

import {
  FileText,
  LayoutDashboard,
  Layers,
  Menu,
  Package,
  Plus,
  ScrollText,
  Search,
  Settings,
  Shield,
  ShoppingCart,
  Tags,
  UserPlus,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import * as React from 'react';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { routes } from '@/config/routes.config';
import { useListCategories } from '@/features/products/usecases/use-list-categories';
import { useListProducts } from '@/features/products/usecases/use-list-products';
import { useListRoles } from '@/features/roles/usecases/use-list-roles';
import { useListAdmins } from '@/features/users/usecases/use-list-admins';
import { useListCustomers } from '@/features/users/usecases/use-list-customers';
import { useListOrders } from '@/features/orders/usecases/use-list-orders';
import { usePages } from '@/features/personnalisation/pages/usecases/list-pages/use-list-pages';
import { useAuth } from '@/providers/auth-provider';

const MAX_ITEMS_PER_GROUP = 8;

export function AdminSearchbar() {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();
  const { canAccess } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [isMac, setIsMac] = React.useState(false);

  const { data: products = [] } = useListProducts();
  const { data: categories = [] } = useListCategories();
  const { data: admins = [] } = useListAdmins();
  const { data: customers = [] } = useListCustomers();
  const { data: orders = [] } = useListOrders();
  const { data: rolesData = [] } = useListRoles();
  const { data: pagesData } = usePages();
  const pages = Array.isArray(pagesData) ? pagesData : [];

  React.useEffect(() => {
    setIsMac(navigator.platform.includes('Mac'));
  }, []);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const go = React.useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );

  // Ouvre la modale de détail d'une entité via un paramètre d'URL sur sa page liste.
  const goDetail = React.useCallback(
    (href: string, id: string) => go(`${href}?detailId=${id}`),
    [go]
  );

  const navigation = React.useMemo(
    () =>
      [
        { key: 'dashboard', label: t('admin.pageTitles.dashboard'), icon: LayoutDashboard, href: routes.gooseeAdmin.dashboard.getHref(locale) },
        { key: 'products', label: t('admin.pageTitles.products'), icon: Package, href: routes.gooseeAdmin.products.getHref(locale) },
        { key: 'categories', label: t('admin.pageTitles.categories'), icon: Tags, href: routes.gooseeAdmin.categories.getHref(locale) },
        { key: 'orders', label: t('admin.pageTitles.orders'), icon: ShoppingCart, href: routes.gooseeAdmin.orders.getHref(locale) },
        { key: 'clients', label: t('admin.pageTitles.clients'), icon: Users, href: routes.gooseeAdmin.clients.getHref(locale) },
        { key: 'pages', label: t('admin.pageTitles.pages'), icon: Layers, href: routes.gooseeAdmin.pages.getHref(locale) },
        { key: 'templates', label: t('admin.pageTitles.templates'), icon: FileText, href: routes.gooseeAdmin.templates.getHref(locale) },
        { key: 'menu', label: t('admin.pageTitles.menu'), icon: Menu, href: routes.gooseeAdmin.menu.getHref(locale) },
        { key: 'users', label: t('admin.pageTitles.users'), icon: Users, href: routes.gooseeAdmin.users.getHref(locale) },
        { key: 'roles', label: t('admin.pageTitles.roles'), icon: Shield, href: routes.gooseeAdmin.roles.getHref(locale) },
        { key: 'logs', label: t('admin.pageTitles.logs'), icon: ScrollText, href: routes.gooseeAdmin.logs.getHref(locale) },
        { key: 'settings', label: t('admin.pageTitles.siteSettings'), icon: Settings, href: routes.gooseeAdmin.settings.getHref(locale) },
      ].filter((item) => canAccess(item.key)),
    [locale, t, canAccess]
  );

  const quickActions = React.useMemo(
    () =>
      [
        { key: 'products', label: t('admin.search.actions.newProduct'), icon: Plus, href: routes.gooseeAdmin.products.getHref(locale) },
        { key: 'categories', label: t('admin.search.actions.newCategory'), icon: Plus, href: routes.gooseeAdmin.categories.getHref(locale) },
        { key: 'users', label: t('admin.search.actions.newUser'), icon: UserPlus, href: routes.gooseeAdmin.users.getHref(locale) },
        { key: 'pages', label: t('admin.search.actions.newPage'), icon: Plus, href: routes.gooseeAdmin.pagesCreate.getHref(locale) },
      ].filter((item) => canAccess(item.key)),
    [locale, t, canAccess]
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-flex h-10 w-full items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 text-sm text-muted-foreground transition-colors hover:border-foreground/20 hover:bg-muted/40"
      >
        <div className="flex items-center gap-3">
          <Search className="h-4 w-4" />
          <span>{t('admin.search.placeholder')}</span>
        </div>
        <kbd className="hidden select-none items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
          <span>{isMac ? '⌘' : 'Ctrl'}</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={t('admin.search.placeholder')} />
        <CommandList className="max-h-[420px]">
          <CommandEmpty>{t('admin.noResults')}</CommandEmpty>

          {quickActions.length > 0 && (
            <CommandGroup heading={t('admin.search.groups.quickActions')}>
              {quickActions.map((a) => (
                <CommandItem
                  key={`action-${a.key}`}
                  value={`action ${a.label}`}
                  onSelect={() => go(a.href)}
                  className="gap-3"
                >
                  <a.icon className="h-4 w-4 text-muted-foreground" />
                  <span>{a.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {navigation.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading={t('admin.search.groups.navigation')}>
                {navigation.map((n) => (
                  <CommandItem
                    key={`nav-${n.key}`}
                    value={`page ${n.label}`}
                    onSelect={() => go(n.href)}
                    className="gap-3"
                  >
                    <n.icon className="h-4 w-4 text-muted-foreground" />
                    <span>{n.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {products.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading={t('admin.search.groups.products')}>
                {products.slice(0, MAX_ITEMS_PER_GROUP).map((p: any) => (
                  <CommandItem
                    key={`product-${p.id}`}
                    value={`product ${p.name}`}
                    onSelect={() => goDetail(routes.gooseeAdmin.products.getHref(locale), p.id)}
                    className="gap-3"
                  >
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 truncate">{p.name}</span>
                    {typeof p.price === 'number' && (
                      <span className="text-xs text-muted-foreground">
                        {new Intl.NumberFormat(locale, {
                          style: 'currency',
                          currency: 'EUR',
                          maximumFractionDigits: 2,
                        }).format(p.price)}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {categories.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading={t('admin.search.groups.categories')}>
                {categories.slice(0, MAX_ITEMS_PER_GROUP).map((c: any) => (
                  <CommandItem
                    key={`category-${c.id}`}
                    value={`category ${c.name}`}
                    onSelect={() => go(routes.gooseeAdmin.categories.getHref(locale))}
                    className="gap-3"
                  >
                    <Tags className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 truncate">{c.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {admins.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading={t('admin.search.groups.users')}>
                {admins.slice(0, MAX_ITEMS_PER_GROUP).map((u: any) => {
                  const name = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email;
                  return (
                    <CommandItem
                      key={`admin-${u.id}`}
                      value={`user ${name} ${u.email}`}
                      onSelect={() => goDetail(routes.gooseeAdmin.users.getHref(locale), u.id)}
                      className="gap-3"
                    >
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 truncate">{name}</span>
                      <span className="hidden text-xs text-muted-foreground sm:block">
                        {u.email}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </>
          )}

          {customers.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading={t('admin.search.groups.clients')}>
                {customers.slice(0, MAX_ITEMS_PER_GROUP).map((c: any) => {
                  const name = `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() || c.email;
                  return (
                    <CommandItem
                      key={`customer-${c.id}`}
                      value={`client ${name} ${c.email}`}
                      onSelect={() => goDetail(routes.gooseeAdmin.clients.getHref(locale), c.id)}
                      className="gap-3"
                    >
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 truncate">{name}</span>
                      <span className="hidden text-xs text-muted-foreground sm:block">
                        {c.email}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </>
          )}

          {orders.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading={t('admin.search.groups.orders')}>
                {orders.slice(0, 5).map((o: any) => {
                  const customer = o.customer
                    ? `${o.customer.firstName ?? ''} ${o.customer.lastName ?? ''}`.trim() ||
                      o.customer.email
                    : '';
                  return (
                    <CommandItem
                      key={`order-${o.id}`}
                      value={`order ${o.reference} ${customer}`}
                      onSelect={() => goDetail(routes.gooseeAdmin.orders.getHref(locale), o.id)}
                      className="gap-3"
                    >
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 truncate">
                        {o.reference}
                        {customer && (
                          <span className="text-muted-foreground"> · {customer}</span>
                        )}
                      </span>
                      {typeof o.total === 'number' && (
                        <span className="text-xs text-muted-foreground">
                          {new Intl.NumberFormat(locale, {
                            style: 'currency',
                            currency: 'EUR',
                            maximumFractionDigits: 2,
                          }).format(o.total)}
                        </span>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </>
          )}

          {pages.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading={t('admin.search.groups.pages')}>
                {pages.slice(0, MAX_ITEMS_PER_GROUP).map((p: any) => (
                  <CommandItem
                    key={`page-${p.id}`}
                    value={`page-edit ${p.title}`}
                    onSelect={() =>
                      go(routes.gooseeAdmin.pagesEdit.getHref(locale, p.id))
                    }
                    className="gap-3"
                  >
                    <Layers className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 truncate">{p.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {rolesData.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading={t('admin.search.groups.roles')}>
                {rolesData.slice(0, MAX_ITEMS_PER_GROUP).map((r: any) => (
                  <CommandItem
                    key={`role-${r.id ?? r.name}`}
                    value={`role ${r.name}`}
                    onSelect={() => go(routes.gooseeAdmin.roles.getHref(locale))}
                    className="gap-3"
                  >
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 truncate">{r.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
