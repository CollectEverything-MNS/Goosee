'use client';

import { ExternalLink, Loader2, Settings } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { getAdminMenu } from '@/config/menu-admin.config';
import { routes } from '@/config/routes.config';
import { useSettings } from '@/features/personnalisation/settings/usecases/use-get-settings';
import { useAuth } from '@/providers/auth-provider';

export function AdminSidebar() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const menu = getAdminMenu();
  const { data: settings, isLoading, dataUpdatedAt } = useSettings();
  const { canAccess } = useAuth();

  const logoSrc = settings?.logoUrl
    ? `${settings.logoUrl}${settings.logoUrl.includes('?') ? '&' : '?'}v=${dataUpdatedAt}`
    : undefined;

  const filteredMenu = menu
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.pageKey || canAccess(item.pageKey)),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <Sidebar collapsible="icon" className="border-r-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link href={routes.gooseeAdmin.dashboard.getHref(locale)} className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-sidebar-foreground" />
            ) : logoSrc ? (
              <img src={logoSrc} alt={settings?.title || 'Logo'} className="h-7 w-7 object-contain" />
            ) : (
              <span className="text-lg font-bold text-sidebar-primary">
                G<span className="text-[hsl(var(--admin-accent))]">.</span>
              </span>
            )}
          </div>
          <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold uppercase tracking-wide text-sidebar-primary">
              {settings?.title || 'Goosee'}
            </span>
            <span className="truncate text-xs text-sidebar-foreground/60">
              {t('admin.sidebar.tagline')}
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        {filteredMenu.map((section) => (
          <SidebarGroup key={section.section}>
            <SidebarGroupLabel className="px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/40">
              {t(section.section)}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const active = pathname?.startsWith(item.path) ?? false;
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={t(item.name)}
                        className="h-9 gap-3 rounded-md px-2 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-primary data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:[&>span]:hidden"
                      >
                        <Link href={item.path}>
                          <item.icon className="h-4 w-4" />
                          <span>{t(item.name)}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-2 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip={t('admin.sidebar.viewSite')}
              className="h-9 gap-3 rounded-md px-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-primary group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:[&>span]:hidden"
            >
              <Link href={`/${locale}`} target="_blank">
                <ExternalLink className="h-4 w-4" />
                <span>{t('admin.sidebar.viewSite')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {canAccess('settings') && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname?.startsWith(routes.gooseeAdmin.settings.getHref(locale)) ?? false}
                tooltip={t('admin.sidebar.personnalisation.settings')}
                className="h-9 gap-3 rounded-md px-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-primary data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:[&>span]:hidden"
              >
                <Link href={routes.gooseeAdmin.settings.getHref(locale)}>
                  <Settings className="h-4 w-4" />
                  <span>{t('admin.sidebar.personnalisation.settings')}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
