'use client';

import { ChevronDown, HelpCircle, LogOut, Settings } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRoleLabel } from '@/features/users/data/roles.data';
import { useAuth } from '@/providers/auth-provider';

import { AdminModalSettings } from './admin-modal-settings/admin-modal-settings';
import { AdminSupportModal } from './admin-modal-settings/admin-modal-support';

export function AdminProfileDropdown() {
  const t = useTranslations();
  const { user, logout } = useAuth();
  const getRoleLabel = useRoleLabel();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() ||
      user.email[0].toUpperCase()
    : '?';

  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim() || user.email
    : '';

  const primaryRoleKey = user?.roles && user.roles.length > 0 ? user.roles[0] : '';
  const primaryRole = primaryRoleKey ? getRoleLabel(primaryRoleKey) : '';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/60">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground/90 text-xs font-semibold text-background">
            {initials}
          </div>
          <div className="hidden text-left sm:block">
            <div className="text-sm font-semibold leading-tight">{displayName}</div>
            {primaryRole && (
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {primaryRole}
              </div>
            )}
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setSettingsOpen(true)}>
            <Settings className="h-4 w-4" />
            {t('admin.profileDropdown.settings')}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setSupportOpen(true)}>
            <HelpCircle className="h-4 w-4" />
            {t('admin.profileDropdown.support')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => logout()}>
            <LogOut className="h-4 w-4" />
            {t('admin.profileDropdown.logout')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AdminModalSettings open={settingsOpen} onOpenChange={setSettingsOpen} />
      <AdminSupportModal open={supportOpen} onOpenChange={setSupportOpen} />
    </>
  );
}
