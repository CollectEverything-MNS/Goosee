'use client'

import * as React from 'react'
import Link from 'next/link'

import { ChevronRight, Loader2, LogOut, LucideIcon } from 'lucide-react'
import { routes } from '@/config/routes.config'
import { usePathname } from 'next/navigation'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { getAdminMenu } from '@/config/menu-admin.config'
import { useLocale, useTranslations } from 'next-intl'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useSettings } from '@/features/personnalisation/settings/usecases/use-get-settings'
import { useAuth } from '@/providers/auth-provider'

type TItem = {
  name: string
  path?: string
  icon?: LucideIcon
  pageKey?: string
}

export function AdminSidebar() {
  const t = useTranslations()
  const locale = useLocale()
  const pathname = usePathname()
  const menu = getAdminMenu()
  const { data: settings, isLoading, dataUpdatedAt } = useSettings()
  const { canAccess, logout } = useAuth()
  const logoSrc = settings?.logoUrl
    ? `${settings.logoUrl}${settings.logoUrl.includes('?') ? '&' : '?'}v=${dataUpdatedAt}`
    : undefined

  const filteredMenu = menu
    .map((group) => {
      if (group.items) {
        const filteredItems = group.items.filter(
          (item: TItem) => !item.pageKey || canAccess(item.pageKey)
        )
        if (filteredItems.length === 0) return null
        return { ...group, items: filteredItems }
      }
      if (group.pageKey && !canAccess(group.pageKey)) return null
      return group
    })
    .filter(Boolean)

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="flex h-14 items-center gap-3 p-0">
              <Link
                href={routes.gooseeAdmin.dashboard.getHref(locale)}
                className="flex items-center justify-center gap-3 px-4"
              >
                {isLoading ? (
                  <Loader2 className="h-full animate-spin text-muted-foreground" />
                ) : (
                  <>
                    {logoSrc ? (
                      <img
                        src={logoSrc}
                        alt={settings?.title || 'Logo'}
                        className="h-10 w-auto object-contain"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-[#043e52] dark:text-white">
                        Goos<span className="text-[#fea341]">ee</span>
                      </span>
                    )}
                  </>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {filteredMenu.map((group: any) => {
              const hasChildren = Array.isArray(group.items) && group.items.length > 0
              const isGroupActive =
                hasChildren &&
                group.items!.some(
                  (item: TItem) => item.path && pathname && pathname.startsWith(item.path)
                )

              return (
                <SidebarMenuItem key={group.name || group.title}>
                  {hasChildren ? (
                    <Collapsible defaultOpen={isGroupActive}>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="group flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {group.icon && <group.icon className="h-4 w-4" />}
                            {group.title && (
                              <span className="text-sm font-medium">{t(group.title)}</span>
                            )}
                          </div>

                          <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {group.items?.map((item: TItem) => {
                            const active =
                              item.path && pathname ? pathname.startsWith(item.path) : false

                            return (
                              <SidebarMenuSubItem key={item.name}>
                                <SidebarMenuSubButton asChild isActive={active}>
                                  <Link href={item.path || '#'} className="flex items-center gap-3">
                                    {item.icon && (
                                      <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                                    )}
                                    <span className="text-sm">{t(item.name)}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === group.path}
                      className="flex items-center gap-3"
                    >
                      <Link href={group.path || '#'}>
                        {group.icon && <group.icon className="h-4 w-4" />}
                        {group.name && <span className="text-sm">{t(group.name)}</span>}
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-sidebar-accent p-2">
        <button
          onClick={() => logout()}
          className="flex w-full items-center justify-center gap-2 rounded-md p-4 text-sm font-medium hover:bg-sidebar-accent"
        >
          <LogOut size={20} /> {t('admin.sidebar.logout')}
        </button>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
